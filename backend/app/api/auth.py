from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.db.session import get_db
from backend.app.db.models import User, Organization
from backend.app.core.security import verify_password, get_password_hash, create_access_token
from backend.app.schemas.schemas import UserLogin, UserSignup, TokenResponse, UserResponse
from backend.app.services.audit_service import audit_service
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == payload.email)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    org_res = await db.execute(select(Organization).where(Organization.id == user.org_id))
    org = org_res.scalar_one_or_none()

    token = create_access_token(subject=user.id, org_id=user.org_id, role=user.role)

    await audit_service.log_event(
        db=db,
        org_id=user.org_id,
        user_id=user.id,
        event_type="auth.login",
        action_details={"email": user.email, "status": "SUCCESS"}
    )

    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
        organization_name=org.name if org else "Demo Operations"
    )

@router.post("/signup", response_model=TokenResponse)
async def signup(payload: UserSignup, db: AsyncSession = Depends(get_db)):
    # Check existing user
    res = await db.execute(select(User).where(User.email == payload.email))
    if res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="User email already registered")

    slug = payload.org_name.lower().replace(" ", "-")
    org_res = await db.execute(select(Organization).where(Organization.slug == slug))
    org = org_res.scalar_one_or_none()

    if not org:
        org = Organization(name=payload.org_name, slug=slug)
        db.add(org)
        await db.flush()

    user = User(
        org_id=org.id,
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        full_name=payload.full_name,
        role="admin"
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token(subject=user.id, org_id=user.org_id, role=user.role)

    await audit_service.log_event(
        db=db,
        org_id=user.org_id,
        user_id=user.id,
        event_type="auth.signup",
        action_details={"org_name": org.name, "email": user.email}
    )

    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
        organization_name=org.name
    )

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
