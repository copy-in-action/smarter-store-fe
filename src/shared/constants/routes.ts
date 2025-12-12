import type { Metadata } from "next";

/**
 * 공통 메타데이터 설정
 */
const BASE_METADATA = {
  siteName: "NOL 티켓",
  locale: "ko_KR",
  type: "website" as const,
  keywords: [
    "공연 예매",
    "뮤지컬",
    "콘서트",
    "연극",
    "클래식",
    "티켓",
    "할인",
    "공연 정보",
  ],
};

/**
 * 메타데이터 생성 헬퍼 함수
 */
function createMetadata(
  title: string,
  description: string,
  additionalOptions?: Partial<Metadata>,
): Metadata {
  const fullTitle = title.includes("NOL")
    ? title
    : `${title} | ${BASE_METADATA.siteName}`;

  return {
    title: fullTitle,
    description,
    keywords: BASE_METADATA.keywords,
    openGraph: {
      title: fullTitle,
      description,
      type: BASE_METADATA.type,
      locale: BASE_METADATA.locale,
      siteName: BASE_METADATA.siteName,
      ...additionalOptions?.openGraph,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      ...additionalOptions?.twitter,
    },
    ...additionalOptions,
  };
}

/**
 * 애플리케이션 라우트와 메타데이터 통합 관리
 */
