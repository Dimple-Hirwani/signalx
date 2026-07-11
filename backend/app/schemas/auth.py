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
