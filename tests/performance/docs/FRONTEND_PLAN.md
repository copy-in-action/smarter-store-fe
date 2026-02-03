# 프론트엔드 부하 테스트 플랜

## 문서 정보

| 항목 | 내용 |
|------|------|
| 작성일 | 2026-01-29 |
| 프로젝트 | Smarter Store 티켓 예매 시스템 (Frontend) |
| 테스트 대상 | Next.js 기반 웹 애플리케이션 |
| 테스트 도구 | Playwright, Lighthouse, k6 Browser |

---

## 1. 프론트엔드 vs 백엔드 테스트 차이점

### 1.1 백엔드 API 테스트 
```
✅ k6로 API 엔드포인트 직접 호출
✅ 빠르고 가벼움 (네트워크 요청만)
✅ 대량의 가상 유저 시뮬레이션 가능 (1000명+)
✅ 서버 성능에 집중
```

### 1.2 프론트엔드 부하 테스트 (본 문서)
```
📱 실제 브라우저에서 사용자 행동 시뮬레이션
📱 JavaScript 실행, 렌더링, 네트워크 등 모든 과정 포함
📱 제한된 동시 접속 (브라우저 리소스 소비)
📱 사용자 경험(UX) 성능에 집중
```

---

## 2. 프론트엔드 테스트 목적

### 2.1 주요 목표

#### 사용자 경험 성능 검증
- **페이지 로딩 시간**: 사용자가 체감하는 로딩 속도
- **인터랙션 반응성**: 버튼 클릭, 폼 입력 등의 반응 속도
- **렌더링 성능**: 좌석 배치도 등 복잡한 UI 렌더링

#### Core Web Vitals 측정
| 메트릭 | 설명 | 목표값 |
|--------|------|--------|
| **LCP** (Largest Contentful Paint) | 최대 콘텐츠 렌더링 시간 | < 2.5초 |
| **FID** (First Input Delay) | 첫 입력 지연 시간 | < 100ms |
| **CLS** (Cumulative Layout Shift) | 누적 레이아웃 이동 | < 0.1 |
| **FCP** (First Contentful Paint) | 첫 콘텐츠 렌더링 시간 | < 1.8초 |
| **TTI** (Time to Interactive) | 상호작용 가능 시간 | < 3.8초 |

#### 클라이언트 리소스 사용
- 메모리 사용량 (Memory Leak 검증)
- CPU 사용률
- 네트워크 대역폭

---

## 3. 테스트 도구 선택

### 3.1 도구 비교

| 도구 | 장점 | 단점 | 추천 용도 |
|------|------|------|-----------|
| **Playwright** | 빠름, 여러 브라우저 지원, 병렬 실행 | 대량 부하 테스트 어려움 | E2E 성능 테스트 |
| **Cypress** | 개발자 친화적, 디버깅 쉬움 | 느림, Chrome만 지원 | 기능 테스트 |
| **k6 Browser** | k6 + 브라우저, 부하 테스트 가능 | 실험적 기능 | 하이브리드 테스트 |
| **Puppeteer** | Chrome 최적화, 가벼움 | Chrome만 지원 | 크롤링, 스크린샷 |
| **Selenium Grid** | 여러 브라우저, 분산 실행 | 느림, 복잡한 설정 | 대규모 병렬 테스트 |
| **Lighthouse** | 성능 분석 상세, CI 통합 | 부하 테스트 불가 | 성능 측정 |

### 3.2 권장 조합

```
1차: Playwright (E2E 성능 테스트)
  → 실제 사용자 시나리오 시뮬레이션
  → 10-20명 동시 접속

2차: Lighthouse (성능 측정)
  → Core Web Vitals 측정
  → 페이지별 성능 점수

3차: k6 Browser (부하 테스트)
  → Playwright + k6 조합
  → 50-100명 동시 접속 (선택사항)
```

---

## 4. 테스트 시나리오

### 4.1 시나리오 1: 페이지 로딩 성능 테스트

**목적**: 주요 페이지의 로딩 성능 측정

**테스트 페이지**:
```
1. 홈페이지 (/)
2. 공연 목록 (/performances)
3. 공연 상세 (/performances/[id])
4. 좌석 선택 (/booking/seating-chart)
5. 결제 페이지 (/booking/payment)
```

