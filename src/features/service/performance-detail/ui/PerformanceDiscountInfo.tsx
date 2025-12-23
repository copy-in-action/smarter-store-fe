interface PerformanceDiscountInfoProps {
  discountInfo?: string;
}

const PerformanceDiscountInfo = ({
  discountInfo,
}: PerformanceDiscountInfoProps) => {
  return (
    <section
      className="text-sm scroll-mt-36 performance-section p-detail-wrapper"
      id="discountInfo"
    >
      <h3 className="text-lg font-semibold mb-2 py-3.5">할인정보</h3>

      {discountInfo ? (
        <p className="leading-relaxed whitespace-pre-wrap">{discountInfo}</p>
      ) : (
        <p className="text-gray-500">할인정보가 없습니다.</p>
      )}
    </section>
  );
};

export default PerformanceDiscountInfo;
