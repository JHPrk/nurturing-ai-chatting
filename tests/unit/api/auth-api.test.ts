import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@app/api/chat/route";

// Gemini SDK 모킹
vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return {
        startChat: () => ({
          sendMessage: async () => ({
            response: { text: () => "모킹된 AI 응답입니다 😊" }
          })
        })
      };
    }
  }
}));

describe("POST /api/chat - 인증 테스트", () => {
  beforeEach(() => {
    // 환경변수 모킹
    process.env.GEMINI_API_KEY = "test-api-key";
  });

  it("Authorization 헤더가 없으면 401 오류를 반환한다", async () => {
    const request = new NextRequest("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        history: [],
        message: "안녕하세요"
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("인증이 필요합니다.");
  });

  it("잘못된 형식의 Authorization 헤더에 대해 401 오류를 반환한다", async () => {
    const request = new NextRequest("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "InvalidToken"
      },
      body: JSON.stringify({
        history: [],
        message: "안녕하세요"
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("인증이 필요합니다.");
  });

  it("올바른 Authorization 헤더가 있으면 정상 처리한다", async () => {
    const request = new NextRequest("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer valid-session-token"
      },
      body: JSON.stringify({
        history: [],
        message: "안녕하세요"
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.text).toBe("모킹된 AI 응답입니다 😊");
  });

  it("빈 메시지에 대해서는 인증이 있어도 400 오류를 반환한다", async () => {
    const request = new NextRequest("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer valid-session-token"
      },
      body: JSON.stringify({
        history: [],
        message: ""
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("메시지를 입력해주세요.");
  });
}); 