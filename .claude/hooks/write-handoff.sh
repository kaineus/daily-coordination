#!/bin/bash
# Stop 훅: 세션 종료 시 핸드오프 작성을 유도

ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"
ROLE_FILE="$ROOT/.claude/current-role"

# 현재 역할 읽기
ROLE="unknown"
if [ -f "$ROLE_FILE" ]; then
  ROLE=$(cat "$ROLE_FILE" | tr -d '[:space:]')
fi

# 역할별 핸드오프 가능 대상
case "$ROLE" in
  pm)       TARGETS="designer, developer, tester" ;;
  designer) TARGETS="developer" ;;
  developer) TARGETS="tester" ;;
  tester)   TARGETS="developer" ;;
  *)        TARGETS="designer, developer, tester" ;;
esac

DATE=$(date +%Y-%m-%d)
TIME=$(date +%H:%M)

cat <<EOF
{
  "systemMessage": "[Handoff] 세션을 종료합니다 (역할: ${ROLE}). 다른 세션에 전달할 내용이 있다면 핸드오프를 작성하세요.\n\n전달 가능 대상: ${TARGETS}\n파일 경로: docs/handoff/to-{대상역할}/${DATE}-${TIME}-${ROLE}.md\n\n형식:\n---\nfrom: ${ROLE}\nto: [대상 역할]\ndate: ${DATE}\ntime: ${TIME}\npriority: P0 | P1 | P2\n---\n## 변경 사항\n- ...\n## 다음 작업 지시\n- ...\n\n또한, 본인에게 할당된 핸드오프(docs/handoff/to-${ROLE}/) 중 처리 완료된 건이 있으면 archive/로 이동하세요."
}
EOF
