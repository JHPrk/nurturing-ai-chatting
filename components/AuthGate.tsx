"use client";

import { useState, useEffect, useCallback, ReactNode } from "react";
import { AuthManager } from "@lib/auth";

interface AuthGateProps {
  children: ReactNode;
}

/**
 * 시간을 사람이 읽기 쉬운 형태로 포맷팅
 */
function formatTimeRemaining(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return seconds > 0 ? `${minutes}분 ${seconds}초` : `${minutes}분`;
  }
  return `${seconds}초`;
}

/**
 * 인증 게이트 컴포넌트
 * 접근 코드 입력 및 세션 관리를 담당
 */
export function AuthGate({ children }: AuthGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [authManager] = useState(() => {
    // 환경변수에서 접근 코드 가져오기 (클라이언트에서는 public 변수만 접근 가능)
    const code = process.env.NEXT_PUBLIC_ACCESS_CODE || "Dev@1234";
    return new AuthManager(code, 600000); // 10분
  });

  // 세션 상태 체크
  const checkAuthStatus = useCallback(() => {
    const authenticated = authManager.isAuthenticated();
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      setTimeRemaining(authManager.getTimeUntilExpiry());
    } else {
      setTimeRemaining(0);
    }
  }, [authManager]);

  // 초기 인증 상태 확인 및 타이머 설정
  useEffect(() => {
    checkAuthStatus();
    
    // 1초마다 세션 상태 체크
    const interval = setInterval(checkAuthStatus, 1000);
    
    return () => clearInterval(interval);
  }, [checkAuthStatus]);

  // 폼 제출 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!accessCode.trim()) {
      setError("접근 코드를 입력해주세요");
      return;
    }

    const success = authManager.authenticate(accessCode);
    if (success) {
      setAccessCode("");
      setError("");
      // 인증 성공 후 즉시 상태 업데이트
      setIsAuthenticated(true);
      setTimeRemaining(authManager.getTimeUntilExpiry());
    } else {
      setError("올바르지 않은 접근 코드입니다");
    }
  };

  // 로그아웃 핸들러
  const handleLogout = () => {
    authManager.clearSession();
    setIsAuthenticated(false);
    setTimeRemaining(0);
  };

  // 인증되지 않은 경우 로그인 폼 표시
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              🔐 접근 제한 구역
            </h1>
            <p className="text-gray-600">
              접근 코드를 입력하세요
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="password"
                placeholder="접근 코드"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                autoFocus
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              확인
            </button>
          </form>

          <div className="text-xs text-gray-500 text-center mt-6">
            인증된 사용자만 접근할 수 있습니다
          </div>
        </div>
      </div>
    );
  }

  // 인증된 경우 자식 컴포넌트와 세션 정보 표시
  return (
    <div className="relative">
      {/* 세션 정보 표시 */}
      <div className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-gray-200">
        <div className="text-xs text-gray-600 mb-1">
          세션 만료: {formatTimeRemaining(timeRemaining)}
        </div>
        <button
          onClick={handleLogout}
          className="text-xs bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors"
        >
          로그아웃
        </button>
      </div>

      {/* 보호된 컨텐츠 */}
      {children}
    </div>
  );
} 