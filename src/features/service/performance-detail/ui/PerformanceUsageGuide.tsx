interface PerformanceUsageGuideProps {
  usageGuide?: string;
}

const PerformanceUsageGuide = ({ usageGuide }: PerformanceUsageGuideProps) => {
  return (
    <section
      className="text-sm scroll-mt-36 performance-section p-detail-wrapper"
      id="usageGuide"
    >
      <h3 className="text-lg font-semibold mb-2 py-3.5">이용안내</h3>

      {usageGuide ? (
        <p className="leading-relaxed whitespace-pre-wrap">{usageGuide}</p>
      ) : (
        <p className="text-gray-500">이용안내 글이 없습니다.</p>
      )}
    </section>
  );
};

export default PerformanceUsageGuide;
