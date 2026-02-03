/**
 * Lighthouse 일괄 성능 측정 스크립트
 *
 * 주요 페이지의 성능을 Lighthouse로 측정하고 리포트를 생성합니다.
 * 측정 항목: LCP, FID, CLS, FCP, TTI, Performance Score 등
 */

const { default: lighthouse } = require("lighthouse");
const chromeLauncher = require("chrome-launcher");
const fs = require("fs");
const path = require("path");

// 측정할 페이지 목록
const pages = [
  { name: "Home", url: "https://ticket.devhong.cc" },
  {
    name: "Performance-Detail",
    url: "https://ticket.devhong.cc/performances/67",
  },
  // 인증이 필요한 페이지는 제외 (추후 authenticated flow로 테스트 가능)
  // { name: 'Booking-Seating', url: 'https://ticket.devhong.cc/booking/seating-chart?scheduleId=1' },
  // { name: 'Booking-Payment', url: 'https://ticket.devhong.cc/booking/payment' },
];

/**
 * Lighthouse 성능 측정을 실행합니다
 * @param {string} url - 측정할 페이지 URL
 * @param {string} name - 페이지 이름
 * @returns {Promise<Object>} Lighthouse 결과
 */
async function runLighthouse(url, name) {
  console.log(`\n📊 Testing: ${name} (${url})`);

  const chrome = await chromeLauncher.launch({
    chromeFlags: ["--headless", "--disable-gpu", "--no-sandbox"],
  });

  const options = {
    logLevel: "error", // 'info', 'error', 'silent'
    output: "html",
    port: chrome.port,
    onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
  };

  try {
    const runnerResult = await lighthouse(url, options);

    // 리포트 저장
    const reportHtml = runnerResult.report;
    const reportsDir = path.join(__dirname, "..", "reports");

    // reports 디렉토리가 없으면 생성
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportPath = path.join(reportsDir, `lighthouse-${name}.html`);
    fs.writeFileSync(reportPath, reportHtml);

    // 점수 출력
    const scores = runnerResult.lhr.categories;
    const audits = runnerResult.lhr.audits;

    console.log(`✅ ${name} 측정 완료:`);
    console.log(
      `   Performance:      ${Math.round(scores.performance.score * 100)}/100`,
    );
    console.log(
      `   Accessibility:    ${Math.round(scores.accessibility.score * 100)}/100`,
    );
    console.log(
      `   Best Practices:   ${Math.round(scores["best-practices"].score * 100)}/100`,
    );
    console.log(
      `   SEO:              ${Math.round(scores.seo.score * 100)}/100`,
    );

    // Core Web Vitals 출력
    console.log("\n   Core Web Vitals:");
    console.log(
      `   LCP (Largest Contentful Paint):  ${audits["largest-contentful-paint"].displayValue || "N/A"}`,
    );
    console.log(
      `   FCP (First Contentful Paint):    ${audits["first-contentful-paint"].displayValue || "N/A"}`,
    );
    console.log(
      `   CLS (Cumulative Layout Shift):   ${audits["cumulative-layout-shift"].displayValue || "N/A"}`,
    );
    console.log(
      `   TBT (Total Blocking Time):       ${audits["total-blocking-time"].displayValue || "N/A"}`,
    );
    console.log(
      `   Speed Index:                     ${audits["speed-index"].displayValue || "N/A"}`,
    );

    console.log(`\n   📄 리포트: ${reportPath}`);

    await chrome.kill();

    return {
      name,
      url,
      scores: {
        performance: Math.round(scores.performance.score * 100),
        accessibility: Math.round(scores.accessibility.score * 100),
        bestPractices: Math.round(scores["best-practices"].score * 100),
        seo: Math.round(scores.seo.score * 100),
      },
      metrics: {
        lcp: audits["largest-contentful-paint"].numericValue,
        fcp: audits["first-contentful-paint"].numericValue,
        cls: audits["cumulative-layout-shift"].numericValue,
        tbt: audits["total-blocking-time"].numericValue,
        speedIndex: audits["speed-index"].numericValue,
      },
    };
  } catch (error) {
    console.error(`❌ ${name} 측정 실패:`, error.message);
    await chrome.kill();
    throw error;
  }
}

/**
 * 모든 페이지에 대해 Lighthouse 측정을 실행합니다
 */
async function main() {
  console.log("🚀 Lighthouse 일괄 성능 측정 시작...\n");
  console.log(`측정 대상: ${pages.length}개 페이지`);

  const results = [];
  const startTime = Date.now();

  for (const page of pages) {
    try {
      const result = await runLighthouse(page.url, page.name);
      results.push(result);
    } catch (error) {
      console.error(`페이지 측정 실패: ${page.name}`);
      results.push({
        name: page.name,
        url: page.url,
        error: error.message,
      });
    }
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // 최종 요약 출력
  console.log("\n\n📊 ===== 성능 측정 결과 요약 =====\n");

  results.forEach((result) => {
    if (result.error) {
      console.log(`❌ ${result.name}: 측정 실패 (${result.error})`);
    } else {
      const perfScore = result.scores.performance;
      const status = perfScore >= 90 ? "✅" : perfScore >= 50 ? "⚠️" : "❌";
      console.log(
        `${status} ${result.name.padEnd(20)} Performance: ${perfScore}/100`,
      );
    }
  });

  console.log("\n\n📈 ===== Core Web Vitals 요약 =====\n");

  results.forEach((result) => {
    if (!result.error) {
      const lcpMs = result.metrics.lcp;
      const clsValue = result.metrics.cls;

      // LCP: < 2.5s (Good), 2.5-4s (Needs Improvement), > 4s (Poor)
      const lcpStatus = lcpMs < 2500 ? "✅" : lcpMs < 4000 ? "⚠️" : "❌";
      // CLS: < 0.1 (Good), 0.1-0.25 (Needs Improvement), > 0.25 (Poor)
      const clsStatus = clsValue < 0.1 ? "✅" : clsValue < 0.25 ? "⚠️" : "❌";

      console.log(`${result.name}:`);
      console.log(
        `  ${lcpStatus} LCP: ${(lcpMs / 1000).toFixed(2)}s (목표: < 2.5s)`,
      );
      console.log(`  ${clsStatus} CLS: ${clsValue.toFixed(3)} (목표: < 0.1)`);
      console.log("");
    }
  });

  // JSON 결과 파일 저장
  const reportsDir = path.join(__dirname, "..", "reports");
  const jsonPath = path.join(reportsDir, "lighthouse-results.json");
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));

  console.log(`\n⏱️  총 소요 시간: ${duration}초`);
  console.log(`📁 결과 저장 위치: ${reportsDir}`);
  console.log(`📄 JSON 결과: ${jsonPath}\n`);

  // 성공 기준 체크
  const failedPages = results.filter(
    (r) => !r.error && r.scores.performance < 90,
  );

  if (failedPages.length > 0) {
    console.log(
      "⚠️  주의: 다음 페이지가 성능 목표(90점)를 달성하지 못했습니다:",
    );
    failedPages.forEach((page) => {
      console.log(`   - ${page.name}: ${page.scores.performance}/100`);
    });
    process.exit(1);
  } else {
    console.log("✅ 모든 페이지가 성능 목표를 달성했습니다!\n");
  }
}

// 스크립트 실행
main().catch((error) => {
  console.error("\n❌ 스크립트 실행 중 오류 발생:", error);
  process.exit(1);
});
