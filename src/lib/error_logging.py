import logging
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exception_handlers import RequestValidationError
from fastapi.exceptions import HTTPException

logging.basicConfig(filename='app_errors.log', level=logging.ERROR)

async def http_exception_handler(request: Request, exc: HTTPException):
    logging.error(f"HTTPException: {exc.detail} | Path: {request.url}")
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logging.error(f"ValidationError: {exc.errors()} | Path: {request.url}")
    return JSONResponse(status_code=422, content={"detail": exc.errors()})
