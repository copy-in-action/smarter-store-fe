# GitHub Actions에서 빌드된 결과를 사용하는 경량 이미지
FROM node:22-alpine

WORKDIR /app

# 프로덕션용 사용자 생성
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# GitHub Actions에서 빌드된 standalone 결과 복사
COPY .next/standalone ./
COPY .next/static ./.next/static
COPY --chown=nextjs:nodejs public ./public

# 사용자 권한 설정
USER nextjs

# 포트 노출
EXPOSE 43000

# 환경 변수 설정
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 애플리케이션 실행
CMD ["node", "server.js"]