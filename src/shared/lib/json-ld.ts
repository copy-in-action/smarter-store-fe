/**
 * 보안을 고려한 JSON-LD 유틸리티
 * XSS 공격을 방지하기 위해 HTML 태그를 유니코드로 변환합니다
 */

/**
 * XSS 공격을 방지하기 위해 위험한 문자를 유니코드로 변환
 * @param obj - JSON-LD 데이터 객체
 * @returns 안전하게 변환된 JSON 문자열
 */
export function safeJsonLdStringify(obj: any): string {
  return JSON.stringify(obj)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/'/g, "\\u0027");
}

/**
 * 웹사이트 기본 스키마 생성
 * @param name - 사이트명
 * @param description - 사이트 설명
 * @param url - 사이트 URL
 * @returns WebSite 스키마 객체
 */
export function createWebsiteSchema(
  name: string,
  description: string,
  url: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: name,
    description: description,
    url: url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * 조직 스키마 생성
 * @param name - 조직명
 * @param url - 조직 URL
 * @param logo - 로고 URL
 * @returns Organization 스키마 객체
 */
export function createOrganizationSchema(
  name: string,
  url: string,
  logo?: string,
) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: name,
    url: url,
  };

  if (logo) {
    schema.logo = {
      "@type": "ImageObject",
      url: logo,
    };
  }

  return schema;
}

/**
 * 공연 스키마 생성
 * @param performance - 공연 정보
 * @returns 공연 타입에 맞는 스키마 객체
 */
export interface PerformanceSchemaData {
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: {
    name: string;
    address?: string;
  };
  offers?: {
    price: number;
    currency: string;
    availability?: string;
  };
  performer?: string;
  image?: string;
  url?: string;
  /** 공연 카테고리: 'musical', 'concert', 'theater', 'classic' */
  category?: string;
}

export function createPerformanceSchema(performance: PerformanceSchemaData) {
  // 카테고리에 따라 적절한 Event 타입 결정
  let eventType = "Event";
  switch (performance.category?.toLowerCase()) {
    case "musical":
    case "theater":
    case "연극":
    case "뮤지컬":
      eventType = "TheaterEvent";
      break;
    case "concert":
    case "classic":
    case "콘서트":
    case "클래식":
      eventType = "MusicEvent";
      break;
    default:
      eventType = "Event";
  }

  // Product와 Event 스키마를 배열로 반환 (다중 스키마)
  const schemas = [];

  // 1. Event 스키마 (공연 정보)
  const eventSchema: any = {
    "@context": "https://schema.org",
    "@type": eventType,
    name: performance.name,
    startDate: performance.startDate,
  };

  if (performance.description)
    eventSchema.description = performance.description;
  if (performance.endDate) eventSchema.endDate = performance.endDate;
  if (performance.image) eventSchema.image = performance.image;
  if (performance.url) eventSchema.url = performance.url;

  if (performance.location) {
    eventSchema.location = {
      "@type": "Place",
      name: performance.location.name,
    };
    if (performance.location.address) {
      eventSchema.location.address = {
        "@type": "PostalAddress",
        addressLocality: performance.location.address,
      };
    }
  }

  if (performance.performer) {
    eventSchema.performer = {
      "@type": "PerformingGroup",
      name: performance.performer,
    };
  }

  schemas.push(eventSchema);

  // 2. Product 스키마 (티켓 상품)
  if (performance.offers) {
    const productSchema: any = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: `${performance.name} 티켓`,
      description: performance.description || `${performance.name} 공연 티켓`,
      image: performance.image,
      url: performance.url,
      offers: {
        "@type": "Offer",
        price: performance.offers.price,
        priceCurrency: performance.offers.currency,
        availability:
          performance.offers.availability || "https://schema.org/InStock",
      },
      category: "Event Tickets",
    };

    schemas.push(productSchema);
  }

  return schemas;
}
