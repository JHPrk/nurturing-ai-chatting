# 육아 전문가 Gemini 챗봇 (MVP)

따뜻하고 믿음직한 육아 전문가와 함께하는 AI 육아 상담 서비스입니다.

## 🚀 주요 기능

- **실시간 채팅**: Gemini API 기반 자연스러운 대화
- **육아 전문 상담**: 수유, 수면, 이유식 등 육아 전반 조언
- **친근한 톤**: 이모티콘과 반말로 따뜻한 소통
- **반응형 UI**: 모바일/데스크톱 최적화
- **세션 관리**: 대화 히스토리 유지

## 🛠 기술 스택

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Vercel Edge Functions
- **AI**: Google Gemini API
- **배포**: Vercel

## 📋 요구사항

- Node.js ≥ 18 LTS
- npm ≥ 9 또는 pnpm 최신 버전
- Gemini API 키

## 🔧 로컬 개발 환경 설정

### 1. 프로젝트 클론
```bash
git clone https://github.com/JHPrk/nurturing-ai-chatting.git
cd nurturing-ai-chatting
```

### 2. 의존성 설치
```bash
npm install
# 또는
pnpm install
```

### 3. 환경변수 설정
```bash
# .env.local 파일 생성
cp .env.example .env.local

# .env.local 파일 편집
GEMINI_API_KEY=여기에_발급받은_Gemini_API_키_입력
```

### 4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 🌐 배포

### Vercel 배포 (권장)

