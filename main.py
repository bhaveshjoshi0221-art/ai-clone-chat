"""
AI Clone Chat — FastAPI Application Entry Point
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.core.config import settings
from app.db.session import engine
from app.db.base import Base
from app.api.v1 import auth, users, chats, groups, clones, training
from app.ws.handlers import router as ws_router


# ---------------------------------------------------------------------------
# Lifespan — startup / shutdown
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables (use Alembic in production)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅  Database tables ready")
    yield
    # Shutdown: dispose connection pool
    await engine.dispose()
    print("🛑  Database connections closed")


# ---------------------------------------------------------------------------
# App factory
# ---------------------------------------------------------------------------

app = FastAPI(
    title="AI Clone Chat API",
    version="1.0.0",
    description="Snapchat-style messaging with AI personality clones",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)


# ---------------------------------------------------------------------------
# Middleware
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)


# ---------------------------------------------------------------------------
# REST Routers
# ---------------------------------------------------------------------------

API_PREFIX = "/api/v1"

app.include_router(auth.router,     prefix=f"{API_PREFIX}/auth",     tags=["Auth"])
app.include_router(users.router,    prefix=f"{API_PREFIX}/users",    tags=["Users"])
app.include_router(chats.router,    prefix=f"{API_PREFIX}/chats",    tags=["Chats"])
app.include_router(groups.router,   prefix=f"{API_PREFIX}/groups",   tags=["Groups"])
app.include_router(clones.router,   prefix=f"{API_PREFIX}/clones",   tags=["Clones"])
app.include_router(training.router, prefix=f"{API_PREFIX}/training", tags=["Training"])


# ---------------------------------------------------------------------------
# WebSocket Router
# ---------------------------------------------------------------------------

app.include_router(ws_router, tags=["WebSocket"])


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "version": app.version}
