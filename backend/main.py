# FastAPI application
# Multi-Agent Business Process Execution Platform

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agents.orchestrator import execute_refund_workflow
from agents.audit_agent import get_audit_logs


# Create FastAPI application
app = FastAPI(
    title="Multi-Agent Business Process Execution Platform",
    description="API for executing automated refund workflows",
    version="1.0.0"
)


# Allow React frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://multi-agent-platform-mep7.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request model
class RefundRequest(BaseModel):
    order_id: str


# Home endpoint
@app.get("/")
def home():
    return {
        "message": "Multi-Agent Platform API is running"
    }


# Health endpoint
@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# Refund workflow endpoint
@app.post("/refund")
def create_refund(request: RefundRequest):
    result = execute_refund_workflow(request.order_id)
    return result


# Audit logs endpoint
@app.get("/audit-logs")
def fetch_audit_logs():
    return {
        "audit_logs": get_audit_logs()
    }