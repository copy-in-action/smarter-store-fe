import { expect, test } from "@playwright/test";

test("Login and access seating chart", async ({ page }) => {
  // 1. 목표 URL 설정
  const targetPath = "/booking/seating-chart";
  const targetParams = "scheduleId=30&performanceId=4";
  const targetUrl = `${targetPath}?${targetParams}`;

  // 2. 리다이렉트 파라미터를 포함하여 로그인 페이지로 이동
  // 참고: 실제 앱 로직에 따라 redirect 처리가 다를 수 있으나, 일반적인 패턴을 따름.
  // 만약 redirect 파라미터가 작동하지 않는다면, 로그인 후 명시적으로 goto 할 수 있음.
  // 여기서는 사용자의 의도대로 "로그인 버튼을 눌러서" 이동하는 흐름을 검증.
  const loginUrl = `/auth/login/email?redirect=${encodeURIComponent(targetUrl)}`;

  await page.goto(loginUrl);

  // 3. 로그인 버튼 클릭 (기본값이 채워져 있다고 가정)
  await page.getByRole("button", { name: "로그인하기" }).click();

  // 4. 목표 페이지로 리다이렉트 되었는지 확인
  await expect(page).toHaveURL(
    new RegExp(`${targetPath}.*scheduleId=30.*performanceId=4`),
  );

  console.log("Successfully logged in and navigated to seating chart.");

  // 5. 좌석 배치도 로딩 대기 및 첫 번째 사용 가능한 좌석 선택
  // 좌석 버튼은 번호를 텍스트로 가지고 있으며 disabled가 아니어야 함
  const seatButton = page
    .locator("button:not([disabled])")
    .filter({ hasText: /^\d+$/ })
    .first();
  await seatButton.waitFor();
  await seatButton.click();

  // 6. '선택완료' 버튼 클릭
  await page.getByRole("button", { name: "선택완료" }).click();

  // 7. DiscountSelectionStep 컴포넌트 렌더링 확인 (할인 선택 텍스트 확인)
  await expect(page.getByText("가격선택")).toBeVisible();

  // 8. 할인 수량 증가 (+ 버튼 클릭)
  // 첫 번째 + 버튼을 찾아서 클릭 (기본 할인 방법의 수량을 1 올림)
  const plusButton = page.locator("button:has(.lucide-plus)").first();
  await plusButton.waitFor();
  await plusButton.click();

  // 9. 예매하기 버튼 활성화 대기 및 클릭
  const submitButton = page.getByRole("button", { name: "예매하기" });
  await expect(submitButton).toBeEnabled();
  await submitButton.click();

  // 10. 결제 페이지 이동 확인
  await expect(page).toHaveURL(/\/booking\/payment/);

  console.log("Successfully navigated to payment page.");

  // 11. 브라우저 뒤로 가기
  await page.goBack();

  // 12. DiscountSelectionStep 재진입 및 상태 복원 확인
  // "가격선택" 텍스트 확인
  await expect(page.getByText("가격선택")).toBeVisible();

  // "예매하기" 버튼이 보이고 활성화되어 있어야 함 (상태가 복원되었다면 유효한 상태임)
  const submitButtonAfterBack = page.getByRole("button", { name: "예매하기" });
  await expect(submitButtonAfterBack).toBeVisible();
  await expect(submitButtonAfterBack).toBeEnabled();

  // 수량 상태 복원 확인 (1이어야 함)
  // 수량을 표시하는 span 태그의 클래스를 활용하여 찾음
  const quantitySpan = page.locator("span.min-w-\\[1rem\\]").first();
  await expect(quantitySpan).toHaveText("1");

  console.log("Successfully verified back navigation and state persistence.");

  // 13. 완전 이탈 시도 (메인 페이지로 이동)
  // 경고창이 뜨면 수락하도록 핸들러 설정
  page.once("dialog", async (dialog) => {
    console.log(`Dialog message: ${dialog.message()}`);
    await dialog.accept();
  });

  // 브라우저 뒤로 가기 대신 명시적으로 메인 페이지 이동 시도
  await page.goto("/");

  // 14. 이탈 확인
  // 메인 페이지로 정상적으로 이동했는지 확인
  await expect(page).toHaveURL("/");

  console.log("Successfully handled exit confirmation and navigated to home.");
});
