---
name: php-symfony-controller-backoffice
description: 实现 Symfony 后台控制器与界面逻辑，聚焦路由、表单、认证授权、响应渲染与可测试性。
---

# Symfony 后台控制器技能

## 适用场景
- 为后台/运营端构建 CRUD、仪表盘、配置管理界面。
- 管理路由、模板、表单、Flash Message、权限校验。
- 结合服务层、视图层、Twig/UX 组件开发可维护的后台模块。

## 前置准备
- 确认路由前缀、命名空间（如 `App\Controller\Admin`）。
- 配置后台安全策略（角色、Guard、防护）。
- 熟悉 `Twig`, `Form`, `Security`, `UX` 组件。

## 操作步骤
1. **路由与命名**
   - 使用 PHP Attribute：`#[Route('/admin/orders', name: 'admin_orders_index')]`.
   - 路由命名统一前缀 `admin_`，方便权限控制与链接生成。
2. **控制器结构**
   - 控制器仅负责请求解析、调用服务层、组装响应。
   - 使用 `#[IsGranted('ROLE_ADMIN')]` 或 `Security` 服务验证权限。
   - 处理 GET/POST/PUT 请求时使用 `ParamConverter`、DTO 或 Form。
3. **表单与数据绑定**
   - `FormType` 放置在 `Form/` 目录；配置字段、验证、选项。
   - 在控制器中：
     ```php
     $form = $this->createForm(OrderType::class, $order);
     $form->handleRequest($request);
     if ($form->isSubmitted() && $form->isValid()) {
         $handler->handle($form->getData());
     }
     ```
   - 处理失败状态：`addFlash('error', '保存失败')`。
4. **模板与组件**
   - Twig 模板遵循 `templates/admin/<module>/index.html.twig`。
   - 使用 Twig 组件或 Symfony UX 渐进增强。
   - 输出数据前进行转义，避免 XSS；全局开启 `autoescape`.
5. **表格/列表**
   - 分页：`Pagerfanta`, `KnpPaginator`。
   - Export：使用 `StreamedResponse`，控制内存。
   - 批量操作：在服务层处理，控制器只解析选中项。
6. **异常与日志**
   - 捕获业务异常，回显错误并设置适当 HTTP 状态。
   - 使用 `AuditLogger` 记录敏感操作（包括操作者、时间、参数）。
7. **测试**
   - 功能测试：`WebTestCase` + `Symfony\Bundle\FrameworkBundle\KernelBrowser`。
   - 使用 DOMCrawler 验证表单、按钮、重定向。
   - 若引入 JS 交互，增加 Cypress/Playwright E2E。

## 质量校验
- `phpstan`, `phpunit` 功能测试通过。
- 后台路由受限于对应角色；无越权访问。
- Twig 校验：`symfony console lint:twig`, 表单/模板一致。

## 失败与回滚
- 安全配置错误：立即回滚控制器或权限改动，修复角色策略。
- 表单提交失败：回滚最新变更并补充端到端测试。
- 模板渲染异常：恢复旧模板或使用版本控制 rollback。

## 交付物
- 路由表、权限矩阵、表单字段定义。
- 控制器与服务层交互说明。
- 测试报告（功能/E2E）、回滚与应急处理手册。
