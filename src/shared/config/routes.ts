import type { Metadata } from "next";

/**
 * 공통 메타데이터 설정
 */
const BASE_METADATA = {
  siteName: "CIA 티켓",
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
  const fullTitle = title.includes("CIA")
    ? title
    : `${title} | ${BASE_METADATA.siteName}`;

  return {
    title: fullTitle,
    description,
    keywords: BASE_METADATA.keywords,
    openGraph: {
      images: ["https://ticket.devhong.cc/images/meta/open-graph.png"],
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
 * 서비스 경로 및 메타데이터
 */
export const SERVICE_PAGES = {
  /** 홈페이지 */
  HOME: {
    path: "/",
    metadata: createMetadata(
      "CIA 티켓 - 공연 예매의 모든 것",
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
    siteMap: {
      priority: 1.0,
      changeFrequency: "daily" as const,
    },
  },

  /** 인증 관련 */
  AUTH: {
    /** 로그인 */
    LOGIN: {
      path: "/auth/login",
      metadata: {
        description: "CIA에 로그인하고 스마트한 쇼핑을 시작하세요",
      } as Metadata,
      siteMap: {
        priority: 0.5,
        changeFrequency: "daily" as const,
      },

      EMAIL: {
        path: "/auth/login/email",
        metadata: {
          title: "이메일 로그인",
          description: "이메일로 CIA에 로그인하고 스마트한 쇼핑을 시작하세요",
        } as Metadata,
        siteMap: {
          priority: 0.5,
          changeFrequency: "daily" as const,
        },
      },
    },
    /** 회원가입 */
    SIGNUP: {
      EMAIL: {
        /** 이름, 휴대폰 번호 입력 (1단계) */
        OCCUPANCY_VERIFICATION: {
          path: "/auth/signup/email/occupancy-verification",
          metadata: {
            title: "회원가입 - 정보 입력",
            description: "이름과 휴대폰 번호를 입력해주세요",
          } as Metadata,
          siteMap: {
            priority: 0.5,
            changeFrequency: "daily" as const,
          },
        },

        /** 이메일 인증 (3단계) */
        EMAIL_VERIFICATION: {
          path: "/auth/signup/email/email-verification",
          metadata: {
            title: "회원가입 - 이메일 인증",
            description: "이메일로 전송된 인증번호를 입력해주세요",
          } as Metadata,
        },

        /** 비밀번호 설정 (4단계) */
        PASSWORD_CONFIRM: {
          path: "/auth/signup/email/password-confirm",
          metadata: {
            title: "회원가입 - 비밀번호 설정",
            description: "로그인에 사용할 비밀번호를 설정해주세요",
          } as Metadata,
        },
      },
    },
    /** 아이디 찾기 */
    FORGOT_ID: {
      path: "/auth/forgot-id",
      metadata: {
        title: "아이디 찾기",
        description: "잊어버린 아이디를 찾아드립니다",
      } as Metadata,
    },
    /** 비밀번호 찾기 */
    FORGOT_PASSWORD: {
      path: "/auth/forgot-password",
      metadata: {
        title: "비밀번호 찾기",
        description: "잊어버린 비밀번호를 찾아드립니다",
      } as Metadata,
    },
  },

  /** 공연 관련 */
  PERFORMANCE: {
    /** 공연 목록 */
    LIST: {
      path: "/performances",
      metadata: createMetadata(
        "공연 목록",
        "뮤지컬, 콘서트, 연극, 클래식 등 다양한 공연을 만나보세요.",
      ),
    },
    /** 공연 상세 (동적) */
    DETAIL: {
      path: (id: string | number) => `/performances/${id}`,
      metadata: (performanceTitle: string, description?: string) =>
        createMetadata(
          performanceTitle,
          description || `${performanceTitle} 공연 정보를 확인하세요.`,
          {
            openGraph: {
              type: "article",
            },
            robots: {
              index: true,
              follow: true,
              googleBot: {
                index: true,
                follow: true,
                "max-video-preview": -1,
                "max-image-preview": "large",
                "max-snippet": -1,
              },
            },
          },
        ),
      siteMap: {
        priority: 0.8,
        changeFrequency: "daily" as const,
      },
    },
  },

  BOOKING: {
    SEATING_CHART: {
      path: "/booking/seating-chart",
      metadata: {
        title: "좌석 선택",
        description: "좌석을 선택해주세요",
      } as Metadata,
    },
    PAYMENT: {
      path: "/booking/payment",
      metadata: {
        title: "공연 결제",
        description: "공연을 최종 결제합니다.",
      } as Metadata,
      GATEWAY: {
        path: (paymentId: string, bankName: string, amount: number) =>
          `/booking/payment/gateway?paymentId=${paymentId}&bankName=${bankName}&amount=${amount}`,
        metadata: {
          title: `PG사 결제 처리`,
          description: "공연을 최종 결제합니다.",
        } as Metadata,
      },
    },
  },

  /** 마이페이지 */
  MY: {
    /** 마이페이지 메인 */
    INDEX: {
      path: "/my",
      metadata: {
        title: "마이페이지",
        description: "주문 내역, 찜 목록 등을 확인하세요",
      } as Metadata,
    },
    /** 주문 내역 */
    ORDERS: {
      path: "/my/orders",
      metadata: {
        title: "주문 내역",
        description: "지금까지의 주문 내역을 확인하세요",
      } as Metadata,
    },
    /** 찜 목록 */
    LIKES: {
      path: "/my/likes",
      metadata: {
        title: "찜 목록",
        description: "관심 있는 상품들을 모아보세요",
      } as Metadata,
    },
  },

  /** 장바구니 */
  CART: {
    path: "/cart",
    metadata: {
      title: "장바구니",
      description: "선택한 상품들을 확인하고 주문하세요",
    } as Metadata,
  },
};

/**
 * 관리자 경로 및 메타데이터
 */
const ADMIN_PAGES = {
  /** 관리자 */
  ADMIN: {
    path: "/admin",
    metadata: {
      title: "관리자 | CIA",
      description: "CIA 관리자 페이지",
    } as Metadata,
    AUTH: {
      LOGIN: {
        path: "/admin/auth/login",
        metadata: {
          title: "관리자 로그인 | CIA",
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

      /** 좌석배치도 */
      SEATING_CHART: {
        CREATE: {
          path: "/admin/venues/seating-chart/create",
          metadata: {
            title: "좌석 배치도 등록 | 관리자",
            description: "공연장의 좌석 배치도를 등록하세요.",
          } as Metadata,
        },
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

      /** 공연 회차 등록 */
      CREATE_SCHEDULE: {
        path: (id: number) => `/admin/performances/${id}/schedules/create`,
        metadata: {
          title: "공연 회차 등록 | 관리자",
          description: "공연회차 및 좌석등급을 입력하는 관리자 페이지",
        } as Metadata,
      },

      /** 공연 회차 목록 */
      SCHEDULE_LIST: {
        path: (id: number) => `/admin/performances/${id}/schedules`,
        metadata: {
          title: "공연 회차 관리 | 관리자",
          description: "공연 회차 목록을 관리하는 관리자 페이지",
        } as Metadata,
      },

      /** 공연 회차 상세 */
      SCHEDULE_DETAIL: {
        path: (performanceId: number, scheduleId: number) =>
          `/admin/performances/${performanceId}/schedules/${scheduleId}`,
        metadata: {
          title: "공연 회차 상세 | 관리자",
          description: "공연 회차 상세 정보를 확인하는 관리자 페이지",
        } as Metadata,
      },
    },
    COMPANY: {
      LIST: {
        path: "/admin/companies",
        metadata: {
          title: "판매자 리스트 조회 | 관리자",
          description: "판매자를 리스트 페이지",
        } as Metadata,
      },
      CREATE: {
        path: "/admin/companies/create",
        metadata: {
          title: "판매자 등록 | 관리자",
          description: "판매자를 등록페이지",
        } as Metadata,
      },
      DETAIL: {
        path: (id: number) => `/admin/companies/${id}`,
        metadata: {
          title: "판매자 상세 | 관리자",
          description: "판매자를 상세페이지",
        } as Metadata,
      },
      EDIT: {
        path: (id: number) => `/admin/companies/edit/${id}`,
        metadata: {
          title: "판매자 수정 | 관리자",
          description: "판매자를 수정페이지",
        } as Metadata,
      },
    },
    COUPON: {
      /** 쿠폰 목록 */
      LIST: {
        path: "/admin/coupons",
        metadata: {
          title: "쿠폰 관리 | 관리자",
          description:
            "등록된 쿠폰을 관리하고 새로운 쿠폰을 추가할 수 있습니다.",
        } as Metadata,
      },
      /** 쿠폰 상세 */
      DETAIL: {
        path: (id: number) => `/admin/coupons/${id}`,
        metadata: {
          title: "쿠폰 상세 | 관리자",
          description: "쿠폰 상세 페이지",
        } as Metadata,
      },
      /** 쿠폰 생성 */
      CREATE: {
        path: "/admin/coupons/create",
        metadata: {
          title: "쿠폰 등록 | 관리자",
          description: "새로운 쿠폰을 등록하는 관리자 페이지",
        } as Metadata,
      },
      /** 쿠폰 수정 */
      EDIT: {
        path: (id: number) => `/admin/coupons/${id}/edit`,
        metadata: {
          title: "쿠폰 수정 | 관리자",
          description: "쿠폰 정보를 수정하는 관리자 페이지",
        } as Metadata,
      },
    },
    HOME: {
      /** 홈 태그 순서 관리 */
      TAG_ORDER: {
        path: "/admin/home/tag-order",
        metadata: {
          title: "홈 태그 순서 관리 | 관리자",
          description: "홈 화면 섹션별 태그 내 공연 순서를 관리하는 페이지",
        } as Metadata,
      },
    },
  },
} as const;

export const PAGES = { ...SERVICE_PAGES, ...ADMIN_PAGES };
