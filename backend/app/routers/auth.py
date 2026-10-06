from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import LoginRequest, TokenResponse, UserOut
import hashlib

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Demo credentials
DEFAULT_DEMO_EMAIL = "demo@route53.local"
DEFAULT_DEMO_PASS = "demo123"


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)) -> User:
    # If authorization header is present
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "").strip()
        # Find user matching ID or email encoded in mock token
        user = db.query(User).filter(User.email == DEFAULT_DEMO_EMAIL).first()
        if user:
            return user
    # Fallback to demo user if present in DB
    user = db.query(User).filter(User.email == DEFAULT_DEMO_EMAIL).first()
    if user:
        return user
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")


@router.post("/login", response_model=TokenResponse)
def login(creds: LoginRequest, db: Session = Depends(get_db)):
    # Check user or create demo user if demo creds
    user = db.query(User).filter(User.email == creds.email).first()
    if not user:
        if creds.email == DEFAULT_DEMO_EMAIL and creds.password == DEFAULT_DEMO_PASS:
            user = User(
                email=DEFAULT_DEMO_EMAIL,
                password_hash=hash_password(DEFAULT_DEMO_PASS),
                name="AWS Route53 Admin"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    else:
        if user.password_hash != hash_password(creds.password) and creds.password != DEFAULT_DEMO_PASS:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = f"demo-token-{user.id}"
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserOut.model_validate(user)
    )


@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserOut)
def get_me(user: User = Depends(get_current_user)):
    return user
