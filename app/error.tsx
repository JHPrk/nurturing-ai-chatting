"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <div className="text-center">
        {/* 500 일러스트 영역 */}
        <div className="mb-8">
          <div className="w-64 h-64 mx-auto bg-pink-100 rounded-full flex items-center justify-center">
            <div className="text-6xl">😰</div>
          </div>
        </div>
        
        {/* 에러 메시지 */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          문제가 발생했어요
        </h1>
        <p className="text-gray-600 mb-6 max-w-md">
          일시적인 오류가 발생했습니다.<br />
          잠시 후 다시 시도해주세요.
        </p>
        
        {/* 액션 버튼들 */}
        <div className="space-x-4">
          <button
            onClick={reset}
            className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            다시 시도
          </button>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
} 