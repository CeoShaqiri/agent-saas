
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .chroma_db import add_qa, query_qa
from .email_notify import send_answer_email
from .rate_limit import RateLimitMiddleware

app = FastAPI()
app.add_middleware(RateLimitMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.exceptions import HTTPException, RequestValidationError
from .error_logging import http_exception_handler, validation_exception_handler
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)

app = FastAPI()
app.add_middleware(RateLimitMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)

class EmailRequest(BaseModel):
    to_email: str
    question: str
    answer: str

# Sample endpoint to send expert answer email
@app.post("/send_answer_email")
def send_answer_email_endpoint(req: EmailRequest):
    status = send_answer_email(req.to_email, req.question, req.answer)
    return {"status": status}

class QARequest(BaseModel):
    question: str
    answer: str
    agent: str
    user_id: str = None

class QueryRequest(BaseModel):
    query: str
    agent: str = None
    top_k: int = 3

@app.post("/add_qa")
def add_qa_endpoint(req: QARequest):
    add_qa(req.question, req.answer, req.agent, req.user_id)
    return {"status": "success"}

@app.post("/query_qa")
def query_qa_endpoint(req: QueryRequest):
    results = query_qa(req.query, req.agent, req.top_k)
    return {"results": results}
