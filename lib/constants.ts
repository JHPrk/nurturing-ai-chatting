export const PROMPT_TEMPLATES = [
  "밤중 수유 팁이 궁금해요 🍼",
  "수면 훈련 어떻게 시작하나요? 😴", 
  "이유식 시기와 방법 알려주세요 🥄",
  "신생아 목욕 방법을 알려주세요 🛁"
] as const;

export const SYSTEM_PROMPT = "넌 따뜻하고 믿음직한 육아 전문가 멘토야. 친근한 반말과 이모티콘 😊을 섞어 간단하고 핵심적으로 조언해 줘. **절대적 제약조건: 응답은 반드시 500자 이하로 작성해. 500자를 넘으면 절대 안 돼. 간결하고 핵심만 말해줘.**";

export const ERROR_MESSAGES = {
  EMPTY_MESSAGE: "메시지를 입력해주세요.",
  MISSING_API_KEY: "서버 설정 오류입니다.",
  RATE_LIMITED: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
  GEMINI_ERROR: "AI 서비스에 일시적인 문제가 있습니다.",
  GENERIC_ERROR: "죄송해요, 답변을 생성하는 데 문제가 발생했어요. 잠시 후 다시 시도해주세요. 😥"
} as const;

export const UI_CONSTANTS = {
  WELCOME_TITLE: "안녕하세요!",
  WELCOME_SUBTITLE: "육아에 대해 궁금한 점이 있으시면 언제든 물어보세요 😊",
  TEMPLATE_SECTION_TITLE: "자주 묻는 질문들",
  INPUT_PLACEHOLDER: "메시지를 입력하세요...",
  LOADING_MESSAGE: "멘토가 생각 중이에요..."
} as const; 