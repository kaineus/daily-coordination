#!/bin/bash
# 사용자가 프롬프트를 입력할 때 호출
# docs/handoff/latest.md가 존재하면 내용을 컨텍스트에 주입

HANDOFF_DIR="$(git rev-parse --show-toplevel 2>/dev/null)/docs/handoff"
HANDOFF_FILE="$HANDOFF_DIR/latest.md"

if [ -f "$HANDOFF_FILE" ]; then
  # 파일이 5분 이내에 수정된 경우에만 알림 (오래된 핸드오프 무시)
  if [ "$(uname)" = "Darwin" ]; then
    FILE_AGE=$(( $(date +%s) - $(stat -f %m "$HANDOFF_FILE") ))
  else
    FILE_AGE=$(( $(date +%s) - $(stat -c %Y "$HANDOFF_FILE") ))
  fi

  # 24시간(86400초) 이내면 알림
  if [ "$FILE_AGE" -lt 86400 ]; then
    CONTENT=$(cat "$HANDOFF_FILE")
    # JSON 안전하게 이스케이프
    ESCAPED=$(echo "$CONTENT" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read()))")

    cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "additionalContext": "[Handoff 알림] 다른 세션에서 새 지시사항이 있습니다. 아래 내용을 확인하고 작업에 반영하세요:\n\n${CONTENT}\n\n이 핸드오프를 확인했으면 사용자에게 요약해서 알려주세요."
  }
}
EOF
  else
    echo '{}'
  fi
else
  echo '{}'
fi
