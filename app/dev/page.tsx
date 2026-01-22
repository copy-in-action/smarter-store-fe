import Link from "next/link";
import { PAGES } from "@/shared/config";

/**
 * 페이지 아이템 컴포넌트
 */
function PageItem({
  title,
  path,
  description,
}: {
  title: string;
  path: string;
  description: string;
}) {
  return (
    <Link
      href={path}
      className="block p-4 transition-shadow bg-white border rounded-lg hover:shadow-md"
    >
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="space-y-1 text-sm text-gray-600">
          <div className="px-2 py-1 font-mono bg-gray-100 rounded">{path}</div>
          <p>{description}</p>
        </div>
      </div>
    </Link>
  );
}

/**
 * 페이지 타입 정의
 */
type PageType = {
  title: string;
  path: string;
  description: string;
};

/**
 * 카테고리별로 페이지를 그룹화하는 함수
 */
function groupPagesByCategory(obj: Record<string, unknown>): Array<{
  category: string;
  pages: Array<PageType>;
}> {
  const result: Array<{
    category: string;
    pages: Array<PageType>;
  }> = [];

  for (const [categoryKey, categoryValue] of Object.entries(obj)) {
    if (categoryValue && typeof categoryValue === "object") {
      const pages: Array<PageType> = [];

      // 직접 페이지 객체인 경우 (CART, ADMIN 등)
      if ("path" in categoryValue && "metadata" in categoryValue) {
        const pageValue = categoryValue as {
          path: string;
          metadata: { title: string; description: string };
        };
        if (typeof pageValue.path === "string") {
          pages.push({
            title: pageValue.metadata.title,
            path: pageValue.path,
            description: pageValue.metadata.description,
          });
        }
      } else {
        // 카테고리 내의 페이지들을 평면화
        function flattenCategoryPages(subObj: Record<string, unknown>): void {
          for (const [key, value] of Object.entries(subObj)) {
            if (value && typeof value === "object") {
              if ("path" in value && "metadata" in value) {
                // 단일 페이지 객체
                const pageValue = value as {
                  path: string;
                  metadata: { title: string; description: string };
                };
                if (typeof pageValue.path === "string") {
                  pages.push({
                    title: pageValue.metadata.title,
                    path: pageValue.path,
                    description: pageValue.metadata.description,
                  });
                }
              }

              // path와 metadata가 있어도 중첩된 객체가 있을 수 있으므로 항상 재귀 탐색
              flattenCategoryPages(value as Record<string, unknown>);
            }
          }
        }

        flattenCategoryPages(categoryValue as Record<string, unknown>);
      }

      if (pages.length > 0) {
        result.push({
          category: categoryKey,
          pages,
        });
      }
    }
  }

  return result;
}

const page = () => {
  const pagesByCategory = groupPagesByCategory(PAGES);

  return (
    <div className="container p-6 mx-auto">
      <h1 className="mb-8 text-3xl font-bold">개발용 페이지 목록</h1>

      {pagesByCategory.map(({ category, pages }) => (
        <div key={category} className="mb-8">
          <h2 className="pb-2 mb-4 text-2xl font-semibold text-blue-600 border-b border-gray-200">
            {category.toUpperCase()}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pages.map((page, index) => (
              <PageItem
                key={index.toString()}
                title={page.title}
                path={page.path}
                description={page.description}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default page;
