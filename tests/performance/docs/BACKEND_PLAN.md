# 백엔드 부하 테스트 플랜 (Spring Boot)

## 문서 정보

| 항목 | 내용 |
|------|------|
| 작성일 | 2026-01-29 |
| 프로젝트 | Smarter Store 티켓 예매 시스템 (Backend) |
| 테스트 대상 | Spring Boot 기반 REST API |
| 테스트 도구 | k6, JMeter |

---

## 1. 백엔드 vs 프론트엔드 테스트 차이점

### 1.1 백엔드 API 테스트 (본 문서)
```
⚡ API 엔드포인트 직접 호출
⚡ 빠르고 가벼움 (HTTP 요청만)
⚡ 대량의 가상 유저 시뮬레이션 (100-1000명+)
⚡ 서버 성능, 동시성 제어에 집중
⚡ 비용 효율적 (낮은 리소스 소비)
```

### 1.2 프론트엔드 테스트
```
🌐 실제 브라우저 시뮬레이션
🌐 무겁고 느림 (렌더링 포함)
🌐 제한된 동시 접속 (10-20명)
🌐 사용자 경험(UX)에 집중
🌐 비용 높음 (브라우저 리소스 소비)
```

---

## 2. 백엔드 테스트 목적

### 2.1 주요 목표

#### 서버 성능 검증
- **처리량 (Throughput)**: 초당 처리 가능한 요청 수
- **응답 시간 (Response Time)**: API 응답 속도
- **동시 접속 (Concurrency)**: 동시 처리 가능한 요청 수

#### Spring Boot 특화 검증
| 영역 | 측정 항목 | 목표값 |
|------|----------|--------|
| **JVM** | Heap 메모리, GC 빈도 | Heap < 80%, GC < 1초 |
| **스레드 풀** | Active/Idle 스레드 수 | 사용률 < 80% |
| **DB 커넥션** | Active/Idle 커넥션 수 | 사용률 < 80% |
| **트랜잭션** | 트랜잭션 처리 시간 | < 500ms |

#### 동시성 제어 검증
- 좌석 중복 예약 방지 (Pessimistic Lock / Optimistic Lock)
- 트랜잭션 격리 수준 검증
- 데드락 발생 여부

---

## 3. 테스트 도구 선택

### 3.1 도구 비교

| 도구 | 장점 | 단점 | 추천 용도 |
|------|------|------|-----------|
| **k6** | 가볍고 빠름, JavaScript, 높은 TPS | GUI 없음 | API 부하 테스트 (추천) |
| **JMeter** | GUI, 다양한 프로토콜, 플러그인 풍부 | 무겁고 느림, Java 기반 | 복잡한 시나리오, 레거시 |
| **Gatling** | Scala 기반, 실시간 리포트, 코드 기반 | 학습 곡선 높음 | 대규모 테스트 |
| **Locust** | Python 기반, 분산 테스트 쉬움 | 단일 스레드 제약 | Python 친화적 팀 |
| **Artillery** | Node.js 기반, YAML 설정 | 낮은 TPS | 간단한 테스트 |

### 3.2 권장 조합

```
1차: k6 (API 부하 테스트)
  → 빠른 실행, 높은 TPS
  → 100-1000명 동시 접속 가능
  → CI/CD 통합 쉬움

2차: Spring Boot Actuator (메트릭 수집)
  → JVM, 스레드, DB 메트릭
  → Prometheus + Grafana 연동

3차: JMeter (복잡한 시나리오)
  → GUI로 시나리오 작성
  → 결과 시각화 (선택사항)
```

---

## 4. Spring Boot 아키텍처 고려사항

### 4.1 Spring Boot 계층 구조

```
┌─────────────────────────────────┐
│   Controller Layer              │ ← HTTP 요청 처리
├─────────────────────────────────┤
│   Service Layer                 │ ← 비즈니스 로직
├─────────────────────────────────┤
│   Repository Layer              │ ← DB 접근
├─────────────────────────────────┤
│   Database (MySQL, PostgreSQL)  │
└─────────────────────────────────┘
```

### 4.2 성능에 영향을 주는 주요 요소

