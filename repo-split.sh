#!/bin/bash

# 检查输入参数数量是否正确
if [ "$#" -lt 3 ] || [ "$#" -gt 4 ]; then
  echo "Usage: ./repo-split.sh <original_repo_path> <directory_to_split> <new_repo_remote_url> [<new_repo_prefix>]"
  exit 1
fi

# 获取命令行参数
original_repo_path=$1
directory_to_split=$2
new_repo_remote_url=$3
new_repo_prefix=$4

# 进入原始仓库目录
cd "$original_repo_path" || { echo "Error: Unable to access $original_repo_path"; exit 1; }

# 确保清理掉已有的 temp_repo
if [ -d "temp_repo" ]; then
  echo "Removing existing temp_repo directory..."
  rm -rf temp_repo
fi

# 创建新的子仓库分支并保留提交历史
echo "Creating split branch for $directory_to_split..."
git subtree split -P "$directory_to_split" -b split_branch
if [ $? -ne 0 ]; then
  echo "Error: Failed to create split_branch. Exiting."
  exit 1
fi

# 初始化新的远程仓库
echo "Cloning repository to temp_repo..."
git clone --bare "$original_repo_path" temp_repo
cd temp_repo || { echo "Error: Unable to access temp_repo"; exit 1; }

# 只保留拆分出的分支
echo "Filtering branch by subdirectory $directory_to_split..."
git filter-branch --subdirectory-filter "$directory_to_split" -- --all
if [ $? -ne 0 ]; then
  echo "Error: git filter-branch failed. Exiting."
  exit 1
fi

# 如果提供了前缀，调整目录结构
if [ -n "$new_repo_prefix" ]; then
  echo "Applying prefix $new_repo_prefix..."
  git filter-branch --tree-filter "mkdir -p $new_repo_prefix && git mv * $new_repo_prefix/" --prune-empty --tag-name-filter cat -- --all
  if [ $? -ne 0 ]; then
    echo "Error: git filter-branch with prefix failed. Exiting."
    exit 1
  fi
fi

# 检查是否有提交历史
echo "Checking commit history after filtering..."
if ! git log --oneline | grep -q .; then
  echo "Error: No commits found after filtering. Exiting."
  exit 1
fi

# 删除已有的 origin 远程仓库
echo "Checking if remote origin already exists..."
git remote remove origin || echo "No existing remote 'origin' found. Proceeding..."

# 添加远程并推送
echo "Adding remote origin $new_repo_remote_url..."
git remote add origin "$new_repo_remote_url" || { echo "Error: Failed to add remote origin. Exiting."; exit 1; }

echo "Pushing the changes to the new repository..."
git push -u origin --all
git push -u origin --tags
if [ $? -ne 0 ]; then
  echo "Error: Failed to push to remote repository. Exiting."
  exit 1
fi

# 清理
echo "Cleaning up..."
cd ..
rm -rf temp_repo
cd "$original_repo_path"
git branch -D split_branch

echo "Done! The split repository has been pushed to $new_repo_remote_url."
