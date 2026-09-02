FROM node:20-alpine AS base

# 1. 의존성 설치
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# 2. 빌드
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js 클라이언트 사이드 변수는 빌드 시 번들에 포함되어야 합니다.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
# 주의: SUPABASE_SERVICE_ROLE_KEY 같은 서버 전용 비밀키는 보안상 빌드 ARG에 포함하지 않고 런타임에 주입합니다.

RUN npm run build

# 3. 런타임 이미지 (최적화된 Standalone 버전)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Public 폴더 복사
COPY --from=builder /app/public ./public

# 디렉토리 생성 및 권한 설정
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Standalone 출력 파일과 정적 파일 복사
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js 실행
CMD ["node", "server.js"]