export const PAGES = {
  /** 홈페이지 */
  HOME: {
    path: "/",
    metadata: createMetadata(
      "NOL 티켓 - 공연 예매의 모든 것",
      "뮤지컬, 콘서트, 연극, 클래식 등 다양한 공연 정보와 할인 티켓을 만나보세요. 최신 공연 소식과 특가 이벤트를 놓치지 마세요!",
      {
        alternates: {
          canonical: "/",
        },
        other: {
          robots: "index, follow",
          googlebot: "index, follow",
        },
      },
    ),
  },

  /** 인증 관련 */
  AUTH: {
    /** 로그인 */
    LOGIN: {
      path: "/auth/login",
      metadata: {
        title: "로그인 | NOL",
        description: "NOL에 로그인하고 스마트한 쇼핑을 시작하세요",
      } as Metadata,

      EMAIL: {
        path: "/auth/login/email",
        metadata: {
          title: "이메일 로그인 | NOL",
          description: "NOL에 로그인하고 스마트한 쇼핑을 시작하세요",
        } as Metadata,
      },
    },
    /** 회원가입 */
    SIGNUP: {
      EMAIL: {
        /** 이름, 휴대폰 번호 입력 (1단계) */
        OCCUPANCY_VERIFICATION: {
          path: "/auth/signup/email/occupancy-verification",
          metadata: {
            title: "회원가입 - 정보 입력 | NOL",
            description: "이름과 휴대폰 번호를 입력해주세요",
          } as Metadata,
        },

        /** 이메일 인증 (3단계) */
        EMAIL_VERIFICATION: {
          path: "/auth/signup/email/email-verification",
          metadata: {
            title: "회원가입 - 이메일 인증 | NOL",
            description: "이메일로 전송된 인증번호를 입력해주세요",
          } as Metadata,
        },

        /** 비밀번호 설정 (4단계) */
        PASSWORD_CONFIRM: {
          path: "/auth/signup/email/password-confirm",
          metadata: {
            title: "회원가입 - 비밀번호 설정 | NOL",
            description: "로그인에 사용할 비밀번호를 설정해주세요",
          } as Metadata,
        },
      },
    },
    /** 아이디 찾기 */
    FORGOT_ID: {
      path: "/auth/forgot-id",
      metadata: {
        title: "아이디 찾기 | NOL",
        description: "잊어버린 아이디를 찾아드립니다",
      } as Metadata,
    },
    /** 비밀번호 찾기 */
    FORGOT_PASSWORD: {
      path: "/auth/forgot-password",
      metadata: {
        title: "비밀번호 찾기 | NOL",
        description: "잊어버린 비밀번호를 찾아드립니다",
      } as Metadata,
    },
  },

  /** 상품 관련 */
  PRODUCT: {
    /** 상품 목록 */
    LIST: {
      path: "/products",
      metadata: {
        title: "상품 목록 | NOL",
        description: "다양한 상품을 만나보세요",
      } as Metadata,
    },
    /** 상품 상세 (동적) */
    DETAIL: {
      path: (id: string) => `/products/${id}`,
      metadata: (productName: string, description?: string) =>
        ({
          title: `${productName} | NOL`,
          description: description || `${productName} 상세 정보를 확인하세요`,
        }) as Metadata,
    },
  },

  /** 마이페이지 */
  MY: {
    /** 마이페이지 메인 */
    INDEX: {
      path: "/my",
      metadata: {
        title: "마이페이지 | NOL",
        description: "주문 내역, 찜 목록 등을 확인하세요",
      } as Metadata,
    },
    /** 주문 내역 */
    ORDERS: {
      path: "/my/orders",
      metadata: {
        title: "주문 내역 | NOL",
        description: "지금까지의 주문 내역을 확인하세요",
      } as Metadata,
    },
    /** 찜 목록 */
    LIKES: {
      path: "/my/likes",
      metadata: {
        title: "찜 목록 | NOL",
        description: "관심 있는 상품들을 모아보세요",
      } as Metadata,
    },
  },

  /** 장바구니 */
  CART: {
    path: "/cart",
    metadata: {
      title: "장바구니 | NOL",
      description: "선택한 상품들을 확인하고 주문하세요",
    } as Metadata,
  },

  /** 관리자 */
  ADMIN: {
    path: "/admin",
    metadata: {
      title: "관리자 | NOL",
      description: "NOL 관리자 페이지",
    } as Metadata,
    AUTH: {
      LOGIN: {
        path: "/admin/auth/login",
        metadata: {
          title: "관리자 로그인 | NOL",
          description: "관리자 계정으로 로그인하여 시스템을 관리하세요",
        } as Metadata,
      },
    },
    VENUES: {
      /** 공연장 목록 */
      LIST: {
        path: "/admin/venues",
        metadata: {
          title: "공연장 관리 | 관리자",
          description:
            "등록된 공연장을 관리하고 새로운 공연장을 추가할 수 있습니다.",
        } as Metadata,
      },

      /** 공연장 상세 */
      DETAIL: {
        path: (id: number) => `/admin/venues/${id}`,
        metadata: {
          title: "공연장 상세 | 관리자",
          description: "공연장 상세 페이지",
        } as Metadata,
      },

      /** 공연장 생성 */
      CREATE: {
        path: "/admin/venues/create",
        metadata: {
          title: "공연장 등록 | 관리자",
          description: "새로운 공연장을 등록하는 관리자 페이지",
        } as Metadata,
      },

      /** 공연장 수정 */
      EDIT: {
        path: (id: number) => `/admin/venues/${id}/edit`,
        metadata: {
          title: "공연장 수정 | 관리자",
          description: "공연장 정보를 수정하는 관리자 페이지",
        } as Metadata,
      },
    },
    PERFORMANCES: {
      /** 공연 목록 */
      LIST: {
        path: "/admin/performances",
        metadata: {
          title: "공연 관리 | 관리자",
          description:
            "등록된 공연을 관리하고 새로운 공연을 추가할 수 있습니다.",
        } as Metadata,
      },

      /** 공연 상세 */
      DETAIL: {
        path: (id: number) => `/admin/performances/${id}`,
        metadata: {
          title: "공연 상세 | 관리자",
          description: "공연 상세 페이지",
        } as Metadata,
      },

      /** 공연 생성 */
      CREATE: {
        path: "/admin/performances/create",
        metadata: {
          title: "공연 등록 | 관리자",
          description: "새로운 공연을 등록하는 관리자 페이지",
        } as Metadata,
      },

      /** 공연 수정 */
      EDIT: {
        path: (id: number) => `/admin/performances/${id}/edit`,
        metadata: {
          title: "공연 수정 | 관리자",
          description: "공연 정보를 수정하는 관리자 페이지",
        } as Metadata,
      },
    },
  },
} as const;
