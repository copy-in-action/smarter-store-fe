/**
 * 공연 메인 이미지 섹션 컴포넌트
 */

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

/**
 * 공연 메인 이미지 컴포넌트 속성
 */
interface PerformanceMainImageProps {
  /** 이미지 URL */
  imageUrl?: string;
  /** 공연 제목 (alt 텍스트용) */
  title: string;
}

/**
 * 공연 메인 이미지를 표시하는 컴포넌트
 */
export function PerformanceMainImage({
  imageUrl,
  title,
}: PerformanceMainImageProps) {
  return (
    <section id="image" className="py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">
            공연 포스터
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="relative w-full max-w-lg mx-auto">
            {imageUrl ? (
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg border shadow-sm">
                <Image
                  src={imageUrl}
                  alt={`${title} 포스터`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/placeholder-poster.jpg";
                    target.alt = "이미지를 불러올 수 없습니다";
                  }}
                />
              </div>
            ) : (
              <div className="aspect-[3/4] bg-gray-100 rounded-lg border flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">🎭</div>
                  <p>포스터 이미지 준비중</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
