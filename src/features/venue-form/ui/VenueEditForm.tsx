"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUpdateVenue } from "@/entities/venue";
import type { VenueResponse } from "@/shared/api/orval/types";
import { PAGES } from "@/shared/constants";
import type { VenueFormData } from "../model/venue-form.schema";
import { VenueForm } from "./VenueForm";

/**
 * 공연장 수정 폼 컴포넌트 속성
 */
interface VenueEditFormProps {
  /** 수정할 공연장 데이터 */
  venue: VenueResponse;
}

/**
 * 공연장 수정 폼 컴포넌트
 */
export function VenueEditForm({ venue }: VenueEditFormProps) {
  const updateVenueMutation = useUpdateVenue();
  const router = useRouter();

  /**
   * 공연장 수정 핸들러
   * @param data - 폼 데이터
   */
  const handleSubmit = async (data: VenueFormData) => {
    const submitData = {
      name: data.name,
      address: data.address || undefined,
      seatingChartUrl: data.seatingChartUrl || undefined,
    };

    await updateVenueMutation.mutateAsync({
      id: venue.id,
      data: submitData,
    });

    toast.success("공연장 정보가 성공적으로 수정되었습니다.");
    router.push(PAGES.ADMIN.VENUES.DETAIL.path(venue.id));
  };

  return (
    <VenueForm
      mode="edit"
      initialData={venue}
      onSubmit={handleSubmit}
      isSubmitting={updateVenueMutation.isPending}
    />
  );
}
