export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  history: Message[];
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  text: string;
  sessionId?: string;
}

export interface ErrorResponse {
  error: string;
  code?: string;
}

// 인증 관련 타입
export interface AuthSession {
  isAuthenticated: boolean;
  timestamp: number;
  expiresAt: number;
}

export interface AuthConfig {
  sessionKey: string;
  sessionDuration: number; // 밀리초 단위 (10분 = 600000ms)
} 