**측정 항목**:
- LCP, FID, CLS, FCP, TTI
- 페이지 크기 (HTML, CSS, JS, Images)
- 네트워크 요청 수
- 캐시 효율성

**Lighthouse 실행**:
```bash
# 단일 페이지 측정
npx lighthouse https://ticket.devhong.cc/performances/1 \
  --output html \
  --output-path ./reports/performance-detail.html

# 여러 페이지 일괄 측정 (스크립트)
node scripts/lighthouse-batch.js
```

**성공 기준**:
- [ ] 모든 페이지 Lighthouse 성능 점수 > 90
- [ ] LCP < 2.5초
- [ ] FID < 100ms
- [ ] CLS < 0.1

---

### 4.2 시나리오 2: E2E 예매 플로우 (Playwright)

**목적**: 실제 사용자의 예매 전 과정을 시뮬레이션하여 성능 측정

**테스트 단계**:
1. **로그인**: https://ticket.devhong.cc/auth/login/email?redirect=%2Fperformances%2F4 접속 → "로그인하기" 버튼 클릭
2. **예매하기**: 리다이렉트된 공연 상세 페이지에서 "예매하기" 버튼 클릭
3. **회차 선택**: 표시된 달력과 회차 모달에서 첫 번째 회차 선택 후 "예매하기" 버튼 클릭
4. **좌석 선택**: 선택 가능한 좌석 2개 선택 후 "선택완료" 버튼 클릭
5. **할인 적용**: 할인 항목 0번 인덱스 + 버튼 2번 클릭 후 "예매하기" 클릭
6. **결제 처리**:
   - 은행 선택 combobox 클릭 → 첫 번째 은행(0번 인덱스) 선택
   - "전체 동의" 버튼 클릭
   - "결제하기" 버튼 클릭
   - 새 창(팝업)에서 "결제승인" 버튼 클릭
   - Alert 확인 후 메인 페이지로 이동

**측정 항목**:
- 각 단계별 소요 시간 (로그인, 모달 표시, 회차 선택, 좌석 선택, 할인 적용, 결제 처리)
- 페이지 전환 시간
- 모달/팝업 표시 시간
- 전체 플로우 완료 시간

**성공 기준**:
- [x] 전체 플로우 완료 시간 < 30초
- [x] 로그인 < 3초
- [x] 모달 표시 < 2초
- [x] 회차 선택 < 3초
- [x] 좌석 선택 반응 < 500ms
- [x] 할인 적용 < 1초
- [x] 결제 처리 < 5초

**구현 파일**: `e2e/booking-flow.spec.ts`

---

### 4.3 시나리오 3: 동시 접속 테스트 (Playwright 병렬)

**목적**: 여러 사용자가 동시에 예매할 때 프론트엔드 성능 및 안정성 확인

**테스트 방법**:
- 동일한 예매 플로우(4.2 시나리오)를 여러 사용자가 동시 실행
- **각 사용자는 서로 다른 좌석 선택** (동시성 충돌 방지)
- 각 사용자별 소요 시간 측정
- 성공/실패 여부 추적

**실행 방법**:
```bash
# 5명 동시 접속 (기본값)
node load-test/parallel-booking-test.js

# 10명 동시 접속
node load-test/parallel-booking-test.js --users=10

# 시작 행 지정 (7행부터 시작)
node load-test/parallel-booking-test.js --users=10 --start-row=7

# 비디오 녹화 활성화 (디버깅용)
node load-test/parallel-booking-test.js --users=5 --save-video

# 옵션:
# --users=N                  동시 접속 사용자 수 (기본값: 5, 최대: 20)
# --start-row=N              시작 행 번호 (기본값: 1, 1-based, 1-10 범위)
# --save-video[=true]        비디오 녹화 활성화 (기본값: false)
# --save-screenshot[=true]   스크린샷 저장 활성화 (기본값: true)
```

**테스트 플로우** (사용자별):
1. **로그인**: `qa_tester_[userId]@example.com` / 비밀번호 `12341234`
   - User 1: `qa_tester_1@example.com`
   - User 2: `qa_tester_2@example.com`
   - ...
2. 예매하기 → 회차 선택
3. **좌석 2개 선택** (Row/Col 기반, 10행 × 20열 구조)
   - 시작 행(`--start-row`)에서부터 userId에 따라 순차적으로 2개씩 선택
   - 각 사용자는 고유한 좌석 위치 할당 (중복 없음)
   - 20열 초과 시 자동으로 다음 행으로 이동
