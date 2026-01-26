"use client";

import type {
  HomeSectionResponse,
  HomeTagWithPerformancesResponse,
} from "@/shared/api/orval/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { PerformanceCarousel } from "./PerformanceCarousel";
import { PerformanceEmpty } from "./PerformanceEmpty";

/**
 * 섹션 리스트 props
 */
export interface SectionListProps {
  /** 서버에서 전달받은 초기 섹션 데이터 */
  initialData: HomeSectionResponse[];
}

/**
 * 태그 배열을 displayOrder 기준으로 오름차순 정렬합니다
 * @param tags - 정렬할 태그 배열
 * @returns displayOrder 기준으로 정렬된 태그 배열
 */
function getSortedTags(
  tags: HomeTagWithPerformancesResponse[],
): HomeTagWithPerformancesResponse[] {
  return [...tags].sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * 태그 배열에서 첫 번째 태그를 반환합니다
 * @param tags - 태그 배열
 * @returns 첫 번째 태그 (배열이 비어있으면 undefined)
 */
function getFirstTag(
  tags: HomeTagWithPerformancesResponse[],
): HomeTagWithPerformancesResponse | undefined {
  if (tags.length === 0) return undefined;
  const sortedTags = getSortedTags(tags);
  return sortedTags[0];
}

/**
 * 탭 컨테이너 컴포넌트
 * 태그를 탭으로 표시하고 선택된 태그의 공연 리스트를 보여줍니다
 */
function TabsContainer({ tags }: { tags: HomeTagWithPerformancesResponse[] }) {
  const sortedTags = getSortedTags(tags);
  const firstTag = getFirstTag(sortedTags);

  /**
   * 태그가 없거나 첫 번째 태그를 찾을 수 없는 경우 null 반환
   */
  if (!firstTag || sortedTags.length === 0) {
    return null;
  }

  return (
    <Tabs defaultValue={firstTag.tag}>
      {/* 탭 리스트: 배경 제거, 텍스트 색상만 변경 */}
      <div className="wrapper mx-4! px-0! sm:mx-10! sm:px-0! overflow-x-auto mb-3">
        <TabsList className="h-auto gap-2 p-0 bg-transparent flex-nowrap w-max">
          {sortedTags.map((tag) => (
            <TabsTrigger
              key={tag.tag}
              value={tag.tag}
              className="bg-gray-100 px-4 py-2.5 border-0 rounded-3xl shadow-none text-muted-foreground data-[state=active]:text-white data-[state=active]:font-extrabold data-[state=active]:bg-black data-[state=active]:shadow-none whitespace-nowrap"
            >
              {tag.displayName}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {/* 탭 콘텐츠: 각 태그의 공연 리스트 */}
      {sortedTags.map((tag) => (
        <TabsContent key={tag.tag} value={tag.tag} className="mt-0">
          {!tag.performances || tag.performances.length === 0 ? (
            <PerformanceEmpty />
          ) : (
            <PerformanceCarousel performances={tag.performances} />
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}

/**
 * 섹션 블록 컴포넌트
 * 섹션 제목과 태그 탭을 표시합니다
 */
function SectionBlock({ section }: { section: HomeSectionResponse }) {
  /**
   * 태그가 없는 경우 해당 섹션을 표시하지 않음
   */
  if (!section.tags || section.tags.length === 0) {
    return null;
  }

  return (
    <section className="my-4 sm:my-20">
      {/* 섹션 제목 */}
      <h3 className="mb-1.5 text-2xl font-bold wrapper sm:px-10!">
        {section.displayName}
      </h3>

      {/* 태그 탭 컨테이너 */}
      <TabsContainer tags={section.tags} />
    </section>
  );
}

/**
 * 섹션 리스트 빈 상태 컴포넌트
 */
function SectionListEmpty() {
  return (
    <section className="px-4 wrapper sm:px-10!">
      <div className="flex items-center justify-center py-10">
        <div className="text-gray-500">섹션을 불러올 수 없습니다.</div>
      </div>
    </section>
  );
}

/**
 * 홈 섹션 리스트 메인 컴포넌트
 * 서버에서 전달받은 섹션 데이터를 표시합니다
 */
export function SectionList({ initialData }: SectionListProps) {
  /**
   * 섹션 데이터가 없는 경우 빈 상태 컴포넌트 표시
   */
  if (!initialData || initialData.length === 0) {
    return <SectionListEmpty />;
  }

  /**
   * 각 섹션을 displayOrder 순서대로 렌더링
   * 섹션 데이터는 이미 서버에서 정렬되어 전달됨
   */
  return (
    <>
      {initialData.map((section) => (
        <SectionBlock key={section.section} section={section} />
      ))}
    </>
  );
}
