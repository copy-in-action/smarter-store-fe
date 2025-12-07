import type { Metadata } from "next";

/**
 * 애플리케이션 라우트와 메타데이터 통합 관리
 */
export const PAGES = {
  /** 홈페이지 */
  HOME: {
    path: "/",
    metadata: {
      title: "NOL - 스마터 스토어",
      description: "스마트한 쇼핑의 새로운 기준, NOL에서 만나보세요",
    } as Metadata,
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
        path: "/auth/signup/email",
        metadata: {
          title: "이메일 회원가입 | NOL",
          description: "NOL 회원가입으로 다양한 혜택을 누려보세요",
        } as Metadata,
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
} as const;
