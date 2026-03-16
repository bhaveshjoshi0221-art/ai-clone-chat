from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# ── Password hashing ───────────────────────────────────────────────────────

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# ── Token creation ─────────────────────────────────────────────────────────

def _make_token(subject: str, expires_delta: timedelta, token_type: str) -> str:
    expire = datetime.now(timezone.utc) + expires_delta
    payload: dict[str, Any] = {
        "sub": subject,
        "type": token_type,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_access_token(user_id: str) -> str:
    return _make_token(
        subject=user_id,
        expires_delta=timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES),
        token_type="access",
    )


def create_refresh_token(user_id: str) -> str:
    return _make_token(
        subject=user_id,
        expires_delta=timedelta(minutes=settings.JWT_REFRESH_TOKEN_EXPIRE_MINUTES),
        token_type="refresh",
    )


# ── Token decoding ─────────────────────────────────────────────────────────

class TokenError(Exception):
    pass


def decode_token(token: str, expected_type: str = "access") -> str:
    """
    Decodes a JWT and returns the subject (user_id).
    Raises TokenError on any failure.
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
    except JWTError as exc:
        raise TokenError(f"Invalid token: {exc}") from exc

    if payload.get("type") != expected_type:
        raise TokenError(f"Expected token type '{expected_type}'")

    subject: str | None = payload.get("sub")
    if not subject:
        raise TokenError("Token missing subject")

    return subject


def decode_access_token(token: str) -> str:
    return decode_token(token, expected_type="access")


def decode_refresh_token(token: str) -> str:
    return decode_token(token, expected_type="refresh")
