import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { AuthManager } from "@lib/auth";

// fetch 모킹
const mockFetch = vi.fn();
global.fetch = mockFetch;

// localStorage 모킹
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("AuthManager - TDD", () => {
  let authManager: AuthManager;

  beforeEach(() => {
    authManager = new AuthManager();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("authenticate() - 인증 처리", () => {
    it("올바른 접근 코드로 인증 성공 시 토큰을 localStorage에 저장해야 한다", async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        json: async () => ({
          success: true,
          token: "valid.jwt.token",
          expiresIn: 600,
        }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await authManager.authenticate("TestCode123");

      // Assert
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(localStorageMock.setItem).toHaveBeenCalledWith("auth_token", "valid.jwt.token");
      expect(mockFetch).toHaveBeenCalledWith("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessCode: "TestCode123" }),
      });
    });

    it("잘못된 접근 코드로 인증 실패 시 에러 메시지를 반환해야 한다", async () => {
      // Arrange
      const mockResponse = {
        ok: false,
        json: async () => ({
          success: false,
          error: "올바르지 않은 접근 코드입니다",
        }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await authManager.authenticate("WrongCode");

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("올바르지 않은 접근 코드입니다");
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it("서버와의 통신 실패 시 네트워크 에러 메시지를 반환해야 한다", async () => {
      // Arrange
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      // Act
      const result = await authManager.authenticate("TestCode123");

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("서버와의 통신에 실패했습니다");
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it("서버에서 토큰 없이 성공 응답을 보낸 경우 실패로 처리해야 한다", async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        json: async () => ({
          success: true,
          // token이 없음
        }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await authManager.authenticate("TestCode123");

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("인증에 실패했습니다");
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });

  describe("isAuthenticated() - 인증 상태 확인", () => {
    it("유효한 토큰이 있는 경우 true를 반환해야 한다", async () => {
      // Arrange
      localStorageMock.getItem.mockReturnValue("valid.jwt.token");
      const mockResponse = {
        ok: true,
        json: async () => ({
          authenticated: true,
          expiresAt: Date.now() + 300000,
          timeRemaining: 300000,
        }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await authManager.isAuthenticated();

      // Assert
      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith("/api/auth", {
        method: "GET",
        headers: { "Authorization": "Bearer valid.jwt.token" },
      });
    });

    it("토큰이 없는 경우 false를 반환해야 한다", async () => {
      // Arrange
      localStorageMock.getItem.mockReturnValue(null);

      // Act
      const result = await authManager.isAuthenticated();

      // Assert
      expect(result).toBe(false);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("서버에서 토큰이 무효하다고 응답하면 토큰을 제거하고 false를 반환해야 한다", async () => {
      // Arrange
      localStorageMock.getItem.mockReturnValue("invalid.jwt.token");
      const mockResponse = {
        ok: false,
        status: 401,
        json: async () => ({
          authenticated: false,
          error: "토큰이 유효하지 않습니다",
        }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await authManager.isAuthenticated();

      // Assert
      expect(result).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("auth_token");
    });

    it("네트워크 오류 발생 시 false를 반환해야 한다", async () => {
      // Arrange
      localStorageMock.getItem.mockReturnValue("some.jwt.token");
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      // Act
      const result = await authManager.isAuthenticated();

      // Assert
      expect(result).toBe(false);
      expect(localStorageMock.removeItem).not.toHaveBeenCalled();
    });
  });

  describe("hasToken() - 로컬 토큰 존재 확인", () => {
    it("localStorage에 토큰이 있으면 true를 반환해야 한다", () => {
      // Arrange
      localStorageMock.getItem.mockReturnValue("some.jwt.token");

      // Act
      const result = authManager.hasToken();

      // Assert
      expect(result).toBe(true);
      expect(localStorageMock.getItem).toHaveBeenCalledWith("auth_token");
    });

    it("localStorage에 토큰이 없으면 false를 반환해야 한다", () => {
      // Arrange
      localStorageMock.getItem.mockReturnValue(null);

      // Act
      const result = authManager.hasToken();

      // Assert
      expect(result).toBe(false);
    });

    it("localStorage 접근 오류 시 false를 반환해야 한다", () => {
      // Arrange
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error("localStorage error");
      });

      // Act
      const result = authManager.hasToken();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("getTimeUntilExpiry() - 만료 시간 확인", () => {
    it("유효한 토큰의 남은 시간을 반환해야 한다", async () => {
      // Arrange
      localStorageMock.getItem.mockReturnValue("valid.jwt.token");
      const mockResponse = {
        ok: true,
        json: async () => ({
          authenticated: true,
          expiresAt: Date.now() + 300000,
          timeRemaining: 300000,
        }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await authManager.getTimeUntilExpiry();

      // Assert
      expect(result).toBe(300000);
      expect(mockFetch).toHaveBeenCalledWith("/api/auth", {
        method: "GET",
        headers: { "Authorization": "Bearer valid.jwt.token" },
      });
    });

    it("토큰이 없으면 0을 반환해야 한다", async () => {
      // Arrange
      localStorageMock.getItem.mockReturnValue(null);

      // Act
      const result = await authManager.getTimeUntilExpiry();

      // Assert
      expect(result).toBe(0);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("서버 오류 시 0을 반환해야 한다", async () => {
      // Arrange
      localStorageMock.getItem.mockReturnValue("some.jwt.token");
      mockFetch.mockRejectedValueOnce(new Error("Server error"));

      // Act
      const result = await authManager.getTimeUntilExpiry();

      // Assert
      expect(result).toBe(0);
    });
  });

  describe("clearSession() - 세션 제거", () => {
    it("localStorage에서 토큰을 제거해야 한다", () => {
      // Act
      authManager.clearSession();

      // Assert
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("auth_token");
    });

    it("localStorage 오류 시에도 예외를 발생시키지 않아야 한다", () => {
      // Arrange
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error("localStorage error");
      });

      // Act & Assert
      expect(() => authManager.clearSession()).not.toThrow();
    });
  });
}); 