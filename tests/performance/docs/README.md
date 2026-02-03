# 예매 프로세스 부하 테스트

이 디렉토리는 예매 시스템의 부하 테스트 스크립트를 포함합니다.

- **백엔드 API 테스트**: k6를 사용한 서버 성능 테스트
- **프론트엔드 E2E 테스트**: Playwright를 사용한 사용자 경험 성능 테스트

---

## 프론트엔드 E2E 부하 테스트 (Playwright)

### 개요

실제 브라우저에서 사용자 예매 플로우를 시뮬레이션하여 프론트엔드 성능을 측정합니다.

### 사전 준비

```bash
# Playwright 설치
pnpm install

# 브라우저 다운로드
npx playwright install chromium
```

### 테스트 스크립트

#### 1. parallel-booking.js - 동시 접속 테스트

여러 사용자가 동시에 예매 플로우를 실행하여 프론트엔드 성능과 안정성을 확인합니다.

**실행 방법:**
```bash
# 5명 동시 접속 (기본값)
node tests/performance/frontend/parallel-booking.js

# 10명 동시 접속
node tests/performance/frontend/parallel-booking.js --users=10

# 시작 행 지정 (7행부터 시작)
node tests/performance/frontend/parallel-booking.js --users=10 --start-row=7

# 비디오 녹화 활성화 (디버깅용)
node tests/performance/frontend/parallel-booking.js --users=5 --save-video

# 스크린샷만 비활성화
node tests/performance/frontend/parallel-booking.js --users=10 --save-screenshot=false

# 모든 옵션 사용
node tests/performance/frontend/parallel-booking.js --users=10 --start-row=7 --save-video --save-screenshot
```

**옵션:**
- `--users=N`: 동시 접속 사용자 수 (기본값: 5, 최대: 20)
- `--start-row=N`: 시작 행 번호 (기본값: 1, 1-based, 1-10 범위)
- `--save-video[=true]`: 비디오 녹화 활성화 (기본값: false)
- `--save-screenshot[=true]`: 실패 시 스크린샷 저장 (기본값: true)

**테스트 플로우:**
1. 로그인: `qa_tester_[userId]@example.com` / 비밀번호 `12341234`
2. 예매하기 → 회차 선택
3. 좌석 2개 선택 (Row/Col 기반)
   - 10행 × 20열 좌석 구조
   - 시작 행(`--start-row`)에서부터 userId에 따라 순차적으로 2개씩 선택
   - User 1: (startRow, 1), (startRow, 2)
   - User 2: (startRow, 3), (startRow, 4)
   - User 11: (startRow+1, 1), (startRow+1, 2)
   - 20열 초과 시 자동으로 다음 행으로 이동
4. 할인 적용 (동적 수량 계산)
   - 각 좌석 등급별 필요 수량을 자동으로 파싱
   - 필요한 수량만큼만 + 버튼 클릭
5. 결제 처리 (은행 선택 → 전체 동의 → 결제하기 → 팝업에서 결제승인)
6. Alert 확인 후 메인 페이지 이동

**좌석 할당 전략:**
- 각 사용자는 userId에 따라 고유한 좌석 위치 할당
- 중복 선택 방지: 사용자별로 서로 다른 좌석 선택
- 경쟁 조건 없음: 시작 행이 비어있다는 전제하에 동작

**측정 항목:**
- 각 사용자별 전체 완료 시간
- 평균/최소/최대 완료 시간
- 성공률 (100% 목표)

**성공 기준:**
- 성공률 > 95%
- 평균 완료 시간 < 35초

**출력 예시:**
```
============================================================
병렬 예매 부하 테스트 시작
동시 접속 사용자: 10명
============================================================

[User 1] 시작
[User 2] 시작
...
[User 1] ✓ 성공 (28450ms)
[User 2] ✓ 성공 (29120ms)
...

============================================================
테스트 결과 요약
============================================================
전체 소요 시간: 32580ms (32.58초)

[성공률]
  성공: 10명 / 전체: 10명
  성공률: 100.00%

[완료 시간 (성공한 사용자 기준)]
  평균: 29235ms (29.24초)
  최소: 28450ms (28.45초)
  최대: 31200ms (31.20초)
============================================================

[성공 기준 검증]
  ✓ 통과 - 성공률 > 95%: 100.00%
  ✓ 통과 - 평균 완료 시간 < 35초: 29.24초

✅ 모든 성공 기준 충족!
```

### 왜 순수 Node.js 스크립트인가요?

이 테스트는 Playwright 테스트 러너 대신 순수 Node.js 스크립트로 작성되었습니다:

**순수 Node.js 사용 이유:**
- ✅ **커스텀 병렬 제어**: 동시 접속 사용자 수를 동적으로 조절
- ✅ **결과 집계**: 각 사용자별 성공/실패를 수집하고 통계 계산
- ✅ **유연한 리포팅**: 커스텀 포맷으로 결과 출력 (성공률, 평균/최소/최대 시간 등)
- ✅ **세밀한 제어**: 비디오/스크린샷 저장을 사용자별로 제어
- ✅ **간단한 실행**: `node` 명령어로 바로 실행 가능

