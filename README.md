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
NEXT_PUBLIC_ACCESS_CODE=8자리_영어_숫자_특수문자
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

### (Korean Version)
1. 프로젝트를 포크하세요
2. 기능 브랜치를 생성하세요 (git checkout -b feature/AmazingFeature)
3. 변경사항을 커밋하세요 (git commit -m 'Add some AmazingFeature')
4. 브랜치에 푸시하세요 (git push origin feature/AmazingFeature)
5. 풀 리퀘스트를 열어주세요


### (English Version)
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 생성해주세요.

---

**Made with ❤️ for 육아맘/육아빠들**