from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models import User
from app.schemas.auth import LoginResponse, OTPRequest, PhoneRequest, ProfileUpdateRequest, UserOut
from app.services.auth import logout, request_otp, verify_otp

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/request-otp", status_code=status.HTTP_200_OK)
async def request_otp_endpoint(body: PhoneRequest, db: AsyncSession = Depends(get_db)):
    result = await request_otp(db, body.phone)
    if not result["exists"]:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Phone number not found")
    return {"message": "OTP sent"}


@router.post("/verify-otp", response_model=LoginResponse)
async def verify_otp_endpoint(body: OTPRequest, db: AsyncSession = Depends(get_db)):
    response = await verify_otp(db, body.phone, body.otp)
    if response is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid OTP")
    return response


@router.get("/me", response_model=UserOut)
async def me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)


@router.patch("/profile", response_model=UserOut)
async def update_profile(
    body: ProfileUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if body.display_name is not None:
        current_user.display_name = body.display_name
    if body.avatar_url is not None:
        current_user.avatar_url = body.avatar_url
    await db.flush()
    return UserOut.model_validate(current_user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout_endpoint(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.removeprefix("Bearer ").strip()
    await logout(db, token)