#### JVM 설정
```
- Heap 메모리 크기 (-Xms, -Xmx)
- GC 알고리즘 (G1GC, ZGC, Shenandoah)
- 스레드 스택 크기
```

#### 웹 서버 설정 (Tomcat/Undertow)
```
- 최대 스레드 수 (server.tomcat.threads.max)
- 최대 연결 수 (server.tomcat.max-connections)
- Accept Count (대기 큐 크기)
```

#### 데이터베이스 커넥션 풀 (HikariCP)
```
- 최대 커넥션 수 (spring.datasource.hikari.maximum-pool-size)
- 최소 Idle 커넥션 (spring.datasource.hikari.minimum-idle)
- 커넥션 타임아웃 (spring.datasource.hikari.connection-timeout)
```

#### JPA/Hibernate 설정
```
- Lazy Loading vs Eager Loading
- N+1 쿼리 문제
- 배치 처리 (batch-size)
- 캐시 설정 (2차 캐시)
```

---

## 5. 테스트 시나리오

### 5.1 시나리오 1: API 응답 시간 측정

**목적**: 각 API 엔드포인트의 기본 성능 측정

**테스트 대상 API**:
```
인증 API:
  - POST /api/auth/login
  - POST /api/auth/logout
  - POST /api/auth/refresh

공연 조회 API:
  - GET /api/performances (목록 조회)
  - GET /api/performances/{id} (상세 조회)
  - GET /api/schedules/{id} (회차 조회)

예매 API (핵심):
  - POST /api/bookings/start (좌석 점유)
  - GET /api/bookings/{id}/time (남은 시간)
  - DELETE /api/bookings/{id} (예매 취소)

결제 API:
  - POST /api/payments (결제 생성)
  - POST /api/payments/{id}/complete (결제 완료)
```

**부하 패턴**:
```
- 동시 사용자: 10명
- 지속 시간: 5분
- 각 API를 순차적으로 호출
```

**측정 항목**:
- 평균 응답 시간 (Average)
- P50, P95, P99 응답 시간
- 최소/최대 응답 시간
- 에러율

**성공 기준**:
- 평균 응답 시간 < 1초
- P95 응답 시간 < 2초
- 에러율 < 1%

---

### 5.2 시나리오 2: 동시성 제어 검증 (좌석 충돌)

**목적**: 100명이 동시에 같은 좌석 예약 시 정확히 1명만 성공

**테스트 설계**:
```
사전 준비:
  - 100개의 사용자 계정 (로그인 완료)
  - 특정 좌석 1개 (빈 좌석)
  - DB 트랜잭션 격리 수준 확인

테스트 실행:
  1. 100명이 동시에 인증 토큰 획득
  2. 동시에 POST /api/bookings/start 호출
     (동일한 scheduleId, 동일한 좌석 row/col)
  3. 응답 확인

예상 결과:
  - 200 OK: 1건 (성공)
  - 409 Conflict: 99건 (좌석 충돌)
  - 기타 에러: 0건
```

**검증 방법**:
```sql
-- 테스트 후 DB 직접 확인
SELECT COUNT(*) FROM booking
WHERE schedule_id = {TEST_SCHEDULE_ID}
  AND seat_row = {TEST_ROW}
  AND seat_col = {TEST_COL}
  AND status IN ('PENDING', 'CONFIRMED');

-- 결과가 정확히 1이어야 함
```

**Spring Boot 레벨 확인**:
```
- 락(Lock) 타입 확인 (Pessimistic / Optimistic)
- 트랜잭션 로그 분석
- 데드락 발생 여부
- 스레드 경합 상황
```

**성공 기준**:
- 정확히 1명만 예매 성공
- 나머지 99명은 409 Conflict
- DB에 1건만 저장
- 모든 응답 시간 < 2초
- 데드락 0건

---

### 5.3 시나리오 3: 스케일 테스트 (점진적 부하 증가)

**목적**: 동시 접속자 수 증가에 따른 성능 변화 측정

