#!/usr/bin/env python
"""Generate all Africa mine detail-page shells from data/mines_v2.json.

The content and facts live in data/mines_v2.json; mine-page.js renders the
Wodgina-inspired eight-section research structure. Run from this directory:
    python build_mine_pages.py
"""
from __future__ import annotations
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA = json.loads((ROOT / "data" / "mines_v2.json").read_text(encoding="utf-8"))

SHELL = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="{desc}">
<title>{title} ｜ 全球非澳洲锂矿供应梳理</title>
<link rel="stylesheet" href="mine-page.css">
<script src="https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js"></script>
</head>
<body data-mine="{key}">
<main class="wrap" id="app">
  <div class="mine-block"><div class="cat">正在加载 {title} 研究页…</div></div>
</main>
<script src="mine-page.js"></script>
</body>
</html>
"""

for key, mine in DATA["mines"].items():
    page = ROOT / mine["page"]
    desc = f"{mine['name']}：运行状况、历史数据、2027预测、采选产能核实、卫星定位与配套冶炼项目跟踪"
    page.write_bytes(SHELL.format(key=key, title=mine["name"], desc=desc).encode("utf-8"))
    print(f"generated {page.name}")

print(f"done: {len(DATA['mines'])} pages")