4. 할인 적용 (각 좌석 등급별 필요 수량만큼 + 버튼 클릭)
   - 아코디언 타이틀에서 "0 / 2" 형식의 수량 파싱
   - 각 등급별로 필요한 수량만큼 자동 계산하여 추가
5. 결제 처리 (은행 선택 → 전체 동의 → 결제하기 → 팝업에서 결제승인)
6. Alert 확인 후 메인 페이지 이동

**좌석 할당 알고리즘**:
- 10행 × 20열 좌석 구조 기반
- 각 사용자는 userId에 따라 고유한 행/열 위치 할당:
  - User 1: (startRow, 1), (startRow, 2)
  - User 2: (startRow, 3), (startRow, 4)
  - User 10: (startRow, 19), (startRow, 20)
  - User 11: (startRow+1, 1), (startRow+1, 2)
  - ...
- 중복 선택 방지: 각 사용자가 서로 다른 좌석 선택
- 최대 사용자 수: 20명 (브라우저 리소스 고려)

**측정 항목**:
- 각 사용자별 전체 완료 시간
- 평균/최소/최대 완료 시간
- 성공률 (모든 사용자 성공 목표: 100%)
- 실패 원인 (에러 메시지)

**성공 기준**:
- [x] 5명 동시 접속 시 모든 사용자 정상 동작 (100%)
- [x] 10명 동시 접속 시 모든 사용자 정상 동작 (100%)
- [x] 평균 완료 시간 < 35초
- [x] 브라우저 메모리 사용량 안정적

**구현 파일**: `load-test/parallel-booking-test.js`

---

### 4.4 시나리오 4: 좌석 배치도 렌더링 성능

**목적**: 복잡한 SVG/Canvas 렌더링 성능 측정

**테스트 케이스**:
```typescript
test('좌석 배치도 렌더링 성능', async ({ page }) => {
  await page.goto('/booking/seating-chart?scheduleId=1');

  // 렌더링 시작 시간 측정
  const renderStart = await page.evaluate(() => performance.now());

  // 좌석 배치도 로딩 대기
  await page.waitForSelector('[data-testid="seating-chart"]');

  // 모든 좌석 렌더링 완료 대기
  await page.waitForFunction(() => {
    const seats = document.querySelectorAll('[data-seat]');
    return seats.length > 0;
  });

  const renderEnd = await page.evaluate(() => performance.now());
  const renderTime = renderEnd - renderStart;

  console.log(`좌석 배치도 렌더링 시간: ${renderTime}ms`);

  // 좌석 100개 클릭 성능 측정
  const seats = await page.locator('[data-seat]').all();
  const clickTimes = [];

  for (let i = 0; i < Math.min(10, seats.length); i++) {
    const clickStart = Date.now();
    await seats[i].click();
    const clickEnd = Date.now();
    clickTimes.push(clickEnd - clickStart);
  }

  const avgClickTime = clickTimes.reduce((a, b) => a + b) / clickTimes.length;
  console.log(`평균 좌석 클릭 응답 시간: ${avgClickTime}ms`);
});
```

**성공 기준**:
- [ ] 좌석 배치도 렌더링 < 1초
- [ ] 좌석 클릭 응답 < 100ms
- [ ] 부드러운 스크롤/줌 (60fps)

---

### 4.5 시나리오 5: 메모리 누수 테스트

**목적**: 장시간 사용 시 메모리 누수 확인

**테스트 방법**:
```typescript
test('메모리 누수 테스트', async ({ page }) => {
  await page.goto('/booking/seating-chart?scheduleId=1');

  // 초기 메모리 측정
  const initialMemory = await page.evaluate(() => {
    if (performance.memory) {
      return performance.memory.usedJSHeapSize;
    }
    return 0;
  });

  // 100번 좌석 선택/해제 반복
  for (let i = 0; i < 100; i++) {
    await page.click('[data-seat-row="1"][data-seat-col="1"]');
    await page.waitForTimeout(100);
    await page.click('[data-seat-row="1"][data-seat-col="1"]');
    await page.waitForTimeout(100);
  }

  // GC 강제 실행 (Chrome)
  await page.evaluate(() => {
    if (window.gc) window.gc();
  });

  await page.waitForTimeout(1000);

  // 최종 메모리 측정
  const finalMemory = await page.evaluate(() => {
    if (performance.memory) {
      return performance.memory.usedJSHeapSize;
    }
    return 0;
  });

  const memoryIncrease = finalMemory - initialMemory;
  const memoryIncreaseMB = memoryIncrease / 1024 / 1024;

  console.log(`메모리 증가: ${memoryIncreaseMB.toFixed(2)}MB`);

  // 메모리 증가가 10MB 이하여야 함
  expect(memoryIncreaseMB).toBeLessThan(10);
});
```

