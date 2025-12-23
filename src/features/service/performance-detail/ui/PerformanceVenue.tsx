import { Map as MapIcon } from "lucide-react";
import type { VenueResponse } from "@/entities/venue";

interface PerformanceVenueProps {
  venue?: VenueResponse;
}

const PerformanceVenue = ({ venue }: PerformanceVenueProps) => {
  if (!venue) null;
  return (
    <section
      className="text-sm scroll-mt-36 performance-section p-detail-wrapper"
      id="venue"
    >
      <h3 className="text-lg font-semibold mb-2 py-3.5">장소</h3>
      <p className="mb-4 text-base font-bold">
        {venue?.name || "설정된 공연장이 없습니다."}
      </p>
      <div
        className="flex items-center justify-center w-full max-h-[300px] aspect-[343/140] border rounded-md"
        title="공연장 지도"
      >
        <MapIcon className="text-gray-500" />
      </div>
    </section>
  );
};

export default PerformanceVenue;
