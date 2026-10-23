"""Генератор имён для output-файлов (формат: P+YY+V+WD+NNN)."""
from __future__ import annotations
from datetime import datetime
from pathlib import Path
from .paths import OUTPUT


class NamingScheme:
    LETTER = {0:"A",1:"B",2:"C",3:"D",4:"E",5:"F",6:"G",7:"H",8:"I",9:"J"}
    CENTURY = {20:"O", 21:"P", 22:"Q"}
    def __init__(self, out_dir): self.out_dir = out_dir; out_dir.mkdir(exist_ok=True)
    def _c(self, y): return self.CENTURY.get((y-1)//100+1, "P")
    def _y(self, y): return "".join(self.LETTER[int(d)] for d in f"{y:04d}"[-2:])
    def _n(self, n): return "".join(self.LETTER[int(d)] for d in f"{n:03d}")
    def next_name(self):
        now = datetime.now()
        prefix = self._c(now.year) + self._y(now.year) + f"{int(now.strftime('%V')):02d}{now.isoweekday()}"
        cf = self.out_dir / f".counter_{prefix}.txt"
        n = 0
        if cf.exists():
            try: n = int(cf.read_text().strip())
            except ValueError: n = 0
        name = prefix + self._n(n)
        cf.write_text(str(n + 1))
        return name


NAMER = NamingScheme(OUTPUT)
