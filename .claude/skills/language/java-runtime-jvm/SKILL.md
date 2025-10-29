---
name: java-runtime-jvm
description: 管理 JVM 运行时、内存、GC 与性能调优，适用于 Java 服务部署与排障。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Bash(*), Glob(*), Grep(*), TodoWrite
---

# JVM 运行时技能

## 适用场景

- 确认 JDK 版本、发行版（OpenJDK/Azul/Oracle）与模块。
- 调优内存、GC、线程，排查 OOM、停顿、性能问题。
- 部署 Spring/微服务时配置 JVM 参数、诊断运行时指标。

## 前置准备

- 使用 `sdkman`/`asdf` 管理 JDK；确认 `java -version` 输出。
- 获取启动脚本或容器镜像中的 JVM 参数。
- 准备 `jcmd`, `jmap`, `jstack`, `jconsole` 等工具。

## 操作步骤

1. **环境确认**
   - `java -XshowSettings:properties -version` 查看配置。
   - 记录 `JAVA_HOME`、`PATH`、`CLASSPATH`。
2. **内存与 GC**
   - 设置堆：`-Xms`, `-Xmx`；元空间：`-XX:MetaspaceSize`。
   - 选择 GC：G1 (`-XX:+UseG1GC`)、ZGC、Shenandoah；根据延迟/吞吐需求决定。
   - 打开 GC 日志：`-Xlog:gc*:file=logs/gc.log`.
3. **诊断工具**
   - 线程 dump：`jstack <pid>`，排查死锁。
   - 堆 dump：`jmap -dump:live,file=heap.hprof <pid>`；使用 Eclipse MAT 分析。
   - `jcmd <pid> VM.native_memory summary` 诊断本地内存。
4. **性能监控**
   - 使用 `jstat -gc <pid> 5s` 观察 GC 指标。
   - JFR：`jcmd <pid> JFR.start name=profile duration=60s settings=profile`.
   - 结合 Prometheus JMX Exporter 导出指标。
5. **部署参数模板**

   ```bash
   java -Xms512m -Xmx512m \
        -XX:+UseG1GC -XX:MaxGCPauseMillis=200 \
        -XX:+HeapDumpOnOutOfMemoryError \
        -XX:HeapDumpPath=/var/log/app.hprof \
        -jar app.jar
   ```

   - Docker：设置 `-XX:InitialRAMPercentage`、`-XX:MaxRAMPercentage`。

## 质量校验

- 运行 `./gradlew test` 或 `mvn test` 确认 JVM 参数不影响功能。
- 监控 GC 日志，确保停顿与吞吐满足 SLA。
- 执行压力测试，观察 CPU、内存、响应时间。

## 失败与回滚

- GC 调整导致停顿增加：恢复默认参数，保留 GC 日志以分析。
- JDK 升级兼容性问题：回退至上一稳定版本并记录差异。
- Heap Dump 过大：清理旧 dump，避免磁盘占满。

## 交付物

- JVM 参数表、GC 策略说明。
- 监控/压测报告、问题根因分析。
- 回滚策略及日志采集指南。
