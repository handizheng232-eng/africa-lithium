# 全球非澳洲锂矿供应梳理 · 非洲锂矿项目总览

非洲（马里 / 津巴布韦 / 尼日利亚 / 刚果金 / 加纳）20 个锂矿项目的可核查研究网站，
参照《永安期货 · 澳洲锂矿季度汇总》页面架构构建。

## 页面

| 文件 | 内容 |
|---|---|
| `index.html` | 入口（自动跳转总览） |
| `overview.html` | **总览**：KPI + 产能产量汇总表 + 2028E 预测（4 图）+ 项目卡片 + 投资汇总 + 指标对比 |
| `goulamina.html` | Goulamina 锂矿（马里 · 赣锋锂业） |
| `bougouni.html` | Bougouni 锂矿（马里 · Kodal / 海南矿业） |
| `manono.html` | Manono 锂矿（刚果金 · 紫金矿业） |
| `arcadia.html` | Arcadia 锂矿（津巴布韦 · 华友钴业） |
| `bikita.html` | Bikita 锂矿（津巴布韦 · 中矿资源） |
| `kamativi.html` | Kamativi 多金属矿（津巴布韦 · 雅化集团） |
| `sabistar.html` | Sabi Star 锂钽矿（津巴布韦 · 盛新锂能） |
| `zulu.html` | Zulu 锂钽矿（津巴布韦 · Premier African Minerals / 天华新能） |
| `sandawana.html` | Sandawana 矿场（津巴布韦 · Kuvimba / Mutapa 国有） |
| `ewoyaa.html` | Ewoyaa 锂矿（加纳 · Atlantic Lithium / 华友拟收购） |
| `nigeria.html` | 尼日利亚 5 小矿（合并，披露薄弱） |

## 详情页统一架构

每个矿山分页面均参照 Wodgina 页面，统一为：

1. 已有产线运行状况（最新披露期 vs 上一可比期）
2. 在建 / 规划中产线运行状况（严格区分可研、FID、开工、投产）
3. 整体运行状况与超预期要点
4. 历史数据（按真实披露频率，不制造季度数据）
5. 2027 年产量三情景预测
6. 选矿产能多来源核实
7. 原矿产能、资源 / 储量与卫星定位核实
8. 配套冶炼 / 转化项目（硫酸锂 / 锂盐）解析与跟踪

共享数据与渲染文件：

- `data/mines_v2.json`：11 页结构化研究数据与来源；
- `mine-page.js` / `mine-page.css`：统一渲染与视觉模板；
- `build_mine_pages.py`：生成 11 个详情页入口壳。

更新数据后运行：

```bash
python build_mine_pages.py
python -m http.server 8765
```

再访问 `http://localhost:8765/overview.html`；不要用 `file://`，否则 JSON 和地图 iframe 会被浏览器拦截。

## 数据口径

- **年度口径**：非洲矿山披露粒度多为年度/半年度（仅 Bougouni 为季度 RNS），故总览为年度表。
- **不做 SC6 等效折算**：产品口径不统一（SC6 / SC5.5 / 透锂长石 / 混合精矿），强行折算会失真；
  以披露口径原文呈现并逐项标注。
- **预测年取 2028E**：多数项目 2027 年才投产，2028 才是可比满产年。
- 产量/产能为 100% 资产口径；经济权益按公司持股比例折算。
- 标记「待核实」的项目不建议用于供给测算。

## 坐标与卫星影像

每个矿山详情页含「🛰️ 卫星影像与地图定位」板块，坐标经 OpenStreetMap 矿区多边形 /
Mindat / Wikipedia / 官方钻探坐标交叉验证，并附 Google Maps / Yandex / OSM 直达链接。

## 数据源

各矿山母公司官方年报/季报（赣锋锂业 / 中矿资源 / 华友钴业 / 雅化集团 / 盛新锂能 /
Kodal Minerals RNS / Premier African Minerals / 紫金矿业 / Atlantic Lithium / Kuvimba）
+ 交易所公告 + Reuters / SMM / Mysteel 等媒体核实。

> 仅供研究参考，不构成投资建议。
