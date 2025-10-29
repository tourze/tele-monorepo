---
name: scenario-php-easyadmin-crud
description: 生成并完善 EasyAdmin CRUD，遵循分层与质量门要求。
---

# EasyAdmin CRUD 技能

## 适用场景
- 在 Symfony + EasyAdmin 项目中创建或补全后台 CRUD。
- 需要保持贫血模型、服务分层、质量门达标。

## 前置准备
- 确认实体定义、字段、关联、翻译。
- 获取设计要求（菜单结构、权限、帮助文本）。
- 准备质量门命令：PHPStan、PHP-CS-Fixer、PHPUnit。

## 操作步骤
1. **范围确认**
   - 列出目标实体，确认表单字段、显示字段、筛选器、权限。
2. **生成骨架**
   - 使用命令生成 CrudController、Service、菜单。
   - 若 `--no-service`，确保业务逻辑在其他层完成。
3. **配置定制**
   - 设置字段类型、标签、帮助文本、验证。
   - 配置操作（创建/编辑/导出），限制敏感操作。
   - 菜单分组、图标、排序。
4. **质量门**
   - 运行 PHP-CS-Fixer、PHPStan、PHPUnit（含 CRUD 测试）。
   - 检查翻译、权限注解、路由是否正确。
5. **文档与交付**
   - 更新 README/指南，记录菜单结构、权限说明。
   - 输出变更清单与验证记录。

## 经验沉淀
- EasyAdmin 的 `TextField`/`TextareaField` 期望字符串，绑定 JSON/array 会触发 `TextConfigurator` 的强制字符串转换异常。优先在实体里提供 `getFooAsJson()` 等只读方法，并在 CRUD 控制器使用 `TextareaField::new('fooAsJson') ->onlyOnDetail()` 展示。
- 若字段无需编辑，可限制 `onlyOnDetail()` 或 `hideOnForm()`，避免 EasyAdmin 在表单阶段把数组注入输入组件导致类型错误。
- JSON 展示时使用 `json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT)`，空数组/编码失败时返回空字符串，防止界面显示 `null` 或抛异常。

## 质量校验
- CrudController、Service、Menu 代码符合分层。
- 质量门通过，测试覆盖关键操作。
- 配置无硬编码机密，权限控制清晰。
- 符合 UI/UX 要求（标签、帮助、排序）。

## 失败与回滚
- 质量门失败：修复代码或配置，重新运行。
- 分层违规：将业务逻辑移回 Service。
- 功能异常：编写修复测试，确认问题解决。

## 交付物
- CrudController/Service/Menu 源码与测试。
- 质量门输出、测试报告。
- 菜单与权限文档、使用说明。
