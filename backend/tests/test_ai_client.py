"""Tests for ai/client.py — Ollama с моками urlopen."""

import json
from unittest.mock import MagicMock, patch

from backend.ai import client as ac


def test_is_available_no_server():
    with patch("backend.ai.client.urllib.request.urlopen", side_effect=ConnectionError):
        assert ac.is_available() is False


def test_is_available_200():
    m = MagicMock()
    m.status = 200
    m.__enter__ = MagicMock(return_value=m)
    m.__exit__ = MagicMock(return_value=False)
    with patch("backend.ai.client.urllib.request.urlopen", return_value=m):
        assert ac.is_available() is True


def test_generate_no_server():
    with patch("backend.ai.client.is_available", return_value=False):
        assert ac.generate("hello") is None


def test_generate_returns_response():
    payload = json.dumps({"response": "ответ модели"}).encode()
    m = MagicMock()
    m.read = MagicMock(return_value=payload)
    m.__enter__ = MagicMock(return_value=m)
    m.__exit__ = MagicMock(return_value=False)
    with (
        patch("backend.ai.client.is_available", return_value=True),
        patch("backend.ai.client.urllib.request.urlopen", return_value=m),
    ):
        r = ac.generate("привет")
        assert r == "ответ модели"


def test_generate_error_returns_none():
    with (
        patch("backend.ai.client.is_available", return_value=True),
        patch("backend.ai.client.urllib.request.urlopen", side_effect=Exception("net")),
    ):
        assert ac.generate("x") is None