**부하 패턴**:
```
Stage 1: 10명 (1분간 유지)
  ↓
Stage 2: 50명 (2분간 유지)
  ↓
Stage 3: 100명 (3분간 유지)
  ↓
Stage 4: 200명 (2분간 유지)
  ↓
Stage 5: 500명 (1분간 유지)
  ↓
Stage 6: 점진적 감소 (1분)
```

**측정 항목**:
- 각 단계별 평균 응답 시간
- 각 단계별 TPS (Transactions Per Second)
- 각 단계별 에러율
- 서버 리소스 사용률 (CPU, Memory, DB)

**성공 기준**:
- 100명까지: 응답 시간 < 2초, 에러율 < 1%
- 200명까지: 응답 시간 < 3초, 에러율 < 5%
- 500명: 시스템 크래시 없이 응답

---

### 5.4 시나리오 4: 트랜잭션 안정성 검증

**목적**: 결제 프로세스의 트랜잭션 정합성 확인

**테스트 플로우**:
```
1. 좌석 선택 (POST /api/bookings/start)
   ↓
2. 결제 생성 (POST /api/payments)
   ↓
3. 결제 완료 (POST /api/payments/{id}/complete)
   ↓
4. 예매 확정 (POST /api/bookings/{id}/confirm)
```

**장애 시나리오**:
```
시나리오 A: 결제 생성 중 타임아웃
  → 좌석 점유 자동 해제 확인

시나리오 B: 결제 완료 중 실패
  → 결제 취소 및 좌석 해제 확인

시나리오 C: 네트워크 단절 시뮬레이션
  → 트랜잭션 롤백 확인
```

**검증 항목**:
```
- 트랜잭션 원자성 (Atomicity)
- 데이터 정합성 (Consistency)
- 보상 트랜잭션 (Compensation)
- 중복 결제 방지
```

**성공 기준**:
- 실패 시 100% 롤백
- 데이터 불일치 0건
- 중복 결제 0건

---

### 5.5 시나리오 5: 내구성 테스트 (Long-Running)

**목적**: 장시간 운영 시 메모리 누수, 커넥션 고갈 등 확인

**부하 패턴**:
```
- 동시 사용자: 50명
- 지속 시간: 1-2시간
- 모든 API를 랜덤하게 호출
```

**모니터링 항목**:
```
JVM 메트릭:
  - Heap 메모리 사용량 추이
  - GC 빈도 및 소요 시간
  - Old Generation 증가 추이

스레드 풀:
  - Active 스레드 수
  - Queue 대기 건수

DB 커넥션 풀:
  - Active 커넥션 수
  - Idle 커넥션 수
  - 커넥션 획득 대기 시간

애플리케이션:
  - 응답 시간 변화 추이
  - 에러 발생 패턴
```

**성공 기준**:
- Heap 메모리가 일정 수준 유지 (계속 증가 X)
- GC 시간 < 1초
- DB 커넥션 누수 없음
- 응답 시간이 점진적으로 증가하지 않음

---

## 6. Spring Boot 최적화 체크리스트

### 6.1 JVM 튜닝

```yaml
# application.yml
spring:
  application:
    name: smarter-store-api

# JVM 옵션 (application 시작 시)
JAVA_OPTS:
  - -Xms2g                    # 초기 Heap 크기
  - -Xmx2g                    # 최대 Heap 크기 (초기와 동일 권장)
  - -XX:+UseG1GC             # G1 GC 사용
  - -XX:MaxGCPauseMillis=200 # GC 최대 정지 시간
  - -XX:+HeapDumpOnOutOfMemoryError  # OOM 시 Heap Dump
```

**확인 사항**:
- [ ] Heap 크기가 물리 메모리의 50-75% 이하
- [ ] 초기 Heap과 최대 Heap 동일하게 설정 (메모리 재할당 방지)
- [ ] GC 알고리즘 선택 (G1GC 권장, 대용량은 ZGC)

### 6.2 웹 서버 튜닝 (Tomcat/Undertow)

```yaml
# application.yml
server:
  port: 8080
  tomcat:
    threads:
      max: 200              # 최대 스레드 수
      min-spare: 10         # 최소 Idle 스레드
    max-connections: 10000  # 최대 연결 수
    accept-count: 100       # 대기 큐 크기
    connection-timeout: 20000  # 연결 타임아웃 (20초)
```

