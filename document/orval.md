# Orval 코드 생성 가이드

> **참조**: 전체 API 아키텍처는 [API 아키텍처 문서](./api-architecture.md)를 참고하세요.

## 🎯 개요

Orval은 OpenAPI 스펙에서 TypeScript API 코드를 자동 생성하는 도구입니다. 본 프로젝트에서는 **FSD 아키텍처**와 **Clean Architecture** 패턴에 맞게 구성되어 있습니다.

## 📁 생성되는 폴더 구조

```
src/shared/api/orval/              # Orval 생성 코드 (수정 금지)
├── auth/
│   └── auth.ts                   # 인증 관련 API 함수들
├── products/  
│   └── products.ts               # 상품 관련 API 함수들
├── admin-auth/
│   └── admin-auth.ts             # 관리자 인증 API 함수들
└── types/                        # TypeScript 인터페이스들 (기존 schemas)
    ├── userResponse.ts
    ├── tokenResponse.ts
    ├── loginRequest.ts
    └── index.ts
```

## ⚙️ Orval 설정 (orval.config.ts)

```typescript
import dotenv from "dotenv";
import { defineConfig } from "orval";

dotenv.config({ path: ".env.local" });

export default defineConfig({
  petstore: {
    input: `${process.env.NEXT_PUBLIC_API_SERVER}/v3/api-docs`,
    output: {
      baseUrl: process.env.NEXT_PUBLIC_API_SERVER,
      mode: "tags-split",                              // 태그별로 파일 분리
      target: "./src/shared/api/orval",               // 생성 경로 (generated → orval)
      client: "fetch",                                // fetch 클라이언트 사용  
      httpClient: "fetch",
      clean: true,                                    // 기존 파일 삭제 후 재생성
      prettier: true,                                 // 코드 포맷팅
      schemas: "./src/shared/api/orval/types",        // 타입 정의 경로 (schemas → types)
      override: {
        mutator: {
          path: "./src/shared/api/fetch-wrapper.ts",  // 커스텀 fetch 함수
          name: "orvalFetch",                         // 사용할 함수명
        },
      },
    },
  },
});
```

### 주요 설정 설명

| 설정 | 값 | 설명 |
|------|-----|------|
| `mode` | `"tags-split"` | OpenAPI 태그별로 파일 분리 (auth, products 등) |
| `target` | `"./src/shared/api/orval"` | API 함수들이 생성될 경로 |
| `schemas` | `"./src/shared/api/orval/types"` | TypeScript 인터페이스가 생성될 경로 |
| `client` | `"fetch"` | fetch 기반 클라이언트 생성 (TanStack Query 호환) |
| `mutator` | `orvalFetch` | 모든 API 호출에 사용할 커스텀 fetch 함수 |

## 🔄 생성 및 사용 워크플로우

### 1. 코드 생성
```bash
# Orval 실행
pnpm  orval
```

### 2. 생성되는 코드 예시

#### API 함수 (orval/auth/auth.ts)
```typescript
export const login = async (
  loginRequest: LoginRequest, 
  options?: RequestInit
): Promise<loginResponse> => {
  return orvalFetch<loginResponse>(getLoginUrl(), {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(loginRequest),
  });
}

// Union 타입 (성공 | 실패)
export type loginResponse = (loginResponseSuccess | loginResponseError)
export type loginResponseSuccess = loginResponse200 & { headers: Headers; }
export type loginResponseError = loginResponse401 & { headers: Headers; }
```

#### 타입 정의 (orval/types/loginRequest.ts)
```typescript
/**
 * 로그인 요청 DTO
 */
export interface LoginRequest {
  /** 이메일 */
  email: string;
  /** 비밀번호 */  
  password: string;
}
```

### 3. FSD에 맞는 사용 패턴

#### ❌ 직접 사용
```typescript
// 컴포넌트에서 Orval 함수 직접 호출
import { login } from "@/shared/api/orval/auth/auth";

const response = await login(data);  // union 타입으로 타입 체크 필요
if (response.status === 200) {
  // 성공 처리
}
```

