const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

// 테스트 결과 디렉토리 생성
const resultsDir = "./test-results";
const videosDir = path.join(resultsDir, "videos");
const screenshotsDir = path.join(resultsDir, "screenshots");

if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

/**
 * 단일 사용자의 예매 플로우를 실행합니다
 * @param {number} userId - 사용자 ID
 * @param {object} options - 테스트 옵션
 * @param {number} options.startRow - 시작 행 (1-based, 기본값: 1)
 * @returns {Promise<{userId: number, success: boolean, duration: number, error?: string}>}
 */
async function runBookingTest(userId, options = {}) {
  const { saveVideo, saveScreenshot, startRow = 1 } = options;
  const browser = await chromium.launch({ headless: true });

  // 비디오 녹화 옵션 설정
  const contextOptions = {};
  if (saveVideo) {
    contextOptions.recordVideo = {
      dir: "./test-results/videos/",
      size: { width: 1280, height: 720 },
    };
  }

  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();

  const startTime = Date.now();
  let success = false;
  let errorMessage = null;

  // 사용자별 계정 정보
  const email = `qa_tester_${userId}@example.com`;
  const password = "12341234";
  let currentStep = "초기화";

  try {
    console.log(`[User ${userId}] 시작 (${email})`);

    // 1. 로그인
    currentStep = "로그인 페이지 접속";
    await page.goto(
      "https://ticket.devhong.cc/auth/login/email?redirect=%2Fperformances%2F4",
    );

    currentStep = "로그인 정보 입력";
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', password);
    await page.getByRole("button", { name: "로그인하기" }).click();

    currentStep = "로그인 완료 대기";
    await page.waitForURL(/\/performances\/4/, { timeout: 10000 });

    // 2. 예매하기
    currentStep = "예매하기 버튼 클릭";
    await page.getByRole("button", { name: "예매하기" }).click();

    currentStep = "회차 선택 모달 대기";
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

    // 3. 회차 선택
    currentStep = "회차 선택";
    const scheduleButton = page.locator('div[data-slot="field-label"]').first();
    await scheduleButton.waitFor({ timeout: 5000 });
    await scheduleButton.click();

    currentStep = "모달 예매하기 버튼 클릭";
    await page
      .locator('[role="dialog"]')
      .getByRole("button", { name: "예매하기" })
      .click();

    currentStep = "좌석 선택 페이지 이동 대기";
    await page.waitForURL(/\/booking\/seating-chart/, { timeout: 10000 });

    // 4. 좌석 선택 (row/col 기반, 10행 20열 좌석 구조)
    currentStep = "좌석 선택";

    const COLS_PER_ROW = 20;
    const startCol = 1;

    // 각 사용자의 첫 번째 좌석 절대 인덱스 계산 (0-based)
    const startAbsoluteIndex = (startRow - 1) * COLS_PER_ROW + (startCol - 1);
    const userOffset = (userId - 1) * 2; // 각 사용자는 2개 좌석 사용
    const firstSeatAbsIndex = startAbsoluteIndex + userOffset;
    const secondSeatAbsIndex = firstSeatAbsIndex + 1;

    // 절대 인덱스를 row/col로 변환 (1-based)
    const firstSeatRow = Math.floor(firstSeatAbsIndex / COLS_PER_ROW) + 1;
    const firstSeatCol = (firstSeatAbsIndex % COLS_PER_ROW) + 1;
    const secondSeatRow = Math.floor(secondSeatAbsIndex / COLS_PER_ROW) + 1;
    const secondSeatCol = (secondSeatAbsIndex % COLS_PER_ROW) + 1;

    console.log(
      `[User ${userId}] 좌석 선택 예정: ${firstSeatRow}행 ${firstSeatCol}열, ${secondSeatRow}행 ${secondSeatCol}열`,
    );

    // 좌석 row 렌더링 대기
    const seatRows = page.locator("div.flex.items-center.mb-2");
    await seatRows.first().waitFor({ timeout: 10000 });

    // 첫 번째 좌석 선택
    currentStep = `첫 번째 좌석 선택 (${firstSeatRow}행 ${firstSeatCol}열)`;
    const firstRow = seatRows.nth(firstSeatRow - 1);
    const firstSeatButton = firstRow.locator("button").nth(firstSeatCol - 1);
    await firstSeatButton.click();
    await page.waitForTimeout(300);

    // 두 번째 좌석 선택
    currentStep = `두 번째 좌석 선택 (${secondSeatRow}행 ${secondSeatCol}열)`;
    const secondRow = seatRows.nth(secondSeatRow - 1);
    const secondSeatButton = secondRow.locator("button").nth(secondSeatCol - 1);
    await secondSeatButton.click();
    await page.waitForTimeout(300);

    currentStep = "선택완료 버튼 클릭";
    await page.getByRole("button", { name: "선택완료" }).click();

    currentStep = "가격선택 화면 로드 대기";
    await page.getByText("가격선택").waitFor({ timeout: 5000 });

    // 5. 할인 적용 (동적 수량 계산)
    currentStep = "아코디언 항목 찾기";
    const accordionItems = page.locator('[data-slot="accordion-item"]');
    await accordionItems.first().waitFor({ timeout: 5000 });
    const accordionCount = await accordionItems.count();

    currentStep = "각 등급별 필요 수량 계산";
    for (let i = 0; i < accordionCount; i++) {
      const accordionItem = accordionItems.nth(i);

      // 타이틀에서 "S석 0/2" 형식의 텍스트 추출
      const titleDiv = accordionItem.locator(".w-24");
      const titleText = await titleDiv.textContent();

      // "S석 0/2" 형식에서 수량 추출
      const match = titleText?.match(/(\d+)\s*\/\s*(\d+)/);
      if (!match) {
        throw new Error(`할인 수량 파싱 실패: ${titleText}`);
      }

      const currentCount = parseInt(match[1]);
      const requiredCount = parseInt(match[2]);
      const needToAdd = requiredCount - currentCount;

      if (needToAdd <= 0) {
        continue; // 이미 충분히 선택됨
      }

      currentStep = `등급 ${i + 1}: ${needToAdd}개 추가 (현재: ${currentCount}/${requiredCount})`;

      // 아코디언 열기 (이미 열려있을 수도 있음)
      const accordionButton = accordionItem.locator(
        '[data-slot="accordion-trigger"]',
      );
      const dataState = await accordionButton.getAttribute("data-state");
      if (dataState !== "open") {
        await accordionButton.click();
        await page.waitForTimeout(300);
      }

      // 해당 아코디언의 첫 번째 + 버튼 찾기
      const accordionContent = accordionItem.locator(
        '[data-slot="accordion-content"]',
      );
      const plusButton = accordionContent
        .locator("button:has(.lucide-plus)")
        .first();

      // 필요한 수량만큼 클릭
      for (let j = 0; j < needToAdd; j++) {
        await plusButton.click();
        await page.waitForTimeout(200);
      }
    }

    currentStep = "예매하기 버튼 클릭";
    const submitButton = page.getByRole("button", { name: "예매하기" });
    await submitButton.click();

    currentStep = "결제 페이지 이동 대기";
    await page.waitForURL(/\/booking\/payment/, { timeout: 10000 });

    // 6. 결제 처리
    currentStep = "은행 선택 combobox 열기";
    const bankSelect = page.locator("button[role='combobox']").first();
    await bankSelect.waitFor({ timeout: 5000 });
    await bankSelect.click();

    currentStep = "은행 선택 (첫 번째 옵션)";
    const firstOption = page.locator("[role='option']").first();
    await firstOption.waitFor({ timeout: 5000 });
    await firstOption.click();

    currentStep = "전체 동의 버튼 클릭";
    await page
      .locator("button")
      .filter({ has: page.locator("text=/전체.*동의|모두.*동의/i") })
      .first()
      .click();

    currentStep = "결제하기 버튼 클릭 및 팝업 대기";
    const payButton = page.getByRole("button", { name: /결제.*하기/i });
    const popupPromise = page.waitForEvent("popup");
    await payButton.click();

    const popup = await popupPromise;
    await popup.waitForLoadState();

    const confirmButton = popup.getByRole("button", { name: /결제.*승인/i });
    await confirmButton.waitFor({ timeout: 5000 });
    await confirmButton.click();

    await popup.waitForEvent("close", { timeout: 5000 }).catch(() => {});

    // Alert 처리
    page.once("dialog", async (dialog) => {
      await dialog.accept();
    });

    await page.waitForURL("https://ticket.devhong.cc/", { timeout: 10000 });

    currentStep = "완료";
    success = true;
    const duration = Date.now() - startTime;
    console.log(`[User ${userId}] ✓ 성공 (${duration}ms)`);

    return { userId, success, duration };
  } catch (error) {
    const duration = Date.now() - startTime;
    errorMessage = `[${currentStep}] ${error.message}`;
    console.error(`[User ${userId}] ✗ 실패 (${duration}ms): ${errorMessage}`);

    // 실패 시 스크린샷 저장 (옵션이 활성화된 경우)
    if (saveScreenshot) {
      try {
        const screenshotPath = `./test-results/screenshots/user-${userId}-failure.png`;
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`[User ${userId}] 스크린샷 저장: ${screenshotPath}`);
      } catch (screenshotError) {
        console.error(
          `[User ${userId}] 스크린샷 저장 실패:`,
          screenshotError.message,
        );
      }
    }

    return { userId, success: false, duration, error: errorMessage };
  } finally {
    // 비디오 경로 가져오기 (page 닫기 전, 비디오 녹화가 활성화된 경우)
    let videoPath = null;
    if (saveVideo) {
      try {
        videoPath = await page.video()?.path();
      } catch (e) {
        // 비디오 경로 가져오기 실패 무시
      }
    }

    // 페이지와 컨텍스트 닫기 (비디오 저장 완료 대기)
    await page.close();
    await context.close();

    // 성공 시 비디오 삭제, 실패 시 유지
    if (saveVideo) {
      if (success && videoPath && fs.existsSync(videoPath)) {
        try {
          fs.unlinkSync(videoPath);
        } catch (e) {
          // 비디오 삭제 실패 무시
        }
      } else if (!success && videoPath) {
        console.log(`[User ${userId}] 비디오 저장: ${videoPath}`);
      }
    }

    await browser.close();
  }
}

