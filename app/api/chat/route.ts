import { NextRequest, NextResponse } from "next/server";
import { ChatService } from "@lib/chatHandler";
import { logger } from "@lib/logger";

export const runtime = "edge";
export const preferredRegion = 'icn1'; // 서울 리전 (한국 사용자용)

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatRequest {
  sessionId?: string;
  history: Message[];
  message: string;
}

export async function POST(req: NextRequest) {
  try {
    // 1. 인증 체크 (간단한 세션 토큰 검증)
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    // 2. 요청 바디 파싱
    const body = await req.json();
    const { sessionId, history = [], message } = body as ChatRequest;

    // 3. 입력 검증
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "메시지를 입력해주세요." },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: "메시지가 너무 깁니다. (최대 2000자)" },
        { status: 400 }
      );
    }

    // 4. 환경변수 확인
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logger.error("GEMINI_API_KEY not configured");
      return NextResponse.json(
        { error: "서버 설정 오류입니다." },
        { status: 500 }
      );
    }

    // 5. ChatService 인스턴스 생성 및 호출
    const startTime = Date.now();
    const chatService = new ChatService(apiKey);
    const { text } = await chatService.generateReply({
      history,
      message: message.trim()
    });

    // 6. 로깅
    const responseTime = Date.now() - startTime;
    logger.info(`session=${sessionId || "anonymous"} msgLen=${message.length} responseTime=${responseTime}ms status=success`);

    // 7. 성공 응답
    return NextResponse.json({ text });

  } catch (error: unknown) {
    // 8. 오류 처리
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error(`status=error error=${errorMessage}`);
    
    if (errorMessage.includes("429")) {
      return NextResponse.json(
        { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "문제가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}

// CORS 헤더 설정
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": process.env.NODE_ENV === "production" 
        ? "https://yourdomain.com" 
        : "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
} 