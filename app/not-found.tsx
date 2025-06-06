import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <div className="text-center">
        {/* 404 일러스트 영역 */}
        <div className="mb-8">
          <div className="w-64 h-64 mx-auto bg-pink-100 rounded-full flex items-center justify-center">
            <div className="text-6xl">😅</div>
          </div>
        </div>
        
        {/* 에러 메시지 */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          페이지를 찾을 수 없어요
        </h1>
        <p className="text-gray-600 mb-6 max-w-md">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있어요.<br />
          멘토와 함께 육아 상담을 받아보세요!
        </p>
        
        {/* 홈 버튼 */}
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
} 