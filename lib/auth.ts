import type { AuthSession } from "./types";

/**
 * 인증 관리 클래스
 * 접근 코드 검증, 세션 관리, 만료 처리를 담당
 */
export class AuthManager {
  private readonly accessCode: string;
  private readonly sessionDuration: number;
  private readonly sessionKey = "auth_session";

  constructor(accessCode: string, sessionDuration: number = 600000) { // 기본 10분
    this.accessCode = accessCode;
    this.sessionDuration = sessionDuration;
  }

  /**
   * 접근 코드 유효성 검증
   * @param inputCode 사용자가 입력한 코드
   * @returns 유효한 코드인지 여부
   */
  validateAccessCode(inputCode: string): boolean {
    if (!inputCode || typeof inputCode !== "string") {
      return false;
    }
    return inputCode === this.accessCode;
  }

  /**
   * 새로운 인증 세션 생성
   */
  createSession(): void {
    const now = Date.now();
    const session: AuthSession = {
      isAuthenticated: true,
      timestamp: now,
      expiresAt: now + this.sessionDuration
    };

    try {
      localStorage.setItem(this.sessionKey, JSON.stringify(session));
    } catch (error) {
      console.error("세션 저장 실패:", error);
    }
  }

  /**
   * 현재 사용자가 인증되었는지 확인
   * @returns 인증 상태
   */
  isAuthenticated(): boolean {
    try {
      const sessionData = localStorage.getItem(this.sessionKey);
      if (!sessionData) {
        return false;
      }

      const session: AuthSession = JSON.parse(sessionData);
      
      // 세션 구조 검증
      if (!session.isAuthenticated || typeof session.expiresAt !== "number") {
        return false;
      }

      // 만료 체크
      const now = Date.now();
      if (now >= session.expiresAt) {
        this.clearSession();
        return false;
      }

      return true;
    } catch (error) {
      console.error("세션 확인 실패:", error);
      return false;
    }
  }

  /**
   * 현재 세션 제거
   */
  clearSession(): void {
    try {
      localStorage.removeItem(this.sessionKey);
    } catch (error) {
      console.error("세션 제거 실패:", error);
    }
  }

  /**
   * 세션 만료까지 남은 시간(밀리초) 반환
   * @returns 남은 시간 (밀리초)
   */
  getTimeUntilExpiry(): number {
    try {
      const sessionData = localStorage.getItem(this.sessionKey);
      if (!sessionData) {
        return 0;
      }

      const session: AuthSession = JSON.parse(sessionData);
      const now = Date.now();
      const remaining = session.expiresAt - now;
      
      return remaining > 0 ? remaining : 0;
    } catch (error) {
      console.error("만료 시간 계산 실패:", error);
      return 0;
    }
  }

  /**
   * 접근 코드를 사용한 인증 처리
   * @param inputCode 사용자 입력 코드
   * @returns 인증 성공 여부
   */
  authenticate(inputCode: string): boolean {
    if (this.validateAccessCode(inputCode)) {
      this.createSession();
      return true;
    }
    return false;
  }
} 