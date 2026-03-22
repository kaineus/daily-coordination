#!/bin/bash
# PM/Designer/Developer/Tester 세션 종료(Stop) 시 호출
# stdin으로 세션 정보를 받아 handoff 파일 생성 여부 판단

HANDOFF_DIR="$(git rev-parse --show-toplevel 2>/dev/null)/docs/handoff"
mkdir -p "$HANDOFF_DIR"

# 현재 세션의 역할을 판단하기 어려우므로,
# Stop 훅에서는 systemMessage로 사용자에게 핸드오프 작성을 유도
cat <<EOF
{
  "systemMessage": "[Handoff] 세션을 종료합니다. 다른 세션에 전달할 내용이 있다면, 종료 전에 사용자에게 핸드오프 메모 작성 여부를 물어보세요. 작성 시 docs/handoff/latest.md에 저장하세요. 형식:\n---\nfrom: [역할]\nto: [대상 역할들]\ndate: $(date +%Y-%m-%d)\ntime: $(date +%H:%M)\n---\n## 변경 사항\n## 다음 작업 지시"
}
EOF
