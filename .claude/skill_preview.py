#!/usr/bin/env python3
"""
遍历 .claude/skills 目录，读取所有 SKILL.md 的元数据并输出 Markdown 预览。
输出用于非 Claude Code 环境快速了解技能列表。
"""
from __future__ import annotations

import sys
from pathlib import Path
from typing import Dict, List, Tuple

ROOT = Path(__file__).resolve().parent / "skills"


def parse_skill(path: Path) -> Tuple[str, str, str]:
    """解析 SKILL.md，返回 (类别, 名称, 描述)。"""
    rel_parts = path.relative_to(ROOT).parts
    category = rel_parts[0] if rel_parts else "unknown"
    name = ""
    description = ""
    lines = path.read_text(encoding="utf-8").splitlines()
    if not lines or lines[0].strip() != "---":
        return category, name, description
    idx = 1
    while idx < len(lines):
        line = lines[idx]
        if line.strip() == "---":
            idx += 1
            break
        if ":" in line:
            key, value = line.split(":", 1)
            key = key.strip()
            value = value.strip()
            if key == "name":
                name = value
            elif key == "description":
                description = value
        idx += 1
    return category, name, description


def collect_skills() -> Dict[str, List[Tuple[str, str, str]]]:
    """按类别收集所有技能，列表元素包含 (相对路径, name, description)。"""
    if not ROOT.exists():
        print("未找到技能目录：", ROOT, file=sys.stderr)
        sys.exit(1)
    groups: Dict[str, List[Tuple[str, str, str]]] = {}
    for skill_file in sorted(ROOT.rglob("SKILL.md")):
        category, name, description = parse_skill(skill_file)
        rel_path = skill_file.relative_to(Path(__file__).resolve().parent)
        entry = (str(rel_path), name, description)
        groups.setdefault(category, []).append(entry)
    return groups


def emit_markdown(groups: Dict[str, List[Tuple[str, str, str]]]) -> None:
    """输出 Markdown 文本。"""
    print("# Skill Preview\n")
    print("> 由 `.claude/skill_preview.py` 自动生成。按类别列出所有技能及其描述。\n")
    for category in sorted(groups):
        skills = groups[category]
        if not skills:
            continue
        print(f"## {category}\n")
        print("| 技能路径 | name | description |")
        print("| --- | --- | --- |")
        for rel_path, name, description in skills:
            nice_name = name or Path(rel_path).parent.name
            desc = description or ""
            print(f"| `{rel_path}` | {nice_name} | {desc} |")
        print()


def main() -> None:
    groups = collect_skills()
    emit_markdown(groups)


if __name__ == "__main__":
    main()
