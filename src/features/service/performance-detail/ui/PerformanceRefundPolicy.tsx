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
        <p className="leading-relaxed whitespace-pre-wrap">{refundPolicy}</p>
      ) : (
        <p className="text-gray-500">취소 및 환불 규정이 없습니다.</p>
      )}
    </section>
  );
};

export default PerformanceRefundPolicy;
