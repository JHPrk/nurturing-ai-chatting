import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { AuthManager } from "@lib/auth";
import type { AuthSession } from "@lib/types";

// localStorage 모킹
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Date.now 모킹
const mockNow = vi.fn();
vi.spyOn(Date, "now").mockImplementation(mockNow);

describe("AuthManager", () => {
  let authManager: AuthManager;
  const testAccessCode = "Test@123";
  const baseTime = 1000000000000; // 고정된 시간

  beforeEach(() => {
    mockNow.mockReturnValue(baseTime);
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    
    authManager = new AuthManager(testAccessCode, 600000); // 10분
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("validateAccessCode", () => {
    it("올바른 접근 코드에 대해 true를 반환한다", () => {
      expect(authManager.validateAccessCode(testAccessCode)).toBe(true);
    });

    it("잘못된 접근 코드에 대해 false를 반환한다", () => {
      expect(authManager.validateAccessCode("wrong")).toBe(false);
    });

    it("빈 문자열에 대해 false를 반환한다", () => {
      expect(authManager.validateAccessCode("")).toBe(false);
    });

    it("null/undefined에 대해 false를 반환한다", () => {
      expect(authManager.validateAccessCode(null as any)).toBe(false);
      expect(authManager.validateAccessCode(undefined as any)).toBe(false);
    });
  });

  describe("createSession", () => {
    it("유효한 세션을 생성하고 localStorage에 저장한다", () => {
      authManager.createSession();

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "auth_session",
        JSON.stringify({
          isAuthenticated: true,
          timestamp: baseTime,
          expiresAt: baseTime + 600000
        })
      );
    });
  });

  describe("isAuthenticated", () => {
    it("유효한 세션이 있으면 true를 반환한다", () => {
      const validSession: AuthSession = {
        isAuthenticated: true,
        timestamp: baseTime,
        expiresAt: baseTime + 600000
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(validSession));

      expect(authManager.isAuthenticated()).toBe(true);
    });

    it("만료된 세션이 있으면 false를 반환하고 세션을 제거한다", () => {
      const expiredSession: AuthSession = {
        isAuthenticated: true,
        timestamp: baseTime - 700000, // 11분 전
        expiresAt: baseTime - 100000  // 1분 전 만료
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredSession));

      expect(authManager.isAuthenticated()).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("auth_session");
    });

    it("세션이 없으면 false를 반환한다", () => {
      localStorageMock.getItem.mockReturnValue(null);

      expect(authManager.isAuthenticated()).toBe(false);
    });

    it("잘못된 형식의 세션 데이터에 대해 false를 반환한다", () => {
      localStorageMock.getItem.mockReturnValue("invalid json");

      expect(authManager.isAuthenticated()).toBe(false);
    });

    it("isAuthenticated가 false인 세션에 대해 false를 반환한다", () => {
      const invalidSession: AuthSession = {
        isAuthenticated: false,
        timestamp: baseTime,
        expiresAt: baseTime + 600000
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(invalidSession));

      expect(authManager.isAuthenticated()).toBe(false);
    });
  });

  describe("clearSession", () => {
    it("localStorage에서 세션을 제거한다", () => {
      authManager.clearSession();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith("auth_session");
    });
  });

  describe("getTimeUntilExpiry", () => {
    it("세션이 있으면 만료까지 남은 시간을 반환한다", () => {
      const session: AuthSession = {
        isAuthenticated: true,
        timestamp: baseTime,
        expiresAt: baseTime + 600000
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(session));

      expect(authManager.getTimeUntilExpiry()).toBe(600000);
    });

    it("세션이 없으면 0을 반환한다", () => {
      localStorageMock.getItem.mockReturnValue(null);

      expect(authManager.getTimeUntilExpiry()).toBe(0);
    });

    it("만료된 세션에 대해 0을 반환한다", () => {
      const expiredSession: AuthSession = {
        isAuthenticated: true,
        timestamp: baseTime - 700000,
        expiresAt: baseTime - 100000
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredSession));

      expect(authManager.getTimeUntilExpiry()).toBe(0);
    });
  });

  describe("authenticate", () => {
    it("올바른 코드로 인증 시 세션을 생성하고 true를 반환한다", () => {
      const result = authManager.authenticate(testAccessCode);

      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "auth_session",
        JSON.stringify({
          isAuthenticated: true,
          timestamp: baseTime,
          expiresAt: baseTime + 600000
        })
      );
    });

    it("잘못된 코드로 인증 시 false를 반환하고 세션을 생성하지 않는다", () => {
      const result = authManager.authenticate("wrong");

      expect(result).toBe(false);
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });
}); 