**성공 기준**:
- [ ] 100회 반복 후 메모리 증가 < 10MB
- [ ] 이벤트 리스너 정리 확인
- [ ] 타이머/인터벌 정리 확인

---

## 5. k6 Browser를 활용한 부하 테스트 (선택사항)

### 5.1 k6 Browser란?

k6에 브라우저 자동화 기능을 추가한 하이브리드 도구입니다.
- Playwright 기반 브라우저 자동화
- k6의 부하 테스트 기능 활용
- API + 브라우저 혼합 테스트 가능

### 5.2 설치 및 설정

```bash
# k6 Browser 확장 설치 (실험적 기능)
# https://k6.io/docs/using-k6-browser/
```

### 5.3 브라우저 부하 테스트 스크립트

```javascript
// load-test/frontend-browser-test.js
import { browser } from 'k6/experimental/browser';
import { check } from 'k6';

export const options = {
  scenarios: {
    browser_test: {
      executor: 'constant-vus',
      vus: 10,  // 동시 브라우저 10개 (리소스 소비 큼)
      duration: '5m',
      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
  },
};

export default async function () {
  const page = browser.newPage();

  try {
    // 홈페이지 접속
    await page.goto('https://ticket.devhong.cc');

    // 페이지 로딩 완료 대기
    await page.waitForLoadState('networkidle');

    // 성능 메트릭 수집
    const metrics = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0];
      return {
        loadTime: perf.loadEventEnd - perf.fetchStart,
        domReady: perf.domContentLoadedEventEnd - perf.fetchStart,
      };
    });

    check(metrics, {
      '페이지 로딩 < 3초': (m) => m.loadTime < 3000,
      'DOM Ready < 2초': (m) => m.domReady < 2000,
    });

    // 공연 선택
    await page.locator('[data-testid="performance-card"]').first().click();
    await page.waitForLoadState('networkidle');

  } finally {
    page.close();
  }
}
```

**주의사항**:
- 브라우저는 리소스 소비가 크므로 동시 실행 수 제한 (10-20개)
- 테스트 머신의 CPU/메모리 충분히 확보 필요
- 헤드리스 모드 권장 (`headless: true`)

---

## 6. 테스트 환경 구성

### 6.1 로컬 환경

```bash
# Playwright 설치
pnpm add -D @playwright/test

# 브라우저 다운로드
npx playwright install

# Lighthouse 설치
pnpm add -D lighthouse

# 테스트 실행
npx playwright test tests/e2e-performance/
```

### 6.2 CI/CD 환경

```yaml
# .github/workflows/performance-test.yml
name: Frontend Performance Test

on:
  schedule:
    - cron: '0 0 * * 0'  # 매주 일요일 실행
  workflow_dispatch:

jobs:
  performance-test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run performance tests
        run: npx playwright test tests/e2e-performance/

      - name: Run Lighthouse
        run: node scripts/lighthouse-batch.js

      - name: Upload reports
        uses: actions/upload-artifact@v3
        with:
          name: performance-reports
          path: reports/
```

### 6.3 분산 테스트 환경 (대규모)

```
┌─────────────────┐
│  테스트 컨트롤러 │
└────────┬────────┘
         │
    ┌────┴────┬────────┬────────┐
    │         │        │        │
┌───▼──┐  ┌──▼──┐  ┌─▼───┐  ┌─▼───┐
│ VM 1 │  │ VM 2│  │ VM 3│  │ VM 4│
│ 5 VU │  │ 5 VU│  │ 5 VU│  │ 5 VU│
└──────┘  └─────┘  └─────┘  └─────┘

총 20명 동시 접속
```

---

## 7. 측정 및 분석

### 7.1 Playwright 성능 리포트

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  reporter: [
    ['html'],
    ['json', { outputFile: 'reports/results.json' }],
    ['junit', { outputFile: 'reports/results.xml' }],
  ],
});
```

실행 후 리포트 확인:
```bash
npx playwright show-report
```

### 7.2 Lighthouse 배치 스크립트

```javascript
// scripts/lighthouse-batch.js
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');

