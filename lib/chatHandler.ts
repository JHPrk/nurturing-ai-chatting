import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT } from '@lib/constants'

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  history: Message[];
  message: string;
}

export class ChatService {
  private aiClient: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>;
  private systemPrompt: Message;

  constructor(apiKey: string) {
    const client = new GoogleGenerativeAI(apiKey);
    this.aiClient = client.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        stopSequences: ["Human:", "User:", "\n\n\n"]
      }
    });

    this.systemPrompt = {
      role: "system",
      content: SYSTEM_PROMPT
    };
  }

  async generateReply(request: ChatRequest): Promise<{ text: string }> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    
    console.log(`[ChatService] ${timestamp} - generateReply 시작`);
    console.log(`[ChatService] 입력 메시지 길이: ${request.message.length}자`);
    console.log(`[ChatService] 입력 히스토리 메시지 수: ${request.history.length}개`);

    try {
      // 1. 히스토리 슬라이싱
      console.log(`[ChatService] 1단계: 히스토리 슬라이싱 시작`);
      const slicedHistory = this.sliceHistory(request.history);
      console.log(`[ChatService] 히스토리 슬라이싱 완료: ${request.history.length}개 → ${slicedHistory.length}개`);
      
      // 2. 시스템 프롬프트 삽입
      console.log(`[ChatService] 2단계: 시스템 프롬프트 삽입 : ${this.systemPrompt.content}`);
      const messagesWithSystem = [this.systemPrompt, ...slicedHistory];
      console.log(`[ChatService] 시스템 프롬프트 삽입 완료: 총 ${messagesWithSystem.length}개 메시지`);
      
      // 메시지 전문 로깅
      console.log(`[ChatService] === 메시지 구조 전문 ===`);
      messagesWithSystem.forEach((msg, index) => {
        console.log(`[ChatService] 메시지 ${index}: role="${msg.role}", content="${msg.content.substring(0, 200)}${msg.content.length > 200 ? '...' : ''}"`);
      });
      
      // 3. Gemini API 호출을 위한 포맷 변환
      console.log(`[ChatService] 3단계: Gemini API 포맷 변환 시작`);
      const formattedHistory = messagesWithSystem.map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      }));
      console.log(`[ChatService] 포맷 변환 완료: ${formattedHistory.length}개 메시지`);

      // 포맷 변환된 메시지 전문 로깅
      console.log(`[ChatService] === 포맷 변환된 메시지 전문 ===`);
      formattedHistory.forEach((msg, index) => {
        console.log(`[ChatService] 포맷 메시지 ${index}: role="${msg.role}", parts.text="${msg.parts[0].text.substring(0, 200)}${msg.parts[0].text.length > 200 ? '...' : ''}"`);
      });

      // 4. Chat 인스턴스 생성 및 메시지 전송
      console.log(`[ChatService] 4단계: Gemini API 호출 시작`);
      const historyForChat = formattedHistory; // 마지막 사용자 메시지 제외
      console.log(`[ChatService] Chat 히스토리 설정: ${historyForChat.length}개 메시지`);
      
      // API 요청 구조 전문 로깅
      console.log(`[ChatService] === Gemini API 요청 전문 ===`);
      console.log(`[ChatService] startChat 히스토리:`, JSON.stringify(historyForChat, null, 2));
      console.log(`[ChatService] sendMessage 내용: "${request.message}"`);
      console.log(`[ChatService] 생성 설정: maxOutputTokens=${this.aiClient.generationConfig?.maxOutputTokens}, temperature=${this.aiClient.generationConfig?.temperature}`);
      
      const chat = this.aiClient.startChat({
        history: historyForChat
      });

      console.log(`[ChatService] API 요청 전송 중... (메시지: "${request.message.substring(0, 50)}${request.message.length > 50 ? '...' : ''}")`);
      const apiCallStart = Date.now();
      
      const result = await chat.sendMessage(request.message);
      
      const apiCallEnd = Date.now();
      const apiDuration = apiCallEnd - apiCallStart;
      console.log(`[ChatService] API 응답 수신 완료 (소요시간: ${apiDuration}ms)`);
      
      const text = result.response.text();
      console.log(`[ChatService] 응답 텍스트 추출 완료: ${text.length}자`);
      console.log(`[ChatService] 응답 내용 미리보기: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`);

      // 800자 제한 체크 및 경고
      if (text.length > 800) {
        console.warn(`[ChatService] ⚠️  응답 길이 초과 경고: ${text.length}자 > 800자 제한`);
        console.warn(`[ChatService] ⚠️  응답 전문: "${text}"`);
      }

      const totalDuration = Date.now() - startTime;
      console.log(`[ChatService] generateReply 완료 (총 소요시간: ${totalDuration}ms, API 호출: ${apiDuration}ms)`);

      return { text };

    } catch (error) {
      const totalDuration = Date.now() - startTime;
      console.error(`[ChatService Error] ${timestamp} - generateReply 실패 (소요시간: ${totalDuration}ms)`);
      
      // 타입 안전한 에러 처리
      if (error instanceof Error) {
        console.error(`[ChatService Error] 에러 타입: ${error.constructor.name}`);
        console.error(`[ChatService Error] 에러 메시지: ${error.message}`);
      }
      
      // Gemini API 특정 에러 정보 추출
      if (typeof error === 'object' && error !== null) {
        const apiError = error as any;
        if (apiError.status) {
          console.error(`[ChatService Error] HTTP 상태 코드: ${apiError.status}`);
        }
        if (apiError.errorDetails) {
          console.error(`[ChatService Error] API 에러 상세:`, apiError.errorDetails);
        }
      }
      
      console.error(`[ChatService Error] 전체 에러 스택:`, error);
      throw error;
    }
  }

  private sliceHistory(history: Message[]): Message[] {
    const MAX_TURNS = 10; // 사용자-어시스턴트 쌍 기준
    const MAX_MESSAGES = MAX_TURNS * 2;

    if (history.length <= MAX_MESSAGES) {
      console.log(`[ChatService] 히스토리 슬라이싱 불필요: ${history.length}개 ≤ ${MAX_MESSAGES}개 제한`);
      return history;
    }

    // 최근 메시지들만 유지
    const sliced = history.slice(-MAX_MESSAGES);
    console.log(`[ChatService] 히스토리 슬라이싱 수행: ${history.length}개 → ${sliced.length}개 (${history.length - sliced.length}개 제거)`);
    return sliced;
  }
} 