**권장 설정**:
```
max-threads 계산:
  = (예상 동시 접속 * 1.5) ~ (예상 동시 접속 * 2)
  예: 100명 동시 접속 → 150-200 스레드

max-connections 계산:
  = max-threads * 50
  예: 200 스레드 → 10,000 연결
```

**확인 사항**:
- [ ] 스레드 수가 과도하지 않음 (너무 많으면 컨텍스트 스위칭 부하)
- [ ] 연결 타임아웃 적절 설정
- [ ] Accept Count로 급격한 트래픽 대응

### 6.3 데이터베이스 커넥션 풀 (HikariCP)

```yaml
# application.yml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20      # 최대 커넥션 수
      minimum-idle: 5            # 최소 Idle 커넥션
      connection-timeout: 30000  # 커넥션 획득 타임아웃 (30초)
      idle-timeout: 600000       # Idle 커넥션 타임아웃 (10분)
      max-lifetime: 1800000      # 커넥션 최대 수명 (30분)
```

**권장 설정**:
```
maximum-pool-size 계산:
  = (CPU 코어 수 * 2) + 디스크 수
  예: 8코어 서버 → 20개 커넥션

주의:
  - DB 최대 연결 수 확인 (MySQL: max_connections)
  - 여러 인스턴스 운영 시 전체 합산 고려
```

**확인 사항**:
- [ ] 커넥션 풀 크기가 DB 최대 연결 수 이하
- [ ] Idle 커넥션이 너무 많지 않음
- [ ] 타임아웃 설정 적절

### 6.4 JPA/Hibernate 최적화

```yaml
# application.yml
spring:
  jpa:
    properties:
      hibernate:
        jdbc:
          batch_size: 20          # 배치 처리 크기
        order_inserts: true       # INSERT 순서 최적화
        order_updates: true       # UPDATE 순서 최적화
    show-sql: false               # 운영 환경에서는 false
```

**N+1 쿼리 문제 해결**:
```java
// ❌ N+1 발생
@OneToMany(fetch = FetchType.LAZY)
private List<Seat> seats;

// ✅ Fetch Join 사용
@Query("SELECT p FROM Performance p JOIN FETCH p.seats WHERE p.id = :id")
Performance findByIdWithSeats(@Param("id") Long id);

// ✅ EntityGraph 사용
@EntityGraph(attributePaths = {"seats"})
Performance findByIdWithSeats(Long id);
```

**확인 사항**:
- [ ] N+1 쿼리 확인 및 해결
- [ ] Lazy Loading 전략 적절 사용
- [ ] 배치 처리 활성화
- [ ] 2차 캐시 고려 (자주 조회되는 데이터)

### 6.5 캐싱 전략

```java
// Spring Cache 설정
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        // Redis, Caffeine 등 사용
    }
}

// 사용 예시
@Cacheable(value = "performances", key = "#id")
public Performance getPerformance(Long id) {
    return performanceRepository.findById(id);
}
```

**캐싱 대상**:
```
높은 우선순위:
  - 공연 정보 (자주 조회, 변경 적음)
  - 공연장 정보 (거의 변경 없음)
  - 좌석 배치도 (변경 없음)

중간 우선순위:
  - 공연 회차 목록
  - 쿠폰 정보

낮은 우선순위:
  - 좌석 상태 (실시간 변경)
  - 예매 정보 (개인 정보)
```

**확인 사항**:
- [ ] 캐시 적중률 (Hit Rate) > 80%
- [ ] 캐시 무효화 전략 수립
- [ ] TTL 적절 설정

---

## 7. 모니터링 및 메트릭

### 7.1 Spring Boot Actuator

```yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: health,metrics,prometheus
  metrics:
    export:
      prometheus:
        enabled: true
```

**주요 엔드포인트**:
```
- /actuator/health: 애플리케이션 상태
- /actuator/metrics: 메트릭 목록
- /actuator/metrics/jvm.memory.used: JVM 메모리
- /actuator/metrics/hikaricp.connections.active: DB 커넥션
- /actuator/prometheus: Prometheus 포맷 메트릭
```

