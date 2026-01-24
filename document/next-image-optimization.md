# Next.js Image 최적화 가이드

> Next.js Image 컴포넌트의 DPR, deviceSizes, sizes 속성 이해하기

## DPR (Device Pixel Ratio)

**정의:** CSS 1픽셀을 표현하는 데 사용되는 물리적 픽셀 수

```
물리적 픽셀 = CSS 픽셀 × DPR
```

### 기기별 DPR 예시

| 기기 | CSS 해상도 | DPR | 물리적 해상도 |
|------|-----------|-----|--------------|
| iPhone 12 Pro | 390px | 3 | 1170px |
| iPhone SE | 375px | 2 | 750px |
| 일반 모니터 | 1920px | 1 | 1920px |
| Retina MacBook | 1440px | 2 | 2880px |

### 왜 DPR이 중요한가?

- DPR 1 기기에 맞춘 이미지를 DPR 3 기기에서 보면 흐릿하게 보임
- 고해상도 디스플레이에서 선명한 이미지를 위해 더 큰 이미지 필요
- Next.js Image는 자동으로 DPR을 고려하여 적절한 크기의 이미지 요청

---

## deviceSizes

**정의:** Next.js Image가 생성할 이미지 너비 후보 목록

### 현재 프로젝트 설정

```ts
// next.config.ts
deviceSizes: [640, 750, 828, 1080, 1200, 1920]
```

### 각 값이 커버하는 시나리오

| 값 | 커버하는 시나리오 |
|----|------------------|
| 640 | 모바일 DPR 2 (320px 뷰포트) |
| 750 | iPhone SE/8 DPR 2 (375px × 2) |
| 828 | iPhone 11/XR DPR 2 (414px × 2) |
| 1080 | 모바일 DPR 3 (약 360px × 3) |
| 1200 | 태블릿, 소형 데스크톱 |
| 1920 | Full HD 데스크톱 |

### Next.js 기본값과 비교

```ts
// Next.js 기본값
[640, 750, 828, 1080, 1200, 1920, 2048, 3840]

// 현재 설정 (2048, 3840 제거)
[640, 750, 828, 1080, 1200, 1920]
```

2048, 3840을 제거하여 4K 모니터 지원을 줄이고 이미지 최적화 비용 절감

### 동작 방식

1. 브라우저가 필요한 이미지 크기 계산 (CSS 크기 × DPR)
2. deviceSizes 중에서 해당 크기 **이상**인 가장 작은 값 선택
3. 서버에 해당 크기 이미지 요청

```
필요: 1050px → deviceSizes에서 1080 선택
필요: 1100px → deviceSizes에서 1200 선택
필요: 500px  → deviceSizes에서 640 선택
```

---

## sizes 속성

**정의:** 뷰포트 크기에 따른 이미지 표시 크기를 브라우저에 알려주는 속성

### 예시

```tsx
<Image
  src={imageUrl}
  sizes="(max-width: 639px) calc(100vw - 40px), (max-width: 911px) calc(100vw - 16px), 880px"
/>
```

| 조건 | 이미지 표시 크기 |
|------|-----------------|
| 뷰포트 ≤ 639px | `calc(100vw - 40px)` (좌우 패딩 제외) |
| 뷰포트 ≤ 911px | `calc(100vw - 16px)` |
| 그 외 | 880px 고정 |

### sizes가 없으면?

- Next.js는 `100vw` (전체 뷰포트 너비)로 가정
- 불필요하게 큰 이미지를 요청할 수 있음

---

## 실제 동작 예시: iPhone 12 Pro

```
iPhone 12 Pro에서 이미지 요청 과정

1. 뷰포트: 390px (CSS)
2. sizes 조건 매칭: (max-width: 639px) → calc(100vw - 40px)
3. 이미지 표시 크기: 390 - 40 = 350px
4. DPR 적용: 350 × 3 = 1050px 필요
5. deviceSizes 선택: 1080px (1050 이상 중 최소)
6. 최종 요청: ?w=1080&q=100
```

### 다양한 기기의 deviceSize 선택

```
Galaxy S21 (360px × 3 = 1080) → 1080 선택
iPhone 12 Pro (350px × 3 = 1050) → 1080 선택
iPhone 12 mini (360px × 3 = 1080) → 1080 선택
iPhone SE (335px × 2 = 670) → 750 선택
```

---

## 최적화 팁

### 1. sizes 속성 정확히 설정

```tsx
// ❌ sizes 없음 - 100vw로 가정하여 과도한 이미지 요청
<Image src={url} width={800} height={600} />

// ✅ 실제 표시 크기에 맞게 설정
<Image
  src={url}
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

### 2. quality 설정

```ts
// next.config.ts
qualities: [75, 100]  // 허용할 품질 값 목록
```

```tsx
// 일반 이미지
<Image src={url} quality={75} />

// 상세 이미지 (고품질 필요)
<Image src={url} quality={100} />
```

### 3. loading 전략

```tsx
// 뷰포트 내 이미지 (LCP 후보)
<Image src={url} priority />

// 뷰포트 밖 이미지
<Image src={url} loading="lazy" />
```

---

## 관련 설정 파일

- `next.config.ts`: deviceSizes, imageSizes, qualities 설정
- 각 Image 컴포넌트: sizes, quality, loading, priority 속성
