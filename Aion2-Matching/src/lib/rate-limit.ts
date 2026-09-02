export interface RateLimiter {
  check: (ip: string, limit: number, windowMs: number) => { success: boolean };
}

const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

export const rateLimiter: RateLimiter = {
  check: (ip: string, limit: number, windowMs: number) => {
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    // 주기적으로 맵 정리 (간단한 구현)
    if (Math.random() < 0.1) {
      for (const [key, value] of rateLimitMap.entries()) {
        if (now > value.expiresAt) {
          rateLimitMap.delete(key);
        }
      }
    }

    if (!record || now > record.expiresAt) {
      rateLimitMap.set(ip, { count: 1, expiresAt: now + windowMs });
      return { success: true };
    }

    if (record.count >= limit) {
      return { success: false };
    }

    record.count += 1;
    rateLimitMap.set(ip, record);
    return { success: true };
  },
};
