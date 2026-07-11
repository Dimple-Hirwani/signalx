from pydantic import BaseModel, field_validator
import re


class PhoneRequest(BaseModel):
    phone: str

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        v = v.strip()
        if not re.fullmatch(r"\d{10,15}", v):
            raise ValueError("Phone must be 10–15 digits")
        return v


class OTPRequest(BaseModel):
    phone: str
    otp: str

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        v = v.strip()
        if not re.fullmatch(r"\d{10,15}", v):
            raise ValueError("Phone must be 10–15 digits")
        return v

    @field_validator("otp")
    @classmethod
    def validate_otp(cls, v: str) -> str:
        v = v.strip()
        if not re.fullmatch(r"\d{4,8}", v):
            raise ValueError("OTP must be 4–8 digits")
        return v


class ProfileUpdateRequest(BaseModel):
    display_name: str | None = None
    avatar_url: str | None = None

    @field_validator("display_name")
    @classmethod
    def validate_name(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.strip()
        if not v:
            raise ValueError("Display name cannot be empty")
        if len(v) > 64:
            raise ValueError("Display name cannot exceed 64 characters")
        return v


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: str
    phone: str
    display_name: str
    avatar_url: str | None

    model_config = {"from_attributes": True}


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