### 7.2 수집할 메트릭

#### JVM 메트릭
```
- jvm.memory.used: 메모리 사용량
- jvm.memory.max: 최대 메모리
- jvm.gc.pause: GC 정지 시간
- jvm.gc.memory.allocated: GC 할당 메모리
- jvm.threads.live: 활성 스레드 수
```

#### HTTP 메트릭
```
- http.server.requests: 요청 수
- http.server.requests.active: 진행 중 요청
- http.server.requests.duration: 응답 시간
- http.server.requests.errors: 에러 수
```

#### 데이터베이스 메트릭
```
- hikaricp.connections.active: 활성 커넥션
- hikaricp.connections.idle: Idle 커넥션
- hikaricp.connections.pending: 대기 중 요청
- hikaricp.connections.timeout: 타임아웃 수
```

#### 비즈니스 메트릭 (커스텀)
```java
// Micrometer 사용
@Service
public class BookingService {

    private final Counter bookingCounter;
    private final Timer bookingTimer;

    public BookingService(MeterRegistry registry) {
        this.bookingCounter = Counter.builder("booking.created")
            .tag("status", "success")
            .register(registry);

        this.bookingTimer = Timer.builder("booking.duration")
            .register(registry);
    }

    public Booking createBooking(BookingRequest request) {
        return bookingTimer.record(() -> {
            Booking booking = // ... 예매 로직
            bookingCounter.increment();
            return booking;
        });
    }
}
```

### 7.3 Prometheus + Grafana 연동

```yaml
# docker-compose.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
```

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'spring-boot-app'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['localhost:8080']
```

**Grafana 대시보드**:
```
- JVM Dashboard (ID: 4701)
- Spring Boot Dashboard (ID: 10280)
- 커스텀 대시보드 (예매 메트릭)
```

---

## 8. 테스트 실행 가이드

### 8.1 사전 준비

#### 환경 확인
```bash
# Java 버전 확인
java -version  # Java 17 이상 권장

# Spring Boot 애플리케이션 실행
./gradlew bootRun
# 또는
java -jar build/libs/smarter-store-api.jar

# Health Check
curl http://localhost:8080/actuator/health
```

#### 테스트 데이터 준비
```sql
-- 사용자 계정 생성 (100개)
INSERT INTO users (email, password, name, phone)
VALUES
  ('loadtest1@example.com', '$2a$...', 'Test User 1', '010-1111-0001'),
  ('loadtest2@example.com', '$2a$...', 'Test User 2', '010-1111-0002'),
  ... (100개)

-- 공연 및 회차 생성
INSERT INTO performance (title, venue_id, start_date, end_date)
VALUES ('테스트 공연', 1, '2026-02-01', '2026-02-28');

INSERT INTO schedule (performance_id, start_time)
VALUES (1, '2026-02-15 19:00:00');
```

### 8.2 k6 테스트 실행

#### 기본 실행
```bash
# k6 설치 확인
k6 version

# 단일 사용자 테스트 (사전 검증)
k6 run --vus 1 --duration 30s load-test/booking-load-test.js

# 100명 동시 접속 테스트
k6 run --vus 100 --duration 5m load-test/booking-load-test.js

# 환경 변수와 함께 실행
k6 run \
  -e BASE_URL=http://localhost:8080/api \
  -e SCHEDULE_ID=1 \
  --vus 100 \
  --duration 5m \
  load-test/booking-load-test.js
```

#### 점진적 부하 증가
```bash
k6 run \
  --stage 1m:10 \
  --stage 2m:50 \
  --stage 3m:100 \
  --stage 2m:200 \
  --stage 1m:0 \
  load-test/booking-load-test.js
```

#### 결과 저장
```bash
# JSON 형식으로 저장
k6 run --out json=results.json load-test/booking-load-test.js

# InfluxDB로 전송
k6 run --out influxdb=http://localhost:8086/k6 load-test/booking-load-test.js
```

### 8.3 모니터링

#### 실시간 모니터링
```bash
# Actuator 메트릭 확인
watch -n 1 'curl -s http://localhost:8080/actuator/metrics/jvm.memory.used | jq'

