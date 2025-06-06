# 육아 전문가 이모 AI 챗봇 🍼

Gemini AI를 활용한 믿음직한 육아 전문가 이모와의 상담 서비스입니다.

## 🌟 주요 기능

### 💬 AI 채팅 상담
- **전문적인 육아 조언**: Gemini AI 기반의 따뜻하고 전문적인 육아 상담
- **친근한 이모 톤**: 이모티콘과 친근한 반말로 편안한 상담 분위기
- **실시간 대화**: 빠른 응답과 자연스러운 대화 흐름

### 🔐 안전한 접근 제어 (서버사이드 인증)
- **JWT 토큰 기반 인증**: 서버에서 접근 코드를 검증하고 안전한 JWT 토큰 발급
- **환경변수 보호**: 접근 코드가 클라이언트에 노출되지 않는 보안 설계
- **세션 관리**: 자동 토큰 갱신 및 만료 시간 표시 (10분)
- **로그아웃 기능**: 언제든지 안전하게 세션 종료 가능

### 📱 반응형 UI/UX
- **모바일 최적화**: 스마트폰에서도 편리한 사용
- **직관적인 인터페이스**: 쉽고 간단한 조작
- **로딩 상태**: 사용자 친화적인 로딩 및 오류 상태 표시

### 🚀 성능 최적화
- **Edge Function**: Vercel Edge Runtime으로 빠른 응답
- **히스토리 관리**: 효율적인 대화 내역 관리
- **토큰 최적화**: 메모리 사용량 최소화

## 🛠 기술 스택

### Frontend
- **Next.js 14** (App Router) - React 풀스택 프레임워크
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 유틸리티 우선 CSS 프레임워크
- **React Hooks** - 현대적인 상태 관리

### Backend
- **Vercel Edge Functions** - 서버리스 백엔드
- **Web Crypto API** - JWT 토큰 생성/검증 (Edge Runtime 호환)
- **인메모리 세션** - 빠른 세션 관리 (MVP 단계)

### AI & API
- **Google Gemini 1.5 Flash** - 무료 티어 활용
- **실시간 응답** - 평균 1초 이내 TTFB
- **컨텍스트 관리** - 최근 10턴 대화 유지

### 테스트 & 개발도구
- **Vitest** - 유닛 테스트 (96개 테스트 통과)
- **React Testing Library** - 컴포넌트 테스트
- **TDD 방식** - 테스트 우선 개발

### 배포 & 호스팅
- **Vercel** - GitHub 연동 자동 배포
- **GitHub** - 형상관리, 브랜치 전략: main 보호

## 🏗 아키텍처

### 시스템 구조
```
[브라우저] ←→ [AuthGate] ←→ [ChatLayout] ←→ [Edge Function] ←→ [Gemini API]
     ↓             ↓               ↓              ↓
[localStorage] [AuthManager] [React State] [Web Crypto API]
```

### 인증 플로우
1. **사용자 접근** → AuthGate에서 접근 코드 요구
2. **서버 검증** → `/api/auth` POST로 접근 코드 검증
3. **JWT 발급** → Web Crypto API로 안전한 토큰 생성
4. **클라이언트 저장** → localStorage에 토큰 저장
5. **세션 관리** → 주기적으로 토큰 유효성 검증
6. **자동 만료** → 10분 후 자동 로그아웃

### API 엔드포인트
- **POST `/api/auth`**: 접근 코드 인증 및 JWT 토큰 발급
- **GET `/api/auth`**: JWT 토큰 검증 및 세션 정보 조회
- **POST `/api/chat`**: 육아 상담 메시지 처리 (인증 필수)

## 🚀 빠른 시작

### 1. 저장소 클론
```bash
git clone https://github.com/사용자명/imo-chatting.git
cd imo-chatting
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경변수 설정
```bash
cp .env.example .env.local
```

`.env.local` 파일 편집:
```env
# Gemini API 키 (필수)
GEMINI_API_KEY=your_gemini_api_key_here

# 접근 제어 설정 (서버사이드만 사용)
ACCESS_CODE=your_access_code_here

# JWT 토큰 서명용 시크릿 키 (프로덕션에서는 안전한 랜덤 문자열 사용)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 4. 개발 서버 실행
```bash
npm run dev
```

### 5. 브라우저에서 확인
`http://localhost:3000` 접속 후 접근 코드 입력

## 🧪 테스트

### 전체 테스트 실행
```bash
npm run test          # 모든 테스트
npm run test:unit      # 유닛 테스트만
npm run test:watch     # 실시간 테스트
npm run test:coverage  # 커버리지 포함
```

### TDD 개발 과정
1. **Red**: 실패하는 테스트 작성
2. **Green**: 테스트를 통과하는 최소 코드 작성
3. **Refactor**: 코드 품질 개선

