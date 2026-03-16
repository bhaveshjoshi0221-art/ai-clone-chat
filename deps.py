from typing import AsyncGenerator
from uuid import UUID

from fastapi import Depends, HTTPException, Query, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.security import decode_access_token, TokenError
from app.db.session import AsyncSessionLocal
from app.models.user import User

# ── Bearer scheme ──────────────────────────────────────────────────────────

bearer_scheme = HTTPBearer(auto_error=False)


# ── Database session ───────────────────────────────────────────────────────

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# ── Resolve user from JWT ──────────────────────────────────────────────────

async def _resolve_user(user_id: str, db: AsyncSession) -> User:
    try:
        uid = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject")

    result = await db.execute(select(User).where(User.id == uid))
    user: User | None = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user


# ── HTTP Bearer dependency ─────────────────────────────────────────────────

async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        user_id = decode_access_token(credentials.credentials)
    except TokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        )

    return await _resolve_user(user_id, db)


# ── WebSocket token dependency (token passed as query param) ───────────────

async def get_ws_user(
    token: str = Query(..., description="JWT access token"),
    db: AsyncSession = Depends(get_db),
) -> User:
    try:
        user_id = decode_access_token(token)
    except TokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        )

    return await _resolve_user(user_id, db)


# ── Optional auth (public routes that enrich when logged in) ───────────────

async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    if credentials is None:
        return None
    try:
        user_id = decode_access_token(credentials.credentials)
        return await _resolve_user(user_id, db)
    except (TokenError, HTTPException):
        return None
