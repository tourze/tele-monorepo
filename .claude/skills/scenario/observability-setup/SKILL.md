---
name: scenario-observability-setup
description: 构建观测体系，涵盖日志、指标、Tracing 与报警策略，确保上线可观测。
---

# 观测与报警技能

## 适用场景
- 新服务上线或重大变更，需要完善 RED/USE 指标与报警。
- 复盘事故、排查性能瓶颈，需要完整观测面。
- 审核发布，确认观测面符合 `CLAUDE.md` 要求。

## 操作步骤
1. **目标指标**
   - 按 RED（Rate/Error/Duration）和 USE（Utilization/Saturation/Errors）梳理核心指标。
   - 定义业务 KPI（下单成功率、支付成功率等）。
2. **日志**
   - 使用结构化日志（JSON），字段含 timestamp、level、traceId、spanId、核心参数。
   - 对敏感数据脱敏；设置日志留存与清理策略。
   - 配置集中式收集（ELK、Loki），记录查询语句示例。
3. **指标**
   - 选择采集方式：Prometheus Exporter、StatsD、OpenTelemetry。
   - 定义命名规范：`service_endpoint_status_code_total` 等。
   - 输出仪表盘（Grafana/Datadog），分组展示核心指标。
4. **分布式追踪**
   - 启用 OpenTelemetry/Jaeger；在入口、关键链路打点。
   - 将 traceId 透传至日志与响应头，便于关联。
5. **报警策略**
   - 设置阈值与时间窗口（例如错误率 > 2% 持续 5 分钟）。
   - 定义报警渠道（Slack、PagerDuty）、升级路径。
   - 添加静音策略、工作时间/非工作时间责任人。
6. **验证**
   - 执行冒烟测试或 Chaos 工具验证报警是否触发。
   - 检查仪表盘是否实时刷新，指标是否完整。
   - 记录截图/数据，纳入发布材料。

## 质量校验
- 指标涵盖 RED/USE + 关键业务指标。
- 日志、Tracing、仪表盘均可访问，配置与环境一致。
- 报警经过演练，触发、解除流程可追溯。

## 失败与回滚
- 指标缺失：立即补采集或恢复旧监控，记录缺口。
- 报警噪音大：调整阈值或聚合策略，但保留审计。
- 观测系统故障：联络平台团队，启用备用方案（手工监控、额外日志）。

## 交付物
- 观测矩阵（指标、维度、采集方式、仪表盘链接）。
- 报警策略文档、演练记录。
- 发布验证日志、Trace 示例，确保可追踪。