**Playwright 테스트 러너 사용 시 제약:**
- 병렬 실행 수 제어가 복잡함
- 커스텀 통계 집계가 어려움
- 설정 파일이 필요함

**단순 E2E 테스트는 Playwright 테스트 러너 사용:**
- `tests/e2e/booking-flow.spec.ts` - 단일 사용자 플로우 테스트
- `npx playwright test` 명령어로 실행

### 테스트 결과 저장

옵션으로 활성화 가능:

```
test-results/
├── videos/          # 실패한 테스트의 비디오 (--save-video 옵션 시)
└── screenshots/     # 실패 시 스크린샷 (--save-screenshot 옵션 시, 기본 활성화)
    └── user-[userId]-failure.png
```

**참고:**
- 비디오 녹화는 리소스를 많이 사용하므로 기본적으로 비활성화
- 디버깅이 필요할 때만 `--save-video` 옵션 사용 권장
- 스크린샷은 가벼우므로 기본적으로 활성화

### 주의사항

1. **테스트 환경**: 반드시 개발/스테이징 환경에서만 실행
2. **테스트 계정**: 로그인 정보가 미리 설정되어 있어야 함
   - `qa_tester_1@example.com` ~ `qa_tester_20@example.com`
   - 비밀번호: `12341234`
3. **동시 접속 수 제한**: 브라우저 리소스 소비가 크므로 1~20명 권장
4. **실제 결제**: 테스트 후 생성된 예매/결제 데이터 정리 필요

---

## 백엔드 API 부하 테스트 (k6)

## 사전 준비

### 1. k6 설치

**Windows (Chocolatey):**
```bash
choco install k6
```

**Windows (winget):**
```bash
winget install k6
```

**macOS (Homebrew):**
```bash
brew install k6
```

**Linux:**
```bash
# Debian/Ubuntu
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

설치 확인:
```bash
k6 version
```

### 2. 테스트 계정 준비

부하 테스트를 위해서는 테스트용 계정이 필요합니다.

**방법 1: 기존 계정 사용 (간단한 테스트)**
- 로그인 후 브라우저 개발자 도구에서 인증 토큰 복사
- `.env` 파일에 토큰 설정

**방법 2: 테스트 계정 자동 생성 (권장)**
- 백엔드 팀에 요청하여 테스트 데이터 시드 스크립트 실행
- 예: `loadtest1@example.com` ~ `loadtest100@example.com`

## 테스트 스크립트

### 1. booking-load.js

**목적**: 전체 예매 프로세스 부하 테스트

100명의 가상 유저가 동시에 다음 프로세스를 수행합니다:
1. 로그인
2. 좌석 선택 (예매 시작)
3. 결제 생성
4. 결제 완료

**실행 방법:**
```bash
# 기본 실행
k6 run tests/performance/backend/booking-load.js

# 환경 변수와 함께 실행
k6 run -e SCHEDULE_ID=123 -e TOTAL_USERS=50 tests/performance/backend/booking-load.js
```

**주요 메트릭:**
- 총 요청 수
- 평균/P95 응답 시간
- 에러율
- 예매 성공률
- 결제 성공률

### 2. simple-booking.js

**목적**: 좌석 예약 동시성 충돌 테스트

100명의 유저가 동시에 같은 좌석을 예약하려고 시도합니다.
이를 통해 서버의 동시성 처리 로직을 검증할 수 있습니다.

**실행 방법:**
```bash
# 인증 토큰과 함께 실행
k6 run -e AUTH_TOKEN="your_token_here" -e SCHEDULE_ID=123 -e SEAT_ID=1 tests/performance/backend/simple-booking.js

# 환경 변수 파일 사용
k6 run --env-file .env tests/performance/backend/simple-booking.js
```

**주요 메트릭:**
- 성공한 예매 수 (1개만 성공해야 함)
- 충돌 에러 수 (409 Conflict)
- 예매 API 응답 시간

## 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일 생성:

```bash
cp .env.example .env
```

`.env` 파일 수정:
```bash
# API 베이스 URL
BASE_URL=https://ticket-api.devhong.cc/api

# 테스트할 공연 회차 ID (실제 존재하는 ID로 변경)
SCHEDULE_ID=1

# 동시 테스트 유저 수
TOTAL_USERS=100

# 인증 토큰 (브라우저 개발자 도구에서 복사)
AUTH_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 테스트할 좌석 정보
SEAT_ID=1
SEAT_ROW=A
SEAT_COL=1
```

## 인증 토큰 확인 방법

1. 브라우저에서 https://ticket.devhong.cc 접속
2. 로그인
3. 개발자 도구 열기 (F12)
4. Application 탭 > Cookies > `https://ticket.devhong.cc` 선택
5. `accessToken` 또는 인증 쿠키 값 복사
6. `.env` 파일의 `AUTH_TOKEN`에 붙여넣기

## 테스트 시나리오

### 시나리오 1: 서버 부하 테스트

