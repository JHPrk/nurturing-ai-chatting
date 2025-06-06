import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";

// Web Crypto API 모킹
const mockCrypto = {
  subtle: {
    importKey: vi.fn(),
    sign: vi.fn(),
    verify: vi.fn(),
  },
};

// 글로벌 crypto 객체 모킹
Object.defineProperty(global, 'crypto', {
  value: mockCrypto,
  writable: true,
});

// btoa/atob 함수 모킹 (Node.js 환경용)
global.btoa = vi.fn((str: string) => Buffer.from(str).toString('base64'));
global.atob = vi.fn((str: string) => Buffer.from(str, 'base64').toString());

// TextEncoder/TextDecoder 모킹
global.TextEncoder = vi.fn(() => ({
  encode: vi.fn((text: string) => new Uint8Array(Buffer.from(text, 'utf8'))),
})) as any;

global.TextDecoder = vi.fn(() => ({
  decode: vi.fn((buffer: Uint8Array) => Buffer.from(buffer).toString('utf8')),
})) as any;

// API 함수들을 동적으로 import
let POST: any;
let GET: any;

describe("Auth API - TDD (Web Crypto)", () => {
  let originalEnv: any;

  beforeEach(async () => {
    // 환경변수 백업 및 설정
    originalEnv = process.env;
    process.env = {
      ...originalEnv,
      ACCESS_CODE: "TestCode123",
      JWT_SECRET: "test-secret-key",
    };
    
    // 모킹 초기화
    vi.clearAllMocks();
    
    // Web Crypto API 모킹 설정
    mockCrypto.subtle.importKey.mockResolvedValue({} as CryptoKey);
    mockCrypto.subtle.sign.mockResolvedValue(new ArrayBuffer(32));
    mockCrypto.subtle.verify.mockResolvedValue(true);
    
    // API 함수들 동적 import
    const authModule = await import("@app/api/auth/route");
    POST = authModule.POST;
    GET = authModule.GET;
  });

  afterEach(() => {
    // 환경변수 복원
    process.env = originalEnv;
  });

  describe("POST /api/auth - 인증 요청", () => {
    it("올바른 접근 코드로 인증 시 JWT 토큰을 반환해야 한다", async () => {
      // Arrange
      const mockRequest = {
        json: async () => ({ accessCode: "TestCode123" }),
      } as NextRequest;

      // Act
      const response = await POST(mockRequest);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.token).toBeDefined();
      expect(responseData.expiresIn).toBe(600);
      expect(mockCrypto.subtle.importKey).toHaveBeenCalled();
      expect(mockCrypto.subtle.sign).toHaveBeenCalled();
    });

    it("잘못된 접근 코드로 인증 시 401 오류를 반환해야 한다", async () => {
      // Arrange
      const mockRequest = {
        json: async () => ({ accessCode: "WrongCode" }),
      } as NextRequest;

      // Act
      const response = await POST(mockRequest);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(responseData.success).toBeUndefined();
      expect(responseData.error).toBe("올바르지 않은 접근 코드입니다");
    });

    it("빈 접근 코드로 요청 시 400 오류를 반환해야 한다", async () => {
      // Arrange
      const mockRequest = {
        json: async () => ({ accessCode: "" }),
      } as NextRequest;

      // Act
      const response = await POST(mockRequest);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(responseData.error).toBe("접근 코드를 입력해주세요");
    });

    it("접근 코드가 없는 요청 시 400 오류를 반환해야 한다", async () => {
      // Arrange
      const mockRequest = {
        json: async () => ({}),
      } as NextRequest;

      // Act
      const response = await POST(mockRequest);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(responseData.error).toBe("접근 코드를 입력해주세요");
    });
  });

  describe("GET /api/auth - 토큰 검증", () => {
    it("유효한 토큰으로 요청 시 인증 정보를 반환해야 한다", async () => {
      // Arrange - 유효한 토큰 생성
      const now = Math.floor(Date.now() / 1000);
      const validPayload = {
        authorized: true,
        iat: now,
        exp: now + 600
      };
      
      // Base64로 인코딩된 유효한 토큰 생성
      const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
      const payload = btoa(JSON.stringify(validPayload));
      const signature = "validSignature";
      const validToken = `${header}.${payload}.${signature}`;
      
      const mockRequest = {
        headers: {
          get: vi.fn((name: string) => {
            if (name === "authorization") {
              return `Bearer ${validToken}`;
            }
            return null;
          }),
        },
      } as any;

      // Act
      const response = await GET(mockRequest);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(responseData.authenticated).toBe(true);
      expect(responseData.expiresAt).toBeDefined();
      expect(responseData.timeRemaining).toBeDefined();
      expect(mockCrypto.subtle.importKey).toHaveBeenCalled();
      expect(mockCrypto.subtle.verify).toHaveBeenCalled();
    });

    it("토큰이 없는 요청 시 401 오류를 반환해야 한다", async () => {
      // Arrange
      const mockRequest = {
        headers: {
          get: vi.fn(() => null),
        },
      } as any;

      // Act
      const response = await GET(mockRequest);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(responseData.authenticated).toBe(false);
      expect(responseData.error).toBe("토큰이 제공되지 않았습니다");
    });

    it("잘못된 형식의 Authorization 헤더 시 401 오류를 반환해야 한다", async () => {
      // Arrange
      const mockRequest = {
        headers: {
          get: vi.fn((name: string) => {
            if (name === "authorization") {
              return "InvalidFormat token";
            }
            return null;
          }),
        },
      } as any;

      // Act
      const response = await GET(mockRequest);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(responseData.authenticated).toBe(false);
      expect(responseData.error).toBe("토큰이 제공되지 않았습니다");
    });

    it("유효하지 않은 토큰으로 요청 시 401 오류를 반환해야 한다", async () => {
      // Arrange
      mockCrypto.subtle.verify.mockResolvedValueOnce(false); // 서명 검증 실패
      
      const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
      const payload = btoa(JSON.stringify({ authorized: true }));
      const signature = "invalidSignature";
      const invalidToken = `${header}.${payload}.${signature}`;
      
      const mockRequest = {
        headers: {
          get: vi.fn((name: string) => {
            if (name === "authorization") {
              return `Bearer ${invalidToken}`;
            }
            return null;
          }),
        },
      } as any;

      // Act
      const response = await GET(mockRequest);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(responseData.authenticated).toBe(false);
      expect(responseData.error).toBe("토큰이 유효하지 않습니다");
    });
  });

  describe("환경변수 테스트", () => {
    it("ACCESS_CODE 환경변수가 없을 때 기본값을 사용해야 한다", async () => {
      // Arrange
      delete process.env.ACCESS_CODE;
      
      const mockRequest = {
        json: async () => ({ accessCode: "Dev@1234" }),
      } as NextRequest;

      // Act
      const response = await POST(mockRequest);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
    });

    it("JWT_SECRET 환경변수가 없을 때 기본값을 사용해야 한다", async () => {
      // Arrange
      delete process.env.JWT_SECRET;
      
      const mockRequest = {
        json: async () => ({ accessCode: "TestCode123" }),
      } as NextRequest;

      // Act
      const response = await POST(mockRequest);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.token).toBeDefined();
    });
  });
}); 