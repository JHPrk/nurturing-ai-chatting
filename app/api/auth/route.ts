import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

interface AuthRequest {
  accessCode: string;
}

/**
 * 간단한 JWT 같은 토큰 생성 (Web Crypto API 사용)
 */
async function createToken(payload: any, secret: string): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Date.now();
  const tokenPayload = {
    ...payload,
    iat: Math.floor(now / 1000),
    exp: Math.floor(now / 1000) + (10 * 60), // 10분 후 만료
  };

  const headerEncoded = btoa(JSON.stringify(header));
  const payloadEncoded = btoa(JSON.stringify(tokenPayload));
  const data = `${headerEncoded}.${payloadEncoded}`;
  
  // Web Crypto API로 HMAC 서명 생성
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    "raw", 
    keyData, 
    { name: "HMAC", hash: "SHA-256" }, 
    false, 
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const signatureArray = new Uint8Array(signature);
  const signatureBase64 = btoa(String.fromCharCode(...signatureArray));
  
  return `${data}.${signatureBase64}`;
}

/**
 * 토큰 검증
 */
async function verifyToken(token: string, secret: string): Promise<any> {
  try {
    const [headerEncoded, payloadEncoded, signatureEncoded] = token.split('.');
    
    if (!headerEncoded || !payloadEncoded || !signatureEncoded) {
      throw new Error('Invalid token format');
    }
    
    // 서명 검증
    const data = `${headerEncoded}.${payloadEncoded}`;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      "raw", 
      keyData, 
      { name: "HMAC", hash: "SHA-256" }, 
      false, 
      ["verify"]
    );
    
    const signature = Uint8Array.from(atob(signatureEncoded), c => c.charCodeAt(0));
    const isValid = await crypto.subtle.verify("HMAC", key, signature, encoder.encode(data));
    
    if (!isValid) {
      throw new Error('Invalid signature');
    }
    
    // 페이로드 디코딩 및 만료 시간 확인
    const payload = JSON.parse(atob(payloadEncoded));
    const now = Math.floor(Date.now() / 1000);
    
    if (payload.exp && payload.exp < now) {
      throw new Error('Token expired');
    }
    
    return payload;
  } catch (error) {
    throw new Error('Token verification failed');
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { accessCode } = body as AuthRequest;

    // 입력 검증
    if (!accessCode || typeof accessCode !== "string" || accessCode.trim().length === 0) {
      return NextResponse.json(
        { error: "접근 코드를 입력해주세요" },
        { status: 400 }
      );
    }

    // 서버에서 접근 코드 확인 (환경변수에서 가져옴, 클라이언트에 노출되지 않음)
    const correctCode = process.env.ACCESS_CODE || "Dev@1234";
    
    if (accessCode.trim() !== correctCode) {
      return NextResponse.json(
        { error: "올바르지 않은 접근 코드입니다" },
        { status: 401 }
      );
    }

    // JWT 서명용 시크릿 키
    const jwtSecret = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production";
    
    // JWT 토큰 생성
    const token = await createToken({ authorized: true }, jwtSecret);

    return NextResponse.json({
      success: true,
      token,
      expiresIn: 600, // 10분 (초 단위)
    });

  } catch (error) {
    console.error("[Auth API Error]", error);
    return NextResponse.json(
      { error: "서버와의 통신에 실패했습니다" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { authenticated: false, error: "토큰이 제공되지 않았습니다" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production";
    
    // 토큰 검증
    const payload = await verifyToken(token, jwtSecret);
    const now = Math.floor(Date.now() / 1000);
    const timeRemaining = (payload.exp - now) * 1000; // 밀리초 단위

    return NextResponse.json({
      authenticated: true,
      expiresAt: payload.exp * 1000, // 밀리초 단위로 변환
      timeRemaining: Math.max(0, timeRemaining),
    });

  } catch (error) {
    console.error("[Auth Verify Error]", error);
    return NextResponse.json(
      { authenticated: false, error: "토큰이 유효하지 않습니다" },
      { status: 401 }
    );
  }
} 