const pages = [
  { name: 'Home', url: 'https://ticket.devhong.cc' },
  { name: 'Performances', url: 'https://ticket.devhong.cc/performances' },
  { name: 'Performance Detail', url: 'https://ticket.devhong.cc/performances/1' },
  { name: 'Booking', url: 'https://ticket.devhong.cc/booking/seating-chart?scheduleId=1' },
];

async function runLighthouse(url, name) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });

  const options = {
    logLevel: 'info',
    output: 'html',
    port: chrome.port,
  };

  const runnerResult = await lighthouse(url, options);

  // 리포트 저장
  const reportHtml = runnerResult.report;
  fs.writeFileSync(`reports/lighthouse-${name}.html`, reportHtml);

  // 점수 출력
  const scores = runnerResult.lhr.categories;
  console.log(`${name}:`);
  console.log(`  Performance: ${scores.performance.score * 100}`);
  console.log(`  Accessibility: ${scores.accessibility.score * 100}`);
  console.log(`  Best Practices: ${scores['best-practices'].score * 100}`);
  console.log(`  SEO: ${scores.seo.score * 100}`);

  await chrome.kill();
}

async function main() {
  for (const page of pages) {
    await runLighthouse(page.url, page.name);
  }
}

main();
```

### 7.3 성능 메트릭 대시보드

**수집 데이터**:
```json
{
  "timestamp": "2026-01-29T10:00:00Z",
  "page": "/booking/seating-chart",
  "metrics": {
    "lcp": 1850,
    "fid": 45,
    "cls": 0.05,
    "fcp": 1200,
    "tti": 2500,
    "pageLoadTime": 3200,
    "memoryUsage": 45.2
  },
  "userAgent": "Chrome 120",
  "connection": "4G"
}
```

**시각화**:
- Grafana 대시보드
- Google Analytics 4
- Custom 대시보드 (Chart.js 등)

---

## 8. 최적화 가이드

### 8.1 성능 문제별 해결 방법

#### LCP가 느린 경우 (> 2.5초)
```
원인:
- 큰 이미지 파일
- 서버 응답 시간 지연
- 렌더 차단 리소스

해결:
✅ 이미지 최적화 (WebP, AVIF)
✅ next/image 사용
✅ CDN 활용
✅ 중요 리소스 preload
```

#### FID가 느린 경우 (> 100ms)
```
원인:
- 메인 스레드 블로킹
- 큰 JavaScript 번들
- 복잡한 이벤트 핸들러

해결:
✅ Code Splitting (Next.js dynamic import)
✅ Web Worker 활용
✅ 이벤트 핸들러 최적화 (debounce/throttle)
✅ React.memo, useMemo, useCallback
```

#### CLS가 높은 경우 (> 0.1)
```
원인:
- 크기 미지정 이미지
- 동적 콘텐츠 삽입
- 웹폰트 로딩

해결:
✅ 이미지에 width/height 지정
✅ Skeleton UI 사용
✅ font-display: swap
✅ 광고/임베드 영역 공간 확보
```

### 8.2 Next.js 최적화 체크리스트

- [ ] **Image Optimization**: `next/image` 사용
- [ ] **Font Optimization**: `next/font` 사용
- [ ] **Code Splitting**: dynamic import 활용
- [ ] **SSG/ISR**: 정적 페이지 생성
- [ ] **API Routes**: BFF 패턴으로 API 호출 최적화
- [ ] **Bundle Analysis**: `@next/bundle-analyzer` 활용
- [ ] **Caching**: stale-while-revalidate 전략

---

## 9. 실행 계획

### 9.1 테스트 일정

| 주차 | 활동 | 담당 | 산출물 |
|------|------|------|--------|
| Week 1 | 테스트 환경 구축 | Frontend | Playwright 설정 |
| Week 2 | E2E 시나리오 작성 | Frontend | 테스트 스크립트 |
| Week 3 | 성능 측정 (Lighthouse) | Frontend | 성능 리포트 |
| Week 4 | 병렬 부하 테스트 | Frontend/QA | 부하 테스트 결과 |
| Week 5 | 최적화 작업 | Frontend | 개선 완료 |
| Week 6 | 재테스트 및 검증 | Frontend/QA | 최종 리포트 |

### 9.2 단계별 실행

**Phase 1: 기본 성능 측정 (1주차)**
```bash
# Lighthouse로 주요 페이지 성능 측정
node scripts/lighthouse-batch.js