# Prometheus 메트릭 확인
curl http://localhost:8080/actuator/prometheus | grep booking

# Grafana 대시보드
# http://localhost:3000 접속
```

#### 로그 확인
```bash
# 애플리케이션 로그
tail -f logs/application.log

# 에러 로그만 필터링
tail -f logs/application.log | grep ERROR
```

---

## 9. 성공 기준 및 SLA

### 9.1 API별 응답 시간 목표

| API 엔드포인트 | 평균 | P95 | P99 | 최대 |
|---------------|------|-----|-----|------|
| POST /auth/login | < 500ms | < 1s | < 1.5s | < 2s |
| GET /performances | < 300ms | < 800ms | < 1s | < 1.5s |
| GET /performances/{id} | < 200ms | < 500ms | < 800ms | < 1s |
| POST /bookings/start | < 800ms | < 1.5s | < 2s | < 3s |
| POST /payments | < 500ms | < 1s | < 1.5s | < 2s |
| POST /payments/{id}/complete | < 1s | < 2s | < 3s | < 5s |

### 9.2 시스템 리소스 목표

| 메트릭 | 목표값 | 측정 조건 |
|--------|--------|-----------|
| CPU 사용률 | < 70% | 100명 동시 접속 |
| Heap 메모리 사용률 | < 80% | 피크 타임 |
| DB 커넥션 사용률 | < 80% | 평상시 |
| 스레드 사용률 | < 80% | 평상시 |
| GC 정지 시간 | < 1초 | 항상 |

### 9.3 동시성 제어 목표

| 시나리오 | 목표 | 허용 오차 |
|----------|------|-----------|
| 좌석 충돌 테스트 | 정확히 1명 성공 | 0% |
| 트랜잭션 정합성 | 100% 정확 | 0% |
| 데드락 발생 | 0건 | 0건 |

---

## 10. 문제 해결 가이드

### 10.1 일반적인 성능 이슈

#### 이슈 1: 응답 시간 느림

**증상**:
- P95 응답 시간 > 3초
- 사용자 대기 시간 증가

**원인 파악**:
```bash
# 느린 쿼리 확인
SHOW PROCESSLIST;
SHOW FULL PROCESSLIST;

# Slow Query Log 확인
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;  # 1초 이상 쿼리
```

**해결 방법**:
- 데이터베이스 인덱스 추가
- N+1 쿼리 문제 해결
- 캐싱 적용
- 쿼리 최적화

#### 이슈 2: OutOfMemoryError

**증상**:
```
java.lang.OutOfMemoryError: Java heap space
```

**원인 파악**:
```bash
# Heap Dump 분석
jmap -dump:live,format=b,file=heap.bin <PID>

# Eclipse MAT, VisualVM으로 분석
```

**해결 방법**:
- Heap 크기 증가 (-Xmx)
- 메모리 누수 코드 수정
- 불필요한 객체 생성 최소화
- 대용량 데이터 처리 시 스트리밍 사용

#### 이슈 3: DB 커넥션 고갈

**증상**:
```
HikariPool - Connection is not available
```

**원인 파악**:
```bash
# 커넥션 풀 상태 확인
curl http://localhost:8080/actuator/metrics/hikaricp.connections.active
curl http://localhost:8080/actuator/metrics/hikaricp.connections.pending
```

**해결 방법**:
- 커넥션 풀 크기 증가
- 커넥션 누수 확인 (트랜잭션 미종료)
- 타임아웃 설정 조정
- 쿼리 최적화로 커넥션 점유 시간 단축

#### 이슈 4: 스레드 고갈

**증상**:
```
org.apache.tomcat.util.threads.ThreadPoolExecutor$RejectedExecutionHandler
```

**원인 파악**:
```bash
# 스레드 덤프 생성
jstack <PID> > thread-dump.txt

# 분석: BLOCKED, WAITING 상태 스레드 확인
```

**해결 방법**:
- 최대 스레드 수 증가
- 블로킹 작업 비동기 처리 (@Async)
- 외부 API 호출 타임아웃 설정
- 데드락 원인 제거

### 10.2 Spring Boot 디버깅 팁

#### 프로파일링
```bash
# JVM 프로파일링 활성화
java -agentlib:hprof=cpu=samples,depth=10 -jar app.jar

