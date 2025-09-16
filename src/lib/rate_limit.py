from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
import time

RATE_LIMIT = 100  # requests
RATE_PERIOD = 60  # seconds

user_requests = {}

class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        user_ip = request.client.host
        now = time.time()
        reqs = user_requests.get(user_ip, [])
        reqs = [t for t in reqs if now - t < RATE_PERIOD]
        if len(reqs) >= RATE_LIMIT:
            raise HTTPException(status_code=429, detail="Rate limit exceeded")
        reqs.append(now)
        user_requests[user_ip] = reqs
        response = await call_next(request)
        return response
