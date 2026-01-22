"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreateVenue, type VenueResponse } from "@/entities/venue";
import { PAGES } from "@/shared/config";
import type { VenueFormData } from "../model/venue-form.schema";
import { VenueForm } from "./VenueForm";

/**
 * 공연장 생성 폼 컴포넌트
 */
export function VenueCreateForm() {
  const createVenueMutation = useCreateVenue();
  const router = useRouter();

  /**
   * 공연장 생성 핸들러
   * @param data - 폼 데이터
   */
  const handleSubmit = async (data: VenueFormData) => {
    const submitData = {
      name: data.name,
      address: data.address || undefined,
      phoneNumber: data.phoneNumber || undefined,
    };

    const newVenue = await createVenueMutation.mutateAsync(submitData);

    toast.success("공연장이 성공적으로 등록되었습니다.");
    router.push(PAGES.ADMIN.VENUES.DETAIL.path((newVenue as VenueResponse).id));
  };

  return (
    <VenueForm
      mode="create"
      onSubmit={handleSubmit}
      isSubmitting={createVenueMutation.isPending}
    />
  );
}
