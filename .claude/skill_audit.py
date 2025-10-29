#!/usr/bin/env python3
"""
技能健康自检脚本。

参考 docs/claude/skills.md 的最佳实践，对项目内全部 SKILL.md 做以下检查：
1. Frontmatter 必须包含 name、description，且描述同时说明能力与触发场景。
2. Markdown 正文需包含关键章节（适用场景、前置准备、操作步骤、质量校验、失败与回滚、交付物）。
3. 汇总缺少 allowed-tools 的技能（仅提示，需人工判断是否限制工具）。
"""
from __future__ import annotations

import sys
from pathlib import Path
from typing import Dict, List, Tuple

ROOT = Path(__file__).resolve().parent
SKILL_ROOT = ROOT / "skills"

REQUIRED_HEADINGS = [
    "## 适用场景",
    "## 前置准备",
    "## 操作步骤",
    "## 质量校验",
    "## 失败与回滚",
    "## 交付物",
]

TRIGGER_TOKENS = ("使用", "适用", "用于", "当", "场景", "Use", "when")


def iter_skill_files() -> List[Path]:
    if not SKILL_ROOT.exists():
        raise FileNotFoundError(f"未找到技能目录：{SKILL_ROOT}")
    return sorted(SKILL_ROOT.rglob("SKILL.md"))


def parse_frontmatter(path: Path) -> Tuple[Dict[str, str], str]:
    """
    返回 (frontmatter dict, 全文内容)。
    前置：SKILL.md 使用 YAML frontmatter，首行与结束行均为 '---'。
    """
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    frontmatter: Dict[str, str] = {}
    if lines and lines[0].strip() == "---":
        idx = 1
        while idx < len(lines):
            line = lines[idx]
            if line.strip() == "---":
                idx += 1
                break
            if ":" in line:
                key, value = line.split(":", 1)
                frontmatter[key.strip()] = value.strip()
            idx += 1
    return frontmatter, text


def main() -> None:
    try:
        skill_files = iter_skill_files()
    except Exception as exc:  # noqa: BLE001
        print(f"[致命] {exc}", file=sys.stderr)
        sys.exit(1)

    missing_fields: List[Tuple[Path, List[str]]] = []
    weak_description: List[Tuple[Path, str]] = []
    missing_headings: List[Tuple[Path, List[str]]] = []
    missing_allowed: List[Tuple[Path, str]] = []

    for skill in skill_files:
        frontmatter, content = parse_frontmatter(skill)
        rel = skill.relative_to(ROOT)
        fields_missing: List[str] = []
        name = frontmatter.get("name", "")
        description = frontmatter.get("description", "")
        if not name:
            fields_missing.append("name")
        if not description:
            fields_missing.append("description")

        if fields_missing:
            missing_fields.append((rel, fields_missing))

        normalized = description.replace(" ", "")
        if len(normalized) < 12 or not any(token in normalized for token in TRIGGER_TOKENS):
            weak_description.append((rel, description))

        missing = [heading for heading in REQUIRED_HEADINGS if heading not in content]
        if missing:
            missing_headings.append((rel, missing))

        allowed = frontmatter.get("allowed-tools", "")
        if not allowed:
            missing_allowed.append((rel, allowed))

    total = len(skill_files)
    print(f"[信息] 共审计技能 {total} 个。")

    if missing_fields:
        print("\n[错误] 以下技能缺少必填 frontmatter 字段：")
        for rel, fields in missing_fields:
            joined = "、".join(fields)
            print(f"  - {rel}: 缺少 {joined}")

    if weak_description:
        print("\n[提示] 以下技能的 description 可能缺乏触发语境，请复核：")
        for rel, description in weak_description:
            snippet = description if description else "（未填写）"
            print(f"  - {rel}: {snippet}")

    if missing_headings:
        print("\n[提示] 以下技能正文缺少推荐章节：")
        for rel, headings in missing_headings:
            joined = "、".join(headings)
            print(f"  - {rel}: 缺少 {joined}")

    if missing_allowed:
        print("\n[提示] 以下技能尚未声明 allowed-tools（如需限制工具权限请补充）：")
        for rel, allowed in missing_allowed:
            present = allowed or ""
            print(f"  - {rel}（当前值：\"{present}\"）")

    if not any((missing_fields, weak_description, missing_headings)):
        print("\n[信息] 全部技能符合基础结构检查。")


if __name__ == "__main__":
    main()
