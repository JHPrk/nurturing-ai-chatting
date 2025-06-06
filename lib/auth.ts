import { logger } from './logger';

/**
 * 서버 API 응답 타입 정의
 */
interface AuthResponse {
  success: boolean;
  token?: string;
  expiresIn?: number;
  error?: string;
}

interface VerifyResponse {
  authenticated: boolean;
  expiresAt?: number;
  timeRemaining?: number;
  error?: string;
}

/**
 * 인증 관리 클래스 (서버 API 기반)
 * 서버와 통신하여 접근 코드 검증, JWT 토큰 관리를 담당
 */
export class AuthManager {
  private readonly tokenKey = "auth_token";

  constructor() {
    // 더 이상 클라이언트에서 접근 코드를 보관하지 않음
  }

  /**
   * 로컬에 토큰이 저장되어 있는지 확인
   * @returns 토큰 존재 여부
   */
  hasToken(): boolean {
    try {
      const token = localStorage.getItem(this.tokenKey);
      return !!token && token.trim().length > 0;
    } catch (error) {
      logger.warn("토큰 확인 실패:", error);
      return false;
    }
  }

  /**
   * 서버에 접근 코드를 전송하여 인증 처리
   * @param inputCode 사용자가 입력한 코드
   * @returns 인증 성공 여부
   */
  async authenticate(inputCode: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accessCode: inputCode }),
      });

      const data: AuthResponse = await response.json();

      if (response.ok && data.success && data.token) {
        // 토큰을 localStorage에 저장
        localStorage.setItem(this.tokenKey, data.token);
        logger.info("인증 성공, 토큰 저장 완료");
        return { success: true };
      } else {
        logger.warn("인증 실패:", data.error);
        return { success: false, error: data.error || "인증에 실패했습니다" };
      }
    } catch (error) {
      logger.error("인증 요청 실패:", error);
      return { success: false, error: "서버와의 통신에 실패했습니다" };
    }
  }

  /**
   * 서버에서 현재 토큰의 유효성을 검증
   * @returns 인증 상태
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = localStorage.getItem(this.tokenKey);
      if (!token) {
        return false;
      }

      const response = await fetch("/api/auth", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data: VerifyResponse = await response.json();
      
      if (response.ok && data.authenticated) {
        return true;
      } else {
        // 토큰이 유효하지 않으면 제거
        if (response.status === 401) {
          this.clearSession();
        }
        return false;
      }
    } catch (error) {
      logger.error("인증 상태 확인 실패:", error);
      return false;
    }
  }

  /**
   * 토큰 만료까지 남은 시간을 가져옴
   * @returns 밀리초 단위 남은 시간
   */
  async getTimeUntilExpiry(): Promise<number> {
    try {
      const token = localStorage.getItem(this.tokenKey);
      if (!token) {
        return 0;
      }

      const response = await fetch("/api/auth", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        logger.error("만료 시간 확인 실패:", response.status);
        return 0;
      }

      const data: VerifyResponse = await response.json();
      
      if (data.authenticated && data.timeRemaining) {
        return Math.max(0, data.timeRemaining);
      }
      
      return 0;
    } catch (error) {
      logger.error("만료 시간 확인 실패:", error);
      return 0;
    }
  }

  /**
   * 세션 정리 (토큰 제거)
   */
  clearSession(): void {
    try {
      localStorage.removeItem(this.tokenKey);
      logger.info("세션 정리 완료");
    } catch (error) {
      logger.warn("세션 정리 실패:", error);
    }
  }

  /**
   * 현재 저장된 토큰 반환 (디버깅용)
   * @returns 토큰 문자열 또는 null
   */
  getToken(): string | null {
    try {
      return localStorage.getItem(this.tokenKey);
    } catch (error) {
      logger.warn("토큰 가져오기 실패:", error);
      return null;
    }
  }
} 