/**
 * 병렬 부하 테스트 실행
 * @param {number} userCount - 동시 접속 사용자 수
 * @param {object} options - 테스트 옵션
 * @param {number} options.startRow - 시작 행 (1-based)
 */
async function runParallelTest(userCount, options = {}) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`병렬 예매 부하 테스트 시작`);
  console.log(`동시 접속 사용자: ${userCount}명`);
  console.log(`시작 행: ${options.startRow || 1}행`);
  console.log(`비디오 녹화: ${options.saveVideo ? "활성화" : "비활성화"}`);
  console.log(`스크린샷: ${options.saveScreenshot ? "활성화" : "비활성화"}`);
  console.log(`${"=".repeat(60)}\n`);

  const startTime = Date.now();

  // 모든 사용자 테스트를 동시에 실행
  const users = Array.from({ length: userCount }, (_, i) => i + 1);
  const results = await Promise.all(
    users.map((userId) => runBookingTest(userId, options)),
  );

  const totalTime = Date.now() - startTime;

  // 결과 집계
  const successResults = results.filter((r) => r.success);
  const failedResults = results.filter((r) => !r.success);
  const successCount = successResults.length;
  const failCount = failedResults.length;
  const successRate = ((successCount / userCount) * 100).toFixed(2);

  const durations = successResults.map((r) => r.duration);
  const avgDuration =
    durations.length > 0
      ? (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(0)
      : 0;
  const minDuration = durations.length > 0 ? Math.min(...durations) : 0;
  const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;

  // 결과 출력
  console.log(`\n${"=".repeat(60)}`);
  console.log(`테스트 결과 요약`);
  console.log(`${"=".repeat(60)}`);
  console.log(
    `전체 소요 시간: ${totalTime}ms (${(totalTime / 1000).toFixed(2)}초)`,
  );
  console.log(`\n[성공률]`);
  console.log(`  성공: ${successCount}명 / 전체: ${userCount}명`);
  console.log(`  성공률: ${successRate}%`);
  console.log(`\n[완료 시간 (성공한 사용자 기준)]`);
  console.log(
    `  평균: ${avgDuration}ms (${(avgDuration / 1000).toFixed(2)}초)`,
  );
  console.log(
    `  최소: ${minDuration}ms (${(minDuration / 1000).toFixed(2)}초)`,
  );
  console.log(
    `  최대: ${maxDuration}ms (${(maxDuration / 1000).toFixed(2)}초)`,
  );

  if (failCount > 0) {
    console.log(`\n[실패 사용자]`);
    failedResults.forEach((result) => {
      console.log(`  User ${result.userId}: ${result.error}`);
    });
  }

  console.log(`${"=".repeat(60)}\n`);

  // 성공 기준 검증
  console.log(`[성공 기준 검증]`);
  const checks = [
    {
      name: "성공률 > 95%",
      pass: parseFloat(successRate) > 95,
      value: `${successRate}%`,
    },
    {
      name: "평균 완료 시간 < 35초",
      pass: avgDuration < 35000,
      value: `${(avgDuration / 1000).toFixed(2)}초`,
    },
  ];

  checks.forEach((check) => {
    const status = check.pass ? "✓ 통과" : "✗ 실패";
    console.log(`  ${status} - ${check.name}: ${check.value}`);
  });

  const allPassed = checks.every((c) => c.pass);
  console.log(
    `\n${allPassed ? "✅ 모든 성공 기준 충족!" : "❌ 일부 성공 기준 미달"}\n`,
  );
}