#### ✅ API 래퍼 사용
```typescript
// 1. entities/auth/api/auth.api.ts - API 래퍼 작성
import { login } from "@/shared/api/orval/auth/auth";

export const loginApi = async (loginRequest: LoginRequest): Promise<TokenResponse> => {
  const response = await login(loginRequest);
  
  if (response.status !== 200) {
    throw new Error(response.data.message);
  }
  
  return response.data;  // 성공 데이터만 반환
};

// 2. features/auth/lib/useEmailLogin.ts - Hook에서 사용
import { loginApi } from "@/entities/auth";

const loginMutation = useMutation({
  mutationFn: loginApi,  // Clean한 인터페이스
  onSuccess: (tokenData) => {
    // 타입 안전하게 성공 데이터 사용
  }
});
```

## 🎨 타입 시스템 통합

### Orval vs Zod 역할 분리

#### Orval 생성 타입 (API 통신용)
```typescript
// orval/types/loginRequest.ts
export interface LoginRequest {
  email: string;
  password: string;
}
```

#### Zod 스키마 (폼 검증용)
```typescript
// entities/auth/model/auth.schema.ts
export const loginRequestSchema = z.object({
  email: z
    .string()
    .min(1, "이메일을 입력해주세요")
    .email("올바른 이메일 형식이 아닙니다"),
  password: z
    .string()
    .min(1, "비밀번호를 입력해주세요")
    .min(8, "비밀번호는 8자 이상이어야 합니다"),
});

export type LoginRequestData = z.infer<typeof loginRequestSchema>;
```

### 타입 변환 흐름
```typescript
// 폼 데이터 (Zod) → API 데이터 (Orval) 자동 호환
LoginRequestData → LoginRequest → TokenResponse
```

## 🔧 커스텀 설정

### mutator (orvalFetch) 설정
```typescript
// shared/api/fetch-wrapper.ts
export const orvalFetch = async <T>(
  url: string,
  config: RequestInit = {},
): Promise<T> => {
  return apiClient<T>(url, config);  // 토큰 관리, 에러 처리 포함
};
```


## 🚀 개발 워크플로우

### API 스펙 변경 시
```bash
# 1. 백엔드에서 OpenAPI 스펙 업데이트
# 2. Orval 재실행
pnpm orval

# 3. 자동 생성되는 것들 ✅
# - API 함수들 (auth.ts, products.ts 등)
# - TypeScript 인터페이스들 (types/ 폴더)

# 4. 수동 업데이트 필요한 것들 ⚠️
# - API 래퍼 함수들 (entities/*/api/*.api.ts)
# - Zod 스키마들 (entities/*/model/*.schema.ts)
# - 비즈니스 로직 (features/*/lib/*.ts)
```

### 새로운 도메인 추가 시
```bash
# 1. 백엔드에서 새로운 OpenAPI 태그 추가 (예: orders)
# 2. Orval 재실행
pnpm orval

# 3. 새로 생성됨
# - src/shared/api/orval/orders/orders.ts
# - src/shared/api/orval/types/orderResponse.ts 등

# 4. FSD 구조에 맞게 추가 작성
# - src/entities/order/ 폴더 구조 생성
# - API 래퍼 및 Zod 스키마 작성
```

## 💡 Best Practices

### DO ✅
- Orval 설정 변경 후 반드시 재실행
- API 래퍼를 통한 clean한 인터페이스 제공
- FSD 구조에 맞게 entities 레이어 활용
- 타입 안전성 확보를 위한 적절한 에러 처리

### DON'T ❌
- `orval/` 폴더 하위 파일 직접 수정 (재생성 시 덮어써짐)
- Orval 생성 API 함수 직접 호출 (래퍼 사용 권장)
- 타입 안전성을 해치는 `any` 타입 사용
- Zod 스키마 없이 폼 검증 우회


## 📚 참고 자료

- **[API 아키텍처 전체 개요](./api-architecture.md)**
- **[Orval 공식 문서](https://orval.dev/)**
- **[OpenAPI 스펙](https://swagger.io/specification/)**
- **[Feature-Sliced Design](https://feature-sliced.design/)**