import { expect, test } from "@playwright/test";

/**
 * 예매 전체 플로우 성능 테스트
 * 로그인부터 결제 승인까지 실제 사용자의 예매 프로세스를 시뮬레이션
 */
test("예매 전체 플로우 성능 테스트", async ({ page }) => {
  const startTime = Date.now();

  // 1. 로그인 페이지 접속 및 로그인
  console.log("Step 1: 로그인 시작");
  const loginStart = Date.now();

  await page.goto(
    "https://ticket.devhong.cc/auth/login/email?redirect=%2Fperformances%2F4",
  );

  // 로그인 버튼 클릭 (테스트 계정 정보가 이미 설정되어 있음)
  await page.getByRole("button", { name: "로그인하기" }).click();

  // 공연 상세 페이지로 리다이렉트 대기
  await expect(page).toHaveURL(/\/performances\/4/);
  const loginTime = Date.now() - loginStart;
  console.log(`✓ 로그인 완료: ${loginTime}ms`);

  // 2. 예매하기 버튼 클릭
  console.log("Step 2: 예매하기 버튼 클릭");
  const bookingStart = Date.now();

  await page.getByRole("button", { name: "예매하기" }).click();

  // 달력 및 회차 모달 표시 대기
  await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
  const modalTime = Date.now() - bookingStart;
  console.log(`✓ 모달 표시: ${modalTime}ms`);

  // 3. 회차 선택 (달력에서 날짜 선택 후 회차 선택)
  console.log("Step 3: 회차 선택");
  const scheduleStart = Date.now();

  // 선택 가능한 첫 번째 회차 클릭
  // 회차는 일반적으로 시간 형식(예: "14:00")을 포함하는 버튼
  const scheduleButton = page.locator('div[data-slot="field-label"]').first();
  await scheduleButton.waitFor({ timeout: 5000 });
  await scheduleButton.click();

  // 모달 내 예매하기 버튼 클릭
  await page
    .locator('[role="dialog"]')
    .getByRole("button", { name: "예매하기" })
    .click();

  // 좌석 선택 페이지 로딩 대기
  await expect(page).toHaveURL(/\/booking\/seating-chart/);
  const scheduleTime = Date.now() - scheduleStart;
  console.log(`✓ 회차 선택 완료: ${scheduleTime}ms`);

  // 4. 좌석 선택 (2개 선택)
  console.log("Step 4: 좌석 선택");
  const seatStart = Date.now();

  // 선택 가능한 좌석 찾기 (번호가 표시된 활성화된 버튼)
  const availableSeats = page
    .locator("button:not([disabled])")
    .filter({ hasText: /^\d+$/ });

  await availableSeats.first().waitFor({ timeout: 5000 });

  // 첫 번째 좌석 선택
  await availableSeats.first().click();
  console.log("  - 첫 번째 좌석 선택");

  // 두 번째 좌석 선택
  await availableSeats.nth(1).click();
  console.log("  - 두 번째 좌석 선택");

  const seatTime = Date.now() - seatStart;
  console.log(`✓ 좌석 선택 완료: ${seatTime}ms`);

  // 선택 완료 버튼 클릭
  await page.getByRole("button", { name: "선택완료" }).click();

  // 할인 선택 페이지 대기
  await expect(page.getByText("가격선택")).toBeVisible();

  // 5. 할인 적용 (0번 인덱스 + 버튼 2번 클릭)
  console.log("Step 5: 할인 적용");
  const discountStart = Date.now();

  const plusButton = page.locator("button:has(.lucide-plus)").first();
  await plusButton.waitFor({ timeout: 5000 });

  // + 버튼 2번 클릭
  await plusButton.click();
  console.log("  - + 버튼 1회 클릭");
  await plusButton.click();
  console.log("  - + 버튼 2회 클릭");

  const discountTime = Date.now() - discountStart;
  console.log(`✓ 할인 적용 완료: ${discountTime}ms`);

  // 예매하기 버튼 클릭
  const submitButton = page.getByRole("button", { name: "예매하기" });
  await expect(submitButton).toBeEnabled();
  await submitButton.click();

  // 결제 페이지 대기
  await expect(page).toHaveURL(/\/booking\/payment/);

  // 6. 결제 페이지
  console.log("Step 6: 결제 진행");
  const paymentStart = Date.now();

  // 은행 선택 (combobox 열고 첫 번째 항목 선택)
  const bankSelect = page.locator("button[role='combobox']").first();
  await bankSelect.waitFor({ timeout: 5000 });
  await bankSelect.click();
  console.log("  - 은행 선택 combobox 열림");

  // 첫 번째 SelectItem 선택 (0번 인덱스)
  const firstOption = page.locator("[role='option']").first();
  await firstOption.waitFor({ timeout: 5000 });
  await firstOption.click();
  console.log("  - 은행 선택 (0번 인덱스)");

  // 이용약관 전체 동의 체크
  page
    .locator("button")
    .filter({ has: page.locator("text=/전체.*동의|모두.*동의/i") })
    .first()
    .click();
  console.log("  - 이용약관 전체 동의 체크");

  // 결제하기 버튼 클릭 및 팝업 대기
  const payButton = page.getByRole("button", { name: /결제.*하기/i });
  await expect(payButton).toBeEnabled();

  // 팝업이 열릴 것을 예상하고 대기
  const popupPromise = page.waitForEvent("popup");
  await payButton.click();
  console.log("  - 결제하기 버튼 클릭");

  // 결제 승인 팝업 페이지 가져오기
  const popup = await popupPromise;
  await popup.waitForLoadState();
  console.log("  - 결제 승인 팝업 열림");

  // 팝업에서 결제승인 버튼 클릭
  const confirmButton = popup.getByRole("button", { name: /결제.*승인/i });
  await confirmButton.waitFor({ timeout: 5000 });
  await confirmButton.click();
  console.log("  - 결제승인 버튼 클릭");

  // 팝업 닫힘 대기 (선택사항)
  await popup.waitForEvent("close", { timeout: 5000 }).catch(() => {});

  // 메인 페이지에서 alert 대기 및 확인
  page.once("dialog", async (dialog) => {
    console.log(`  - Alert 메시지: ${dialog.message()}`);
    await dialog.accept();
    console.log("  - Alert 확인 클릭");
  });

  // 메인 페이지로 이동 대기
  await expect(page).toHaveURL("https://ticket.devhong.cc/", {
    timeout: 10000,
  });
  const paymentTime = Date.now() - paymentStart;
  console.log(`✓ 결제 완료 및 메인 페이지 이동: ${paymentTime}ms`);

  // 전체 플로우 완료 시간
  const totalTime = Date.now() - startTime;
  console.log("\n===========================================");
  console.log(
    `전체 플로우 완료: ${totalTime}ms (${(totalTime / 1000).toFixed(2)}초)`,
  );
  console.log("===========================================");
  console.log(`로그인: ${loginTime}ms`);
  console.log(`모달 표시: ${modalTime}ms`);
  console.log(`회차 선택: ${scheduleTime}ms`);
  console.log(`좌석 선택: ${seatTime}ms`);
  console.log(`할인 적용: ${discountTime}ms`);
  console.log(`결제 처리: ${paymentTime}ms`);
  console.log("===========================================");

  // 성능 검증
  expect(totalTime).toBeLessThan(30000); // 30초 이내 완료
  expect(loginTime).toBeLessThan(3000); // 로그인 3초 이내
  expect(modalTime).toBeLessThan(2000); // 모달 표시 2초 이내
  expect(scheduleTime).toBeLessThan(3000); // 회차 선택 3초 이내
  expect(seatTime).toBeLessThan(500); // 좌석 선택 반응 500ms 이내
  expect(discountTime).toBeLessThan(1000); // 할인 적용 1초 이내
  expect(paymentTime).toBeLessThan(5000); // 결제 처리 5초 이내

  console.log("\n✅ 모든 성능 기준 충족!");
});
