#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CMD_ARGS=("$@")

repos=()

maybe_add_repo() {
  local path="$1"
  if [ -d "$path/.git" ] || [ -f "$path/.git" ]; then
    repos+=("$path")
  fi
}

add_child_repos() {
  local base="$1"
  [ -d "$base" ] || return

  local dir
  for dir in "$base"/*; do
    [ -d "$dir" ] || continue
    maybe_add_repo "$dir"
  done
}

maybe_add_repo "$ROOT_DIR"
add_child_repos "$ROOT_DIR/apps"
add_child_repos "$ROOT_DIR/packages"

if [ "${#repos[@]}" -eq 0 ]; then
  echo "未找到可用的 Git 仓库，脚本退出。"
  exit 1
fi

for repo in "${repos[@]}"; do
  echo "==> 拉取仓库：$repo"
  (
    cd "$repo"
    if [ "${#CMD_ARGS[@]}" -eq 0 ]; then
      git pull
    else
      git pull "${CMD_ARGS[@]}"
    fi
  )
done
