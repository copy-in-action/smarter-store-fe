/**
 * 숫자를 한국 원화 형식으로 포맷팅합니다
 * @param amount - 금액
 * @returns 형식화된 금액 문자열 (예: "50,000원")
 */
export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}

/**
 * ISO 날짜 문자열을 지정된 형식으로 포맷팅합니다
 * @param dateString - ISO 날짜 문자열
 * @param format - 포맷 (YYYY-MM-DD HH:mm 등)
 * @returns 형식화된 날짜 문자열
 */
export function formatDate(
  dateString: string,
  format: string = "YYYY-MM-DD HH:mm",
): string {
  const date = new Date(dateString);

  /**
   * 날짜 형식에 따라 다른 포맷팅 적용:
   * - "YYYY-MM-DD HH:mm": 날짜 및 시간 표시
   * - "YYYY-MM-DD": 날짜만 표시
   */
  if (format === "YYYY-MM-DD HH:mm") {
    return date
      .toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(/\. /g, "-")
      .replace(".", "");
  }

  // YYYY-MM-DD 형식
  return date
    .toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\. /g, "-")
    .replace(".", "");
}