**목표**: 100명의 동시 접속 시 서버 성능 확인

```bash
k6 run -e TOTAL_USERS=100 tests/performance/backend/booking-load.js
```

**확인 사항**:
- 평균 응답 시간 < 1초
- P95 응답 시간 < 2초
- 에러율 < 10%

### 시나리오 2: 좌석 충돌 테스트

**목표**: 동시성 제어 로직 검증

```bash
k6 run -e USERS=100 -e AUTH_TOKEN="your_token" tests/performance/backend/simple-booking.js
```

**예상 결과**:
- 성공한 예매: 1개
- 충돌 에러 (409): 99개
- 모든 요청이 2초 이내 응답

### 시나리오 3: 점진적 부하 증가 테스트

테스트 스크립트의 `options.stages` 수정:
```javascript
export const options = {
  stages: [
    { duration: '1m', target: 50 },   // 1분간 50명으로 증가
    { duration: '2m', target: 100 },  // 2분간 100명으로 증가
    { duration: '3m', target: 100 },  // 3분간 100명 유지
    { duration: '1m', target: 0 },    // 1분간 0명으로 감소
  ],
};
```

## 결과 분석

### 테스트 실행 시 출력 예시

```
✓ 로그인 성공
✓ 예매 시작 성공
✓ 예매 응답에 bookingId 포함
✓ 결제 생성 성공
✓ 결제 완료 성공

checks.........................: 95.00% ✓ 475  ✗ 25
data_received..................: 1.2 MB 40 kB/s
data_sent......................: 890 kB 30 kB/s
http_req_duration..............: avg=850ms  p(95)=1.8s
http_reqs......................: 500    16.67/s
vus............................: 100    min=0  max=100

=== 최종 결과 ===
{
  "총_요청_수": 500,
  "평균_응답_시간": "850.00ms",
  "P95_응답_시간": "1800.00ms",
  "에러율": "5.00%",
  "예매_성공률": "92.00%",
  "결제_성공률": "88.00%"
}
```

### 주요 메트릭 설명

| 메트릭 | 설명 | 목표값 |
|--------|------|--------|
| `http_req_duration` | HTTP 요청 응답 시간 | P95 < 2초 |
| `http_reqs` | 초당 요청 수 (RPS) | - |
| `checks` | 검증 성공률 | > 90% |
| `errors` | 에러율 | < 10% |
| `booking_success` | 예매 성공률 | > 70% |
| `payment_success` | 결제 성공률 | > 70% |

### 문제 진단

**응답 시간이 느린 경우**:
- 데이터베이스 쿼리 최적화 필요
- 인덱스 추가 검토
- 캐싱 전략 도입

**에러율이 높은 경우**:
- 서버 로그 확인
- 동시성 제어 로직 검토
- 데이터베이스 커넥션 풀 크기 조정

**충돌 에러가 많은 경우 (예상된 동작)**:
- 동시성 제어가 정상 작동하는 것
- 단, 응답 시간이 너무 길면 락 타임아웃 조정 필요

## 고급 사용법

### 1. HTML 리포트 생성

```bash
k6 run --out json=results.json tests/performance/backend/booking-load.js
```

### 2. InfluxDB + Grafana 연동

```bash
k6 run --out influxdb=http://localhost:8086/k6 tests/performance/backend/booking-load.js
```

### 3. 클라우드 k6 사용

```bash
k6 cloud tests/performance/backend/booking-load.js
```

## 주의사항

1. **운영 환경에서 절대 실행하지 마세요**
   - 반드시 개발/스테이징 환경에서만 실행
   - 실제 결제가 발생할 수 있음

2. **테스트 데이터 정리**
   - 테스트 후 생성된 예매/결제 데이터 삭제
   - 백엔드 팀에 데이터 정리 스크립트 요청

3. **API Rate Limiting**
   - 서버에 rate limiting이 있다면 조정 필요
   - 테스트 IP 화이트리스트 등록

4. **동시 접속 수 조절**
   - 처음에는 적은 수로 시작 (10-20명)
   - 점진적으로 증가시켜 서버 부하 확인

## 트러블슈팅

### 문제: "로그인 실패" 에러

**원인**: 테스트 계정이 존재하지 않음

**해결**:
- 백엔드 팀에 테스트 계정 생성 요청
- 또는 `simple-booking.js`를 사용하여 단일 계정으로 테스트

### 문제: "401 Unauthorized" 에러

**원인**: 인증 토큰이 만료되었거나 잘못됨

**해결**:
- 브라우저에서 다시 로그인하여 새 토큰 복사
- 쿠키 형식이 맞는지 확인

### 문제: "CORS 에러"

**원인**: 브라우저에서 직접 실행 시도

**해결**:
- k6는 CLI 도구이므로 터미널에서 실행해야 함
- 브라우저가 아닌 명령줄에서 `k6 run` 명령 사용

## 참고 자료

- [k6 공식 문서](https://k6.io/docs/)
- [k6 예제 모음](https://k6.io/docs/examples/)
- [k6 메트릭 가이드](https://k6.io/docs/using-k6/metrics/)