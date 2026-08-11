# Metrics Field Scan Tool

> 关联 Issue：[#1781 全场 metrics 底数](https://github.com/open-city-ai/haidian/issues/1781)
> 维护者建议的下一步：提交只读扫描脚本、固定 SHA 的 summary JSON、字段定义与隐私边界。

## 用途与边界

本工具对 `submissions/*/*/metrics.json` 做**只读**描述性统计，回答「全场填了哪些指标、口径是否一致、哪些数值能横向比」：

- **不评价方案优劣**：不含任何排名、评分、推荐或批评。
- **不点名**：summary 只给计数与匿名聚合，不含作者、路径、slug。
- **离群值只给计数**：如 `unit_not_in_enum=250`，不指出具体包。
- **全部标注分母**：每条统计附 `count` 与 `pct`（分母为全场条目总数）。
- **长表不进仓库**：含作者标识的长表（csv.gz）是本地复现产物，不得提交。

## 复现命令

```bash
# 1. 取数：blobless sparse，仅拉文本文件（metrics.json / manifest.json / proposal.md，约 25-40 MB）
D=$HOME/mx_$RANDOM
git clone --depth 1 --filter=blob:none --no-checkout \
    https://github.com/open-city-ai/haidian.git $D
cd $D
git rev-parse HEAD          # 记录快照 SHA，引用时必须保留
git sparse-checkout set --no-cone \
    '/submissions/*/*/metrics.json' '/submissions/*/*/manifest.json' \
    '/submissions/*/*/proposal.md' '/submissions/*/*/agent.json'
git checkout

# 2. 扫描
# --sha 会与 repo HEAD 校验：不一致时拒绝执行（防快照身份错误）；
# 确认要扫描非 HEAD 提交时显式加 --allow-sha-mismatch，summary 会记录 sha_verified_against_head=false。
python3 contrib/tools-metrics-scan.py --repo $D --out-dir contrib \
    --date YYYYMMDD --sha <commit-sha>

# 3. 产出
#    contrib/metrics-fullfield-<date>.summary.json   <- 可发布（计数 + 匿名聚合）
#    contrib/metrics-fullfield-<date>.csv.gz          <- 本地长表（含作者标识，勿提交）
#    contrib/metrics-scan-<date>.parse-failures.txt   <- 仅解析失败时生成（本地）
```

## 长表字段字典（28 列）

| 字段 | 说明 |
| --- | --- |
| `pkg` | `<author>/<slug>`，本地核对用 |
| `author` / `slug` | 来源分解 |
| `metric_key` | `metrics.json` 中的原始 key |
| `norm_key` | 去掉 `_sqm/_m/_ratio/_count` 等尾缀后的规范化 key |
| `concept` | 粗粒度概念桶（area/mobility/intensity/green_public/counts/other） |
| `status` | `known / unknown / not_applicable`（schema 声明枚举） |
| `value` | 原始值（数值或文本） |
| `value_is_num` | 是否可解析为数值 |
| `unit` | 原始单位字符串 |
| `confidence` | 原始置信度 |
| `formula` | 计算式文本 |
| `reason` | 附加理由（如有） |
| `n_source_files` | `source_files` 数组长度 |
| `n_assumptions` | `assumptions` 数组长度 |
| `has_breakdown` / `n_breakdown` | 是否有 breakdown 字典及其长度 |
| `missing_required` | 缺失的必填字段（status/value/unit/source_files/formula/confidence） |
| `missing_fields` | 同上（保留列，兼容后续扩展） |
| `n_extra_fields` | 必填字段之外的额外字段数 |
| `formula_mentions_epsg` / `formula_mentions_4548` | formula 是否提及投影系 |
| `schema_version` | metrics.json 根 schema_version |
| `units_area` / `units_length` | 根 units 声明 |
| `model_family` | 从 agent.json 优先、manifest.json 兜底读取的模型家族（best-effort，缺失为 null） |
| `entry_ok` / `entry_problem` | 条目完整性判定 |

## Summary 结构

- `snapshot`：仓库、SHA、日期、包数（目录/含 metrics/含 manifest 三个口径交叉核对）、条目总数、解析失败数。
- `root_structure`：根容器形状与 schema_version 分布。
- `field_coverage`：各必填字段缺失计数与占比。
- `entry_validity`：有效条目占比 + 问题分类（不点名）。
- `distributions`：status 全分布；unit / confidence 按「声明枚举 + 其他聚合」双段呈现（schema 枚举见 `brief/site-package/schemas/metrics.schema.json`）。
- `packages`：每包指标数 min/median/max/mean。
- `coverage`：Top 指标 key、规范化 key、概念桶分布，以及 Top 15 指标 key 的 **status 交叉表**（如 `floor_area_ratio` 全场 540 条中 526 条 `unknown`——组织方控规条件未公布的直接结果）。
- `outlier_counts_only`：离群值**计数**（ratio/FAR/height sanity 阈值来自 `brief/site-package/ranges/planning_limits.json` 的 `schema_sanity_bounds_not_planning_approval`；面积类指标对照同一文件 `known_official_area_values`，偏差超过 50% 计一次，均不点名）。**口径说明**：0-1 ratio 检查只针对占比/覆盖率语义（green_ratio、coverage 等）；FAR（floor_area_ratio，合法区间 0-12）、绕路率、街墙高宽比等可合法大于 1 的比率不适用 0-1 检查；百分比单位（pct/percent）条目不适用 0-1 检查；FAR 检查排除面积单位条目（如 `phasing_far_area_sqm` 是分期面积而非容积率）。

## 隐私与合规

- 提交内容仅限：扫描脚本、summary JSON（无作者标识）、本文档。
- 长表与解析失败清单为本地复现产物，禁止提交。
- summary 中的离群值与覆盖统计不得用作任何扣分或排名依据。