### 테스트 커버리지
- **API 테스트**: 10개 (인증, 토큰 검증, 환경변수)
- **AuthManager 테스트**: 16개 (인증, 세션, 오류 처리)
- **컴포넌트 테스트**: 55개 (UI, 상호작용, 상태 관리)
- **유틸리티 테스트**: 15개 (로거, 마크다운)
- **총 96개 테스트 통과** ✅

## 🔒 보안 설정

### 환경변수 보안
- **서버사이드만**: `ACCESS_CODE`, `JWT_SECRET`
- **클라이언트 노출 금지**: 모든 인증 관련 데이터
- **Git 보호**: `.env*` 파일 커밋 금지

### JWT 토큰 보안
- **Web Crypto API**: HMAC-SHA256 서명
- **만료 시간**: 10분 (자동 갱신)
- **localStorage**: XSS 방지를 위한 HTTPS 필수

### API 보안
- **CORS 설정**: 허용 도메인 제한
- **Rate Limiting**: Gemini API 무료 티어 보호
- **입력 검증**: 모든 사용자 입력 검증

## 📊 성능 지표

### API 성능 (목표 vs 실제)
- **TTFB**: ≤ 1초 ✅
- **토큰 검증**: ≤ 50ms ✅  
- **세션 관리**: 메모리 효율적 ✅

### 가용성
- **MVP 목표**: 99.5% ✅
- **Edge Function**: 글로벌 배포
- **Gemini API**: 구글 인프라 의존

## 🚀 배포

### Vercel 배포
1. **GitHub 연결**: Vercel Dashboard에서 저장소 연결
2. **환경변수 설정**: Vercel에서 프로덕션 환경변수 입력
3. **자동 배포**: `main` 브랜치 푸시 시 자동 배포

### 환경변수 (Vercel)
```env
ACCESS_CODE=실제_접근_코드
JWT_SECRET=안전한_랜덤_시크릿_키_최소_32바이트
GEMINI_API_KEY=실제_Gemini_API_키
NODE_ENV=production
```

### 도메인 설정
- **기본**: `프로젝트명.vercel.app`
- **커스텀**: Vercel Dashboard에서 도메인 연결

## 📝 개발 가이드

### 프로젝트 구조
```
imo-chatting/
├── app/                     # Next.js App Router
│   ├── page.tsx            # 메인 채팅 페이지
│   ├── layout.tsx          # 전역 레이아웃  
│   └── api/
│       ├── auth/route.ts   # 인증 API (서버사이드)
│       └── chat/route.ts   # 채팅 API
├── components/              # React 컴포넌트
│   ├── AuthGate.tsx        # 인증 게이트
│   ├── ChatLayout.tsx      # 채팅 레이아웃
│   ├── ChatBubble.tsx      # 메시지 버블
│   └── InputBar.tsx        # 입력창
├── lib/                    # 유틸리티 및 로직
│   ├── auth.ts            # AuthManager (클라이언트)
│   ├── chatHandler.ts     # 채팅 비즈니스 로직
│   └── logger.ts          # 로깅 유틸리티
└── tests/                 # 테스트 파일
    ├── unit/              # 유닛 테스트
    ├── integration/       # 통합 테스트
    └── e2e/              # E2E 테스트
```

### 코드 컨벤션
- **TypeScript**: 엄격한 타입 체크
- **ESLint**: 코드 품질 검사
- **Prettier**: 코드 포맷팅 자동화
- **TDD**: 테스트 우선 개발

### Git 워크플로우
1. **Feature Branch**: `feature/기능명`
2. **Pull Request**: 코드 리뷰 필수
3. **Main Branch**: 보호된 브랜치 (자동 배포)

## 🔄 향후 계획

### Phase 2 - 확장성
- **Redis 세션**: 인메모리 → Redis 전환
- **사용자 인증**: 회원가입/로그인 시스템
- **대화 기록**: 영구 저장 및 검색

### Phase 3 - 기능 확장
- **파일 업로드**: 육아 사진 상담
- **실시간 알림**: 중요 육아 정보 푸시
- **커뮤니티**: 부모 간 정보 공유

## 🐛 문제 해결

### 일반적인 문제
1. **인증 실패**: 환경변수 확인 (`ACCESS_CODE`)
2. **토큰 만료**: 10분 후 자동 로그아웃 (정상 동작)
3. **API 오류**: Gemini API 키 및 네트워크 확인

### 디버깅
```bash
# 로그 확인
npm run dev  # 개발 서버 로그

# API 테스트
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"accessCode": "your_code"}'
```

## 📜 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👥 제작자

- **개발자**: [당신의 이름]
- **AI 파트너**: Claude (Anthropic)
- **UI/UX**: Tailwind CSS + 직접 디자인

---

💡 **Tip**: 접근 코드를 잊어버리셨나요? `.env.local` 파일에서 `ACCESS_CODE`를 확인하세요!