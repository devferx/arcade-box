#!/usr/bin/env bash

INPUT=$(cat)

if command -v jq &>/dev/null; then
  FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)
else
  FILE_PATH=$(printf '%s' "$INPUT" | node -e "
    let d='';
    process.stdin.on('data', c => d += c).on('end', () => {
      try { process.stdout.write(JSON.parse(d)?.tool_input?.file_path || ''); } catch(e) {}
    });
  " 2>/dev/null)
fi

[ -z "$FILE_PATH" ] && exit 0
[ ! -f "$FILE_PATH" ] && exit 0

./node_modules/.bin/prettier --write --ignore-unknown "$FILE_PATH" 2>/dev/null || true

case "$FILE_PATH" in
  *.js|*.jsx|*.ts|*.tsx|*.mjs|*.cjs)
    ./node_modules/.bin/eslint --fix "$FILE_PATH" 2>/dev/null || true
    ;;
esac

exit 0
