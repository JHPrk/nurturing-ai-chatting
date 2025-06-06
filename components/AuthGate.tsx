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
 * 서버 API를 통한 접근 코드 검증 및 JWT 토큰 기반 세션 관리
 */
export function AuthGate({ children }: AuthGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // AuthManager 인스턴스 생성 (더 이상 접근 코드가 필요하지 않음)
  const [authManager] = useState(() => new AuthManager());

  // 서버에서 인증 상태 확인
  const checkAuthStatus = useCallback(async () => {
    try {
      // 빠른 체크: 로컬에 토큰이 있는지 확인
      if (!authManager.hasToken()) {
        setIsAuthenticated(false);
        setTimeRemaining(0);
        setIsLoading(false);
        return;
      }

      // 서버에서 토큰 유효성 검증
      const authenticated = await authManager.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        const remaining = await authManager.getTimeUntilExpiry();
        setTimeRemaining(remaining);
      } else {
        setTimeRemaining(0);
      }
    } catch (error) {
      console.error("Auth status check failed:", error);
      setIsAuthenticated(false);
      setTimeRemaining(0);
    } finally {
      setIsLoading(false);
    }
  }, [authManager]);

  // 초기 인증 상태 확인 및 타이머 설정
  useEffect(() => {
    checkAuthStatus();
    
    // 인증된 상태에서만 주기적으로 상태 체크
    const interval = setInterval(async () => {
      if (authManager.hasToken()) {
        await checkAuthStatus();
      }
    }, 5000); // 5초마다 체크 (서버 호출 빈도 줄임)
    
    return () => clearInterval(interval);
  }, [checkAuthStatus, authManager]);

  // 1초마다 남은 시간 업데이트 (UI만)
  useEffect(() => {
    if (!isAuthenticated || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        const next = prev - 1000;
        if (next <= 0) {
          // 시간 만료 시 즉시 인증 상태 재확인
          checkAuthStatus();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAuthenticated, timeRemaining, checkAuthStatus]);

  // 폼 제출 핸들러 (비동기)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!accessCode.trim()) {
      setError("접근 코드를 입력해주세요");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await authManager.authenticate(accessCode);
      if (result.success) {
        setAccessCode("");
        setError("");
        // 인증 성공 후 상태 업데이트
        await checkAuthStatus();
      } else {
        setError(result.error || "인증에 실패했습니다");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setError("서버와의 통신에 실패했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 로그아웃 핸들러
  const handleLogout = () => {
    authManager.clearSession();
    setIsAuthenticated(false);
    setTimeRemaining(0);
  };

  // 초기 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">인증 상태를 확인하는 중...</p>
        </div>
      </div>
    );
  }

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
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  확인 중...
                </div>
              ) : (
                "확인"
              )}
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