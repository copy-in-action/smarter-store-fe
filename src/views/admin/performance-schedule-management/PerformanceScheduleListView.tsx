"use client";

import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  PerformanceScheduleForm,
  PerformanceScheduleList,
} from "@/features/admin/performance-schedule-management";
import { useSeatingChart } from "@/features/admin/seating-chart";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

/**
 * 공연 회차 목록 뷰 속성
 */
interface PerformanceScheduleListViewProps {
  /** 공연 ID */
  performanceId: number;
  /** 공연명 */
  performanceTitle: string;
  /** 공연장 ID */
  venueId: number;
}

/**
 * 관리자 공연 회차 목록 뷰 컴포넌트
 * @param performanceId - 공연 ID
 * @param performanceTitle - 공연명
 * @param venueId - 공연장 ID
 */
export default function PerformanceScheduleListView({
  performanceId,
  performanceTitle,
  venueId,
}: PerformanceScheduleListViewProps) {
  const [showForm, setShowForm] = useState(false);
  const { data: seatingChart } = useSeatingChart(venueId);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 헤더 영역 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/performances/${performanceId}`}>
              <ArrowLeft className="size-4 mr-2" />
              뒤로가기
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              공연 회차 관리
            </h1>
            <p className="text-muted-foreground">{performanceTitle}</p>
          </div>
        </div>

        <Button onClick={() => setShowForm(true)}>
          <Plus className="size-4 mr-2" />
          회차 추가
        </Button>
      </div>

      {/* 공연 회차 추가 폼 */}
      {showForm && seatingChart?.seatCapacities && (
        <PerformanceScheduleForm
          performanceId={performanceId}
          seatGrades={seatingChart.seatCapacities}
          onCancel={() => setShowForm(false)}
          onSuccess={() => setShowForm(false)}
        />
      )}

      {/* 공연 회차 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>공연 회차 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <PerformanceScheduleList performanceId={performanceId} />
        </CardContent>
      </Card>
    </div>
  );
}