// 커맨드라인 인자 파싱
const args = process.argv.slice(2);
const usersArg = args.find((arg) => arg.startsWith("--users="));
const userCount = usersArg ? parseInt(usersArg.split("=")[1]) : 5;

// 시작 행 옵션 (기본값: 1)
const startRowArg = args.find((arg) => arg.startsWith("--start-row="));
const startRow = startRowArg ? parseInt(startRowArg.split("=")[1]) : 1;

// 비디오 녹화 옵션 (기본값: false)
const saveVideoArg = args.find((arg) => arg.startsWith("--save-video"));
const saveVideo = saveVideoArg ? saveVideoArg.split("=")[1] !== "false" : false;

// 스크린샷 저장 옵션 (기본값: true)
const saveScreenshotArg = args.find((arg) =>
  arg.startsWith("--save-screenshot"),
);
const saveScreenshot = saveScreenshotArg
  ? saveScreenshotArg.split("=")[1] !== "false"
  : true;

// 최대 사용자 수: 브라우저 리소스를 고려하여 20명으로 제한
const MAX_USERS = 20;

// 유효성 검증
if (isNaN(userCount) || userCount < 1 || userCount > MAX_USERS) {
  console.error(`사용자 수는 1~${MAX_USERS} 사이여야 합니다.`);
  console.log(`\n사용법: node parallel-booking-test.js [옵션]`);
  console.log(`\n옵션:`);
  console.log(`  --users=N              동시 접속 사용자 수 (기본값: 5)`);
  console.log(`  --start-row=N          시작 행 번호 (기본값: 1, 1-based)`);
  console.log(`  --save-video[=true]    비디오 녹화 활성화 (기본값: false)`);
  console.log(`  --save-screenshot[=true] 스크린샷 저장 활성화 (기본값: true)`);
  console.log(`\n예시:`);
  console.log(`  node parallel-booking-test.js --users=10`);
  console.log(`  node parallel-booking-test.js --users=10 --start-row=1`);
  console.log(`  node parallel-booking-test.js --users=10 --save-video`);
  console.log(
    `  node parallel-booking-test.js --users=10 --start-row=1 --save-video --save-screenshot=false`,
  );
  process.exit(1);
}

if (isNaN(startRow) || startRow < 1 || startRow > 10) {
  console.error(`시작 행은 1~10 사이여야 합니다.`);
  process.exit(1);
}

// 테스트 실행
runParallelTest(userCount, { saveVideo, saveScreenshot, startRow }).catch(
  (error) => {
    console.error("테스트 실행 중 오류 발생:", error);
    process.exit(1);
  },
);
