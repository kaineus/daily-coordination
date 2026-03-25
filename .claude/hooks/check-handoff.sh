#!/bin/bash
# UserPromptSubmit 훅: 현재 역할에 할당된 핸드오프를 확인하여 컨텍스트에 주입

ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"
ROLE_FILE="$ROOT/.claude/current-role"
HANDOFF_DIR="$ROOT/docs/handoff"

# 현재 역할 읽기: 환경변수 우선, 없으면 파일 폴백
if [ -n "$CLAUDE_ROLE" ]; then
  ROLE="$CLAUDE_ROLE"
elif [ -f "$ROLE_FILE" ]; then
  ROLE=$(cat "$ROLE_FILE" | tr -d '[:space:]')
else
  echo '{}'
  exit 0
fi

# PM은 수신하지 않음 (docs/ 직접 확인)
if [ "$ROLE" = "pm" ]; then
  echo '{}'
  exit 0
fi

INBOX="$HANDOFF_DIR/to-$ROLE"

# 인박스 디렉토리가 없거나 .md 파일이 없으면 종료
if [ ! -d "$INBOX" ]; then
  echo '{}'
  exit 0
fi

# .md 파일 목록 수집
MD_FILES=$(find "$INBOX" -maxdepth 1 -name "*.md" -type f 2>/dev/null)

if [ -z "$MD_FILES" ]; then
  echo '{}'
  exit 0
fi

# 모든 핸드오프 내용 합치기
COUNT=0
COMBINED=""
while IFS= read -r f; do
  COUNT=$((COUNT + 1))
  FILENAME=$(basename "$f")
  CONTENT=$(cat "$f")
  COMBINED="${COMBINED}--- ${FILENAME} ---\n${CONTENT}\n\n"
done <<< "$MD_FILES"

cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "additionalContext": "[Handoff] ${COUNT}건의 새 핸드오프가 있습니다 (to-${ROLE}/).\n\n${COMBINED}\n확인 후 작업에 반영하세요. 완료된 핸드오프는 docs/handoff/archive/로 이동해주세요."
  }
}
EOF
