"""Test all error codes. Usage: python3 test_errors.py"""
import os, sys, time, json, urllib.request, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
ENV = ROOT / ".env.local"
URL = "http://127.0.0.1:8000/api/admin/error-state"

def admin_token():
    if not ENV.exists(): return None
    for line in ENV.read_text().splitlines():
        if line.startswith("JST_ADMIN_TOKEN="):
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    return None

CODES = [
    ("OFFLINE",        "Wi-Fi off scenario"),
    ("NO_INTERNET",    "No internet at all"),
    ("WEAK_INTERNET",  "Slow or unstable connection"),
    ("VPN_UNSTABLE",   "VPN connection unstable"),
    ("SERVICE_ERROR",  "Required service down"),
    ("SERVER_ERROR",   "Server returned error"),
    ("CLEAR_CACHE",    "Client should clear cache"),
    ("MAINTENANCE",    "Under maintenance"),
    ("NOT_FOUND_404",  "Page not found"),
    ("TIMEOUT",        "Request timeout"),
    ("UNKNOWN",        "Unknown error"),
]

def set_error(token, code, msg):
    data = json.dumps({"code": code, "message": msg, "source": "test"}).encode()
    req = urllib.request.Request(URL, data=data, method="POST")
    req.add_header("X-Admin-Token", token)
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=5) as r:
            return json.loads(r.read())
    except Exception as e:
        return {"error": str(e)}

def clear_error(token):
    req = urllib.request.Request(URL, method="DELETE")
    req.add_header("X-Admin-Token", token)
    try:
        with urllib.request.urlopen(req, timeout=5) as r:
            return json.loads(r.read())
    except Exception as e:
        return {"error": str(e)}

def main():
    token = admin_token()
    if not token:
        print("ERROR: JST_ADMIN_TOKEN not found in .env.local")
        sys.exit(1)

    print(f"Testing {len(CODES)} error codes...\n")
    print("Open http://127.0.0.1:8000/ in browser to see overlay.\n")

    for i, (code, desc) in enumerate(CODES, 1):
        print(f"[{i}/{len(CODES)}] {code:20s} — {desc}")
        result = set_error(token, code, f"Test: {desc}")
        if "error" in result:
            print(f"         FAILED: {result['error']}")
            continue
        print(f"         Set. Overlay should show.")
        print(f"         Waiting 4s...")
        time.sleep(4)

    print("\nClearing last error...")
    clear_error(token)
    print("Done.")
    print("\nTo test manually:")
    print(f'  curl -X POST {URL} -H "X-Admin-Token: {token[:8]}..." -H "Content-Type: application/json" -d \'{{"code":"OFFLINE","message":"test","source":"manual"}}\'')

if __name__ == "__main__":
    main()