# JMX 활성화
java -Dcom.sun.management.jmxremote \
     -Dcom.sun.management.jmxremote.port=9010 \
     -Dcom.sun.management.jmxremote.authenticate=false \
     -jar app.jar
```

#### 로깅 레벨 조정
```yaml
# application.yml
logging:
  level:
    root: INFO
    com.zaxxer.hikari: DEBUG  # 커넥션 풀 디버깅
    org.hibernate.SQL: DEBUG  # SQL 로깅
    org.springframework.transaction: TRACE  # 트랜잭션 디버깅
```

---

## 11. 체크리스트

### 테스트 전
- [ ] Spring Boot 애플리케이션 정상 실행 확인
- [ ] DB 연결 확인
- [ ] Actuator 엔드포인트 접근 가능
- [ ] 테스트 데이터 준비 완료
- [ ] k6 또는 JMeter 설치 완료
- [ ] 모니터링 도구 설정 (Prometheus, Grafana)

### JVM 설정 확인
- [ ] Heap 크기 적절 설정 (-Xms, -Xmx)
- [ ] GC 알고리즘 선택 (G1GC, ZGC)
- [ ] GC 로그 활성화

### Spring Boot 설정 확인
- [ ] 최대 스레드 수 설정
- [ ] DB 커넥션 풀 크기 설정
- [ ] JPA 배치 처리 활성화
- [ ] 캐싱 설정 (필요 시)

### 테스트 중
- [ ] 실시간 메트릭 모니터링
- [ ] 로그 확인 (에러, 경고)
- [ ] DB 커넥션 상태 확인
- [ ] 스레드 상태 확인
- [ ] GC 발생 빈도 확인

### 테스트 후
- [ ] 결과 데이터 백업
- [ ] 테스트 데이터 정리
- [ ] 성능 보고서 작성
- [ ] 병목 지점 식별
- [ ] 개선 작업 계획 수립

---

## 12. 참고 자료

### 공식 문서
- [Spring Boot Performance](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html)
- [HikariCP Configuration](https://github.com/brettwooldridge/HikariCP#configuration-knobs-baby)
- [k6 Documentation](https://k6.io/docs/)
- [JVM Performance](https://docs.oracle.com/en/java/javase/17/gctuning/)

### 도구
- [Spring Boot Actuator](https://spring.io/guides/gs/actuator-service/)
- [Micrometer](https://micrometer.io/)
- [Prometheus](https://prometheus.io/)
- [Grafana](https://grafana.com/)

### 최적화 가이드
- [JVM GC Tuning](https://www.oracle.com/technical-resources/articles/java/g1gc.html)
- [Hibernate Performance](https://vladmihalcea.com/tutorials/hibernate/)
- [Spring Boot Best Practices](https://www.baeldung.com/spring-boot-performance)

---

## 부록: Spring Boot vs Node.js 성능 비교

| 특성 | Spring Boot | Node.js |
|------|-------------|---------|
| **동시성 모델** | 멀티 스레드 (Thread Pool) | 싱글 스레드 (Event Loop) |
| **CPU 집약적 작업** | 우수 (멀티 스레드 활용) | 불리 (블로킹) |
| **I/O 작업** | 우수 (NIO) | 매우 우수 (Non-blocking) |
| **메모리 사용** | 높음 (JVM Heap) | 낮음 |
| **시작 시간** | 느림 (수 초) | 빠름 (밀리초) |
| **TPS** | 높음 (1000+ TPS) | 매우 높음 (10000+ TPS, I/O) |
| **안정성** | 높음 (Type-safe, Mature) | 중간 (Dynamic Typing) |
| **적합한 상황** | 복잡한 비즈니스 로직, 트랜잭션 | 실시간, 높은 I/O |

**결론**: Spring Boot는 복잡한 비즈니스 로직과 트랜잭션 처리가 필요한 예매 시스템에 적합합니다.

---

**문서 버전**: 1.0
**마지막 수정일**: 2026-01-29
**작성자**: Claude (AI Assistant)
