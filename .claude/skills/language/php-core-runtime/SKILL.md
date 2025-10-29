---
name: php-core-runtime
description: 掌握 PHP 运行时与环境排查流程。用于分析版本/扩展/配置异常、性能瓶颈或 FPM/CLI 行为差异。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Bash(*), Glob(*), Grep(*), TodoWrite
---

# PHP 核心运行时技能

## 适用场景

- 需要确认 PHP 版本、编译参数、已启用扩展或 `php.ini` 配置。
- 处理 FPM 进程异常、CLI 与 FPM 配置不一致、内存/超时问题。
- 定位慢请求、Opcache 行为、错误日志未生成等运行时问题。

## 前置准备

- 拥有目标主机的 SSH 访问权限与 sudo 需求评估。
- 明确运行模式（FPM/CLI/Swoole 等）与服务部署方式（Docker/K8s/裸机）。
- 保持与当前仓库的 `.env`/`.ini` 配置一致，确认是否存在环境变量覆盖。

## 操作步骤

1. **环境勘察**
   - `php -v` 查看版本与编译选项；`php --ini` 获取配置加载顺序。
   - 若使用容器，执行 `docker exec <php-container> php -i | head` 确认容器内配置。
2. **配置校验**
   - 对比 `php --ini` 列出的主配置与额外 `.ini`，重点检查：
     - `memory_limit`、`max_execution_time`、`post_max_size`、`upload_max_filesize`
     - `date.timezone`、`error_reporting`、`display_errors`、`log_errors`
   - 使用 `php --ri <extension>` 检查扩展设置（如 `opcache`、`redis`、`pdo_mysql`）。
3. **FPM 专项**
   - `php-fpm -tt` 验证配置；`systemctl status php-fpm` 或 `service php7.4-fpm status` 查看运行状态。
   - 检查 `www.conf` 中的 `pm`（静态/动态）、`pm.max_children`、`pm.max_requests`，结合访问量评估是否需要调优。
4. **性能与调试**
   - 通过 `php -d detect_unicode=0 -r "..."` 快速验证配置覆盖。
   - 慢脚本定位：启用 `slowlog`，配置 `request_slowlog_timeout`，分析 `php-fpm slow.log`。
   - Opcache：`php -r "print_r(opcache_get_status());"` 确认缓存命中与内存使用。
5. **错误日志**
   - 确保 `error_log` 指向可写路径；若无输出，检查 `log_errors`、`error_reporting` 与 SELinux/AppArmor。
   - 在 CLI 复现时使用 `php -d display_errors=1 script.php` 快速查看。

## 质量校验

- 运行 `php -m` 确认核心扩展齐全，输出中不得缺失业务所需扩展。
- 执行 `composer check-platform-reqs` 确保依赖平台要求满足。
- 对照 `CLAUDE.md` 的安全基线：验证输入校验、输出转义配置未被关闭。

## 失败与回滚

- **配置误改**：先备份原有 `php.ini`/`www.conf`，使用版本控制或 `cp file{,.bak}`。回滚时恢复备份并 reload FPM。
- **扩展缺失**：记录缺失名称、安装命令与风险评估，必要时退回到稳定镜像。
- **性能调优无效**：保留 NewRelic/Prometheus 指标对比；若指标恶化即回滚调优参数。

## 交付物

- 一份运行时勘察报告（版本、扩展、关键配置）。
- 调优或修复后的配置差异说明与验证结果（命令输出/监控截图）。
- 回滚策略与注意事项（包含重启/Reload 步骤）。