1. [Vercel Dashboard](https://vercel.com/dashboard)에서 프로젝트 생성
2. GitHub 레포지토리 연결
3. 환경변수 설정:
   - `GEMINI_API_KEY`: Gemini API 키
   - `NEXT_PUBLIC_ACCESS_CODE`: 서버 접근 코드
4. 자동 배포 완료

### 환경변수 설정
```bash
# Production 환경
GEMINI_API_KEY=실제_API_키
NODE_ENV=production
NEXT_PUBLIC_ACCESS_CODE=8자리_영어_숫자_특수문자

# 로깅 설정 (선택사항)
LOG_LEVEL=error  # debug, info, warn, error, none
```

## 📁 프로젝트 구조

```
nurturing-ai-chatting/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 메인 채팅 페이지
│   ├── layout.tsx         # 전역 레이아웃
│   ├── not-found.tsx      # 404 페이지
│   ├── error.tsx          # 500 페이지
│   └── api/chat/
│       └── route.ts       # Edge Function 핸들러
├── lib/                   # 유틸리티 및 로직
│   ├── chatHandler.ts     # 채팅 비즈니스 로직
│   └── tokenizer.ts       # 토큰 계산 유틸
├── components/            # React 컴포넌트 (향후 분리)
├── tests/                 # 테스트 파일
└── public/               # 정적 파일
```

## 🧪 테스트

```bash
# 유닛 테스트
npm run test

# 테스트 커버리지
npm run test:coverage

# E2E 테스트
npm run test:e2e

# 로거 테스트
npm run test:logger        # 개발 환경
npm run test:logger:prod   # 프로덕션 환경
```

## 📊 API 명세

### POST /api/chat

**요청**:
```typescript
{
  "sessionId": "optional-session-id",
  "history": [
    {"role": "user", "content": "안녕하세요"},
    {"role": "assistant", "content": "안녕! 😊"}
  ],
  "message": "수면훈련 방법 알려주세요"
}
```

**응답**:
```typescript
{
  "text": "수면훈련은 아기의 월령에 따라 달라져요 😊..."
}
```

## 📝 로깅 설정

프로덕션 환경에서는 console.log가 자동으로 비활성화되며, 에러만 출력됩니다.

### 로그 레벨 제어
```bash
# 환경변수로 로그 레벨 설정
LOG_LEVEL=debug   # 모든 로그 출력 (개발용)
LOG_LEVEL=info    # info, warn, error 출력
LOG_LEVEL=warn    # warn, error 출력
LOG_LEVEL=error   # error만 출력 (프로덕션 기본값)
LOG_LEVEL=none    # 모든 로그 비활성화
```

### 기본 동작
- **Development**: 모든 로그 레벨 출력 (debug, info, warn, error)
- **Production**: 에러만 출력 (error)

### 로그 형식
```
[2024-01-15T10:30:45.123Z][ERROR] API 호출 실패: Network timeout
[2024-01-15T10:30:45.124Z][DEBUG] 히스토리 슬라이싱 완료: 5개 → 3개
```

## 🔒 보안

- API 키는 환경변수에만 저장
- 클라이언트 사이드 노출 금지
- HTTPS 전송 (Vercel 기본 제공)
- 입력 검증 및 길이 제한

## 📈 성능

- **목표 TTFB**: ≤ 1초
- **Edge Function**: 서울 리전 (icn1)
- **히스토리 슬라이싱**: 최근 10턴 유지
- **토큰 제한**: 6,000토큰 이내

## 🐛 문제 해결

### 일반적인 오류

1. **GEMINI_API_KEY not configured**
   - `.env.local` 파일에 API 키 확인
   - Vercel 환경변수 설정 확인

2. **429 Too Many Requests**
   - Gemini 무료 티어 한도 초과
   - 잠시 후 재시도

3. **빌드 오류**
   ```bash
   npm run build --verbose
   ```

### 로그 확인
```bash
# Vercel 함수 로그
npx vercel logs --follow

# 로컬 개발 로그
npm run dev
```

## 🚧 향후 계획 (2단계)

- [ ] Redis 기반 세션 저장소
- [ ] 사용자 인증 시스템
- [ ] 대화 기록 영구 저장
- [ ] 스트리밍 응답
- [ ] 다크 모드 지원

## 📄 라이선스

MIT License

## 🤝 기여

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 생성해주세요.

---

**Made with ❤️ for 육아맘/육아빠들**

## 🔐 인증 시스템

이 애플리케이션은 무분별한 사용을 방지하기 위해 접근 코드 인증 시스템을 포함하고 있습니다.

### 접근 코드 설정

환경변수에서 접근 코드를 설정할 수 있습니다:

```bash
# .env.local 파일에 추가
NEXT_PUBLIC_ACCESS_CODE=Your8Ch@r  # 8자 영어+숫자+특수문자
```

### 인증 기능

- **접근 제한**: 메인 페이지 진입 시 접근 코드 입력 필요
- **세션 관리**: 인증 후 10분간 유효한 세션 생성
- **자동 만료**: 세션 만료 시 자동 로그아웃
- **API 보호**: 모든 API 호출에 인증 토큰 필요

### 보안 특징

- 클라이언트 사이드 세션 저장 (localStorage)
- 실시간 세션 만료 타이머
- API 레벨 인증 검증
- 세션 만료 시 자동 리다이렉트

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# Gemini API 키
GEMINI_API_KEY=your_gemini_api_key_here

# 접근 코드 (8자 영어+숫자+특수문자)
NEXT_PUBLIC_ACCESS_CODE=your_secret_here
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열고 접근 코드를 입력하세요.

## 🧪 테스트

### 전체 테스트 실행

```bash
npm run test
```

### 인증 시스템 테스트

```bash
# 인증 로직 유닛 테스트
npm run test tests/unit/lib/auth.test.ts

# 인증 컴포넌트 통합 테스트
npm run test tests/integration/AuthGate.test.tsx

# API 인증 테스트
npm run test tests/unit/api/auth-api.test.ts
```

## 📁 프로젝트 구조

```
├── components/
│   ├── AuthGate.tsx          # 인증 게이트 컴포넌트
│   └── ...
├── lib/
│   ├── auth.ts               # 인증 관리 클래스
│   └── ...
├── app/
│   ├── api/chat/route.ts     # 인증이 적용된 API 라우트
│   └── page.tsx              # AuthGate로 보호된 메인 페이지
└── tests/
    ├── unit/lib/auth.test.ts           # 인증 로직 테스트
    ├── integration/AuthGate.test.tsx   # 인증 UI 테스트
    └── unit/api/auth-api.test.ts       # API 인증 테스트
```

## 🔧 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Vercel Edge Functions
- **AI**: Google Gemini API
- **인증**: 클라이언트 사이드 세션 관리
- **테스트**: Vitest, React Testing Library

## 🛡️ 보안 고려사항

### 현재 구현 (MVP)
- 클라이언트 사이드 접근 코드 검증
- localStorage 기반 세션 관리
- API 레벨 Bearer 토큰 검증

### 향후 개선 사항
- 서버 사이드 세션 검증
- JWT 토큰 기반 인증
- Redis 기반 세션 저장소
- 레이트 리미팅

## 📝 사용법

1. **접근**: 브라우저에서 애플리케이션에 접속
2. **인증**: 설정된 접근 코드 입력
3. **채팅**: 육아 관련 질문 입력
4. **세션**: 10분 후 자동 만료 (우상단에서 남은 시간 확인)
5. **로그아웃**: 수동 로그아웃 또는 자동 만료

## 🚀 배포

### Vercel 배포

1. Vercel에 프로젝트 연결
2. 환경변수 설정:
   - `GEMINI_API_KEY`: Gemini API 키
   - `NEXT_PUBLIC_ACCESS_CODE`: 접근 코드
3. 자동 배포 완료

### 환경변수 보안

- `GEMINI_API_KEY`: 서버 사이드 전용 (Vercel 환경변수)
- `NEXT_PUBLIC_ACCESS_CODE`: 클라이언트 노출 (브라우저에서 접근 가능)

⚠️ **주의**: `NEXT_PUBLIC_` 접두사가 붙은 환경변수는 브라우저에 노출됩니다. 민감한 정보는 포함하지 마세요.

## 🤝 기여

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

This project is licensed under the MIT License.

---

**개발자**: TDD 방식으로 구현된 안전한 육아 상담 챗봇 🍼✨
