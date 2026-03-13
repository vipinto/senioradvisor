from fastapi import APIRouter, Request, Response, HTTPException
from pydantic import BaseModel
from typing import Optional
import os

from database import db
from auth import (
    get_current_user, register_user, login_user,
    google_auth_login, forgot_password, reset_password
)

router = APIRouter(prefix="/auth")


class EmailRegisterRequest(BaseModel):
    email: str
    password: str
    name: str


class EmailLoginRequest(BaseModel):
    email: str
    password: str


class GoogleAuthRequest(BaseModel):
    credential: Optional[str] = None
    code: Optional[str] = None
    redirect_uri: Optional[str] = None


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    password: str


@router.get("/me")
async def get_me(request: Request):
    """Get current authenticated user"""
    user = await get_current_user(request, db)

    subscription = await db.subscriptions.find_one(
        {"user_id": user["user_id"], "status": "active"},
        {"_id": 0}
    )

    provider = None
    if "provider" in user.get("roles", []) or user.get("role") == "provider":
        provider = await db.providers.find_one(
            {"user_id": user["user_id"]},
            {"_id": 0}
        )

    return {
        **user,
        "has_subscription": subscription is not None,
        "provider": provider
    }


class SwitchRoleRequest(BaseModel):
    role: str


@router.put("/switch-role")
async def switch_role(data: SwitchRoleRequest, request: Request):
    """Switch active role for multi-role users"""
    user = await get_current_user(request, db)
    roles = user.get("roles", [user.get("role", "client")])

    if data.role not in roles:
        raise HTTPException(status_code=400, detail=f"No tienes el rol '{data.role}'")

    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"active_role": data.role}}
    )
    user["active_role"] = data.role
    return {"message": f"Rol cambiado a {data.role}", "active_role": data.role}


@router.post("/add-role")
async def add_role(data: SwitchRoleRequest, request: Request):
    """Add a new role to the current user"""
    user = await get_current_user(request, db)
    roles = user.get("roles", [user.get("role", "client")])

    if data.role not in ("client", "provider"):
        raise HTTPException(status_code=400, detail="Rol debe ser 'client' o 'provider'")

    if data.role in roles:
        raise HTTPException(status_code=400, detail=f"Ya tienes el rol '{data.role}'")

    roles.append(data.role)
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"roles": roles, "active_role": data.role, "role": data.role}}
    )
    return {"message": f"Rol '{data.role}' agregado", "roles": roles, "active_role": data.role}


@router.post("/register")
async def email_register(data: EmailRegisterRequest):
    """Register with email and password"""
    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 6 caracteres")
    result = await register_user(data.email, data.password, data.name, db)
    return result


@router.post("/login")
async def email_login(data: EmailLoginRequest):
    """Login with email and password"""
    result = await login_user(data.email, data.password, db)
    return result


@router.post("/google")
async def google_login(data: GoogleAuthRequest):
    """Login/register with Google OAuth (supports both popup and redirect flows)"""
    result = await google_auth_login(
        credential=data.credential,
        code=data.code,
        redirect_uri=data.redirect_uri,
        db=db
    )
    return result


@router.post("/forgot-password")
async def handle_forgot_password(data: ForgotPasswordRequest, request: Request):
    """Send password reset email"""
    frontend_url = request.headers.get("origin")
    if not frontend_url:
        frontend_url = os.environ.get("FRONTEND_URL", "")
    if not frontend_url:
        raise HTTPException(status_code=400, detail="No se pudo determinar la URL de origen")
    result = await forgot_password(data.email, db, frontend_url)
    return result


@router.post("/reset-password")
async def handle_reset_password(data: ResetPasswordRequest):
    """Reset password with token"""
    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 6 caracteres")
    result = await reset_password(data.token, data.password, db)
    return result


@router.post("/logout")
async def logout(request: Request, response: Response):
    """Logout user and delete session"""
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out successfully"}
