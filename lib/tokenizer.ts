export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * 메시지 배열의 토큰 수를 대략적으로 계산합니다.
 * (정확한 계산은 Gemini API 토크나이저 필요, 여기서는 추정값 사용)
 */
export function calculateTokens(messages: Message[]): number {
  return messages.reduce((total, message) => {
    // 한국어 기준 대략 4자 = 1토큰으로 추정
    const contentTokens = Math.ceil(message.content.length / 4);
    return total + contentTokens;
  }, 0);
}

/**
 * 토큰 한도를 초과하지 않도록 메시지 배열을 슬라이싱합니다.
 */
export function sliceByTokens(messages: Message[], maxTokens: number): Message[] {
  if (calculateTokens(messages) <= maxTokens) {
    return messages;
  }

  // 뒤에서부터 메시지를 추가하면서 토큰 한도 확인
  const result: Message[] = [];
  let currentTokens = 0;

  for (let i = messages.length - 1; i >= 0; i--) {
    const messageTokens = Math.ceil(messages[i].content.length / 4);
    
    if (currentTokens + messageTokens > maxTokens) {
      break;
    }
    
    result.unshift(messages[i]);
    currentTokens += messageTokens;
  }

  return result;
} 