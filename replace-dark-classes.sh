#!/bin/bash

# Script to replace dark:bg-dark-* classes with semantic CSS variable classes

# Define replacements
declare -A replacements=(
  ["dark:bg-dark-bg"]="dark:bg-background"
  ["dark:bg-dark-card"]="dark:bg-card"
  ["dark:border-dark-border"]="dark:border-border"
  ["bg-slate-50 dark:bg-background"]="bg-background"
  ["bg-white dark:bg-card"]="bg-card"
  ["border-slate-200 dark:border-border"]="border-border"
  ["text-slate-900 dark:text-white"]="text-foreground"
  ["text-slate-500 dark:text-gray-400"]="text-muted-foreground"
  ["bg-slate-50 dark:bg-dark-bg/50"]="bg-muted"
  ["bg-slate-100 dark:bg-card"]="bg-muted"
  ["dark:active:bg-dark-border"]="dark:active:bg-muted"
)

# Find all TSX and TS files
find apps/mobile -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "*/node_modules/*" | while read file; do
  for search in "${!replacements[@]}"; do
    replace="${replacements[$search]}"
    # Use sed to replace (macOS compatible)
    sed -i '' "s|${search}|${replace}|g" "$file"
  done
done

echo "Replacement complete!"