# 결과 분석 및 개선 우선순위 결정
```

**Phase 2: E2E 테스트 작성 (2주차)**
```bash
# Playwright 테스트 작성
npx playwright test tests/e2e-performance/

# 리포트 확인
npx playwright show-report
```

**Phase 3: 병렬 부하 테스트 (3-4주차)**
```bash
# 10명 동시 접속 (1행부터 시작)
node load-test/parallel-booking-test.js --users=10

# 20명 동시 접속 (7행부터 시작)
node load-test/parallel-booking-test.js --users=20 --start-row=7
```

**Phase 4: 최적화 및 재테스트 (5-6주차)**
```bash
# 최적화 후 재측정
node scripts/lighthouse-batch.js
npx playwright test tests/e2e-performance/
```

---

## 10. 모니터링 및 알람

### 10.1 실시간 사용자 모니터링 (RUM)

**Google Analytics 4 설정**:
```typescript
// app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <GoogleAnalytics gaId="G-XXXXXXXXXX" />
      </body>
    </html>
  );
}
```

**커스텀 성능 메트릭 전송**:
```typescript
// lib/performance-monitoring.ts
export function reportWebVitals(metric: NextWebVitalsMetric) {
  // Google Analytics로 전송
  if (window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  }

  // 커스텀 API로 전송
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify(metric),
    headers: { 'Content-Type': 'application/json' },
  });
}
```

### 10.2 성능 알람 설정

**Sentry Performance Monitoring**:
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  tracesSampleRate: 0.1, // 10% 샘플링

  // 성능 임계값 설정
  beforeSend(event) {
    if (event.type === 'transaction') {
      const duration = event.contexts?.trace?.op === 'pageload'
        ? event.measurements?.['lcp']?.value
        : null;

      // LCP가 3초 이상이면 알람
      if (duration && duration > 3000) {
        // Slack 알람 등
      }
    }
    return event;
  },
});
```

---

## 11. 체크리스트

### 테스트 전
- [ ] Playwright 설치 및 설정 완료
- [ ] Lighthouse 설치 완료
- [ ] 테스트 계정 준비 (10-20개)
- [ ] 테스트 시나리오 작성 완료
- [ ] 베이스라인 성능 측정 완료

### 테스트 중
- [ ] 테스트 실행 로그 기록
- [ ] 스크린샷/비디오 캡처
- [ ] 브라우저 콘솔 에러 확인
- [ ] 네트워크 탭 확인

### 테스트 후
- [ ] 리포트 생성 및 저장
- [ ] 성능 점수 비교 (이전 vs 현재)
- [ ] 개선 작업 우선순위 결정
- [ ] 재테스트 일정 수립

---

## 12. 참고 자료

### 공식 문서
- [Playwright 공식 문서](https://playwright.dev/)
- [Lighthouse 공식 문서](https://developer.chrome.com/docs/lighthouse/)
- [Web Vitals](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)

### 도구
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [WebPageTest](https://www.webpagetest.org/)
- [Sentry Performance](https://sentry.io/for/performance/)

---

## 부록: 프론트엔드 vs 백엔드 테스트 비교표

| 항목 | 프론트엔드 | 백엔드 API |
|------|------------|------------|
| **테스트 도구** | Playwright, Lighthouse | k6 |
| **동시 접속 수** | 10-20명 (제한적) | 100-1000명+ |
| **리소스 소비** | 높음 (브라우저) | 낮음 (HTTP만) |
| **실행 속도** | 느림 (렌더링 포함) | 빠름 |
| **측정 대상** | UX, 렌더링, JS 실행 | API 응답 시간, TPS |
| **실제 사용자 유사도** | 높음 | 낮음 |
| **비용** | 높음 (VM 리소스) | 낮음 |
| **CI/CD 적합성** | 중간 | 높음 |
| **디버깅** | 쉬움 (브라우저 DevTools) | 중간 |

**결론**: 두 가지 테스트 모두 필요하며, 목적에 따라 선택적으로 사용해야 합니다.

---

**문서 버전**: 1.0
**마지막 수정일**: 2026-01-29
**작성자**: Claude (AI Assistant)
