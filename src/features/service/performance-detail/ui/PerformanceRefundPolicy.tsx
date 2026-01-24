"use client";

interface PerformanceRefundPolicyProps {
  refundPolicy?: string;
}

const PerformanceRefundPolicy = ({
  refundPolicy,
}: PerformanceRefundPolicyProps) => {
  return (
    <section
      className="text-sm performance-section p-detail-wrapper"
      id="refundPolicy"
    >
      <h3 className="text-lg font-semibold mb-2 py-3.5">취소 및 환불 규정</h3>

      {refundPolicy ? (
        <div
          className="prose prose-sm max-w-none refund-policy"
          suppressHydrationWarning
          // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML 콘텐츠를 서버에서 받아 렌더링
          dangerouslySetInnerHTML={{ __html: refundPolicy }}
        />
      ) : (
        <p className="text-gray-500">취소 및 환불 규정이 없습니다.</p>
      )}
    </section>
  );
};

export default PerformanceRefundPolicy;
