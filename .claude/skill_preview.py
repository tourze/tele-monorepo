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


def parse_skill(path: Path) -> Tuple[str, Dict[str, str]]:
    """解析 SKILL.md，返回 (类别, frontmatter)。"""
    rel_parts = path.relative_to(ROOT).parts
    category = rel_parts[0] if rel_parts else "unknown"
    metadata: Dict[str, str] = {}
    lines = path.read_text(encoding="utf-8").splitlines()
    if not lines or lines[0].strip() != "---":
        return category, metadata
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
            metadata[key] = value
        idx += 1
    return category, metadata


def collect_skills() -> Dict[str, List[Tuple[str, Dict[str, str]]]]:
    """按类别收集所有技能，列表元素包含 (相对路径, frontmatter)。"""
    if not ROOT.exists():
        print("未找到技能目录：", ROOT, file=sys.stderr)
        sys.exit(1)
    groups: Dict[str, List[Tuple[str, Dict[str, str]]]] = {}
    for skill_file in sorted(ROOT.rglob("SKILL.md")):
        category, metadata = parse_skill(skill_file)
        rel_path = skill_file.relative_to(Path(__file__).resolve().parent)
        entry = (str(rel_path), metadata)
        groups.setdefault(category, []).append(entry)
    return groups


def emit_markdown(groups: Dict[str, List[Tuple[str, Dict[str, str]]]]) -> None:
    """输出 Markdown 文本。"""
    print("# Skill Preview\n")
    print("> 由 `.claude/skill_preview.py` 自动生成。按类别列出所有技能及其描述。\n")
    for category in sorted(groups):
        skills = groups[category]
        if not skills:
            continue
        print(f"## {category}\n")
        print("| 技能路径 | name | description | allowed-tools |")
        print("| --- | --- | --- | --- |")
        for rel_path, metadata in skills:
            nice_name = metadata.get("name") or Path(rel_path).parent.name
            desc = metadata.get("description", "")
            allowed = metadata.get("allowed-tools", "")
            allowed_display = allowed if allowed else "-"
            print(f"| `{rel_path}` | {nice_name} | {desc} | {allowed_display} |")
        print()


def main() -> None:
    groups = collect_skills()
    emit_markdown(groups)


if __name__ == "__main__":
    main()
