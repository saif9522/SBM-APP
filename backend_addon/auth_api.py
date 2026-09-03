"""
core/auth_api.py  —  Mobile token-auth endpoints (ADDITIVE, no migrations).

Drop this file into your `core/` app, then add ONE line to core/api_urls.py:

    from django.urls import path, include
    
@api_view(["POST"])
@permission_classes([AllowAny])
def change_password(request):
    header = request.META.get("HTTP_AUTHORIZATION", "")
    token = header.split(" ", 1)[1].strip() if " " in header else header.strip()
    user = user_from_token(token) if token else None
    if not user:
        return Response({"detail": "Not authenticated."},
                        status=status.HTTP_401_UNAUTHORIZED)
    old = request.data.get("old_password") or ""
    new = request.data.get("new_password") or ""
    if not new or len(new) < 6:
        return Response({"detail": "New password must be at least 6 characters."},
                        status=status.HTTP_400_BAD_REQUEST)
    if not (user.password and user.check_password(old)):
        return Response({"detail": "Current password is incorrect."},
                        status=status.HTTP_400_BAD_REQUEST)
    user.set_password(new)
    user.save(update_fields=["password"])
    return Response({"status": "success", "message": "Password updated."})


urlpatterns = [
        ...
        path('auth/', include('core.auth_api')),   # <-- add this
        path('', include(router.urls)),
    ]

That exposes, under /api/auth/:
    POST login/              {phone, password}            -> {token, user}
    POST register/           {name, phone, password, ...} -> {status, message}  (sends OTP)
    POST login/send-otp/     {phone}                      -> {status, message}  (sends OTP)
    POST verify-otp/         {phone, otp}                 -> {token, user}       (also verifies new accounts)
    GET  me/                 Authorization: Bearer <tok>  -> user

The token is a signed (HMAC/SECRET_KEY) value — stateless, so NO database
model or migration is required. It reuses your existing User model and the
generate_otp / send_otp / verify_user_otp helpers from core.views.
"""
from datetime import timedelta

from django.core import signing
from django.urls import path
from django.utils import timezone

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from .models import User
from .serializers import UserSerializer
from .views import generate_otp, send_otp, verify_user_otp

SIGNER_SALT = "sbm.mobile.auth.v1"
TOKEN_MAX_AGE = 60 * 60 * 24 * 30  # 30 days


def make_token(user):
    return signing.dumps({"uid": user.id}, salt=SIGNER_SALT)


def user_from_token(token):
    try:
        data = signing.loads(token, salt=SIGNER_SALT, max_age=TOKEN_MAX_AGE)
    except signing.BadSignature:
        return None
    return User.objects.filter(id=data.get("uid")).first()


def _auth_payload(user):
    return {"token": make_token(user), "user": UserSerializer(user).data}


def _set_and_send_otp(user):
    user.otp = generate_otp()
    user.otp_expiry = timezone.now() + timedelta(minutes=10)
    user.save(update_fields=["otp", "otp_expiry"])
    sent = send_otp(user.phone, user.otp)
    # If SMS gateway is down we still return the OTP so the flow isn't blocked
    # (mirrors the website's behaviour). Remove `debug_otp` in production.
    return sent


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    phone = (request.data.get("phone") or "").strip()
    password = request.data.get("password") or ""
    if not phone or not password:
        return Response({"detail": "Phone and password are required."},
                        status=status.HTTP_400_BAD_REQUEST)
    user = User.objects.filter(phone=phone).first()
    if not user:
        return Response({"detail": "This number is not registered."},
                        status=status.HTTP_400_BAD_REQUEST)
    if not (user.password and user.check_password(password)):
        return Response({"detail": "Incorrect phone or password."},
                        status=status.HTTP_400_BAD_REQUEST)
    return Response(_auth_payload(user))


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    d = request.data
    phone = (d.get("phone") or "").strip()
    password = d.get("password") or ""
    name = (d.get("name") or "").strip()
    if not (phone and password and name):
        return Response({"detail": "Name, phone and password are required."},
                        status=status.HTTP_400_BAD_REQUEST)

    existing = User.objects.filter(phone=phone).first()
    if existing and existing.is_verified:
        return Response({"detail": "This number is already registered. Please sign in."},
                        status=status.HTTP_400_BAD_REQUEST)

    user = existing or User()
    user.name = name
    user.phone = phone
    user.email = d.get("email") or user.email
    user.address = d.get("address") or getattr(user, "address", "")
    user.ward_no = d.get("ward_no") or getattr(user, "ward_no", "")
    user.set_password(password)
    user.is_verified = False
    user.save()

    _set_and_send_otp(user)
    resp = {"status": "success", "message": "OTP sent to your phone."}
    return Response(resp)


@api_view(["POST"])
@permission_classes([AllowAny])
def login_send_otp(request):
    phone = (request.data.get("phone") or "").strip()
    user = User.objects.filter(phone=phone).first()
    if not user:
        return Response({"detail": "This number is not registered."},
                        status=status.HTTP_400_BAD_REQUEST)
    _set_and_send_otp(user)
    return Response({"status": "success", "message": "OTP sent to your phone."})


@api_view(["POST"])
@permission_classes([AllowAny])
def verify_otp(request):
    phone = (request.data.get("phone") or "").strip()
    otp = (request.data.get("otp") or "").strip()
    user = User.objects.filter(phone=phone).first()
    if not user:
        return Response({"detail": "This number is not registered."},
                        status=status.HTTP_400_BAD_REQUEST)
    if not verify_user_otp(user, otp):
        return Response({"detail": "Invalid or expired OTP."},
                        status=status.HTTP_400_BAD_REQUEST)
    user.is_verified = True
    user.otp = None
    user.otp_expiry = None
    user.save(update_fields=["is_verified", "otp", "otp_expiry"])
    return Response(_auth_payload(user))


@api_view(["GET"])
@permission_classes([AllowAny])
def me(request):
    header = request.META.get("HTTP_AUTHORIZATION", "")
    token = header.split(" ", 1)[1].strip() if " " in header else header.strip()
    user = user_from_token(token) if token else None
    if not user:
        return Response({"detail": "Not authenticated."},
                        status=status.HTTP_401_UNAUTHORIZED)
    return Response(UserSerializer(user).data)



@api_view(["POST"])
@permission_classes([AllowAny])
def change_password(request):
    header = request.META.get("HTTP_AUTHORIZATION", "")
    token = header.split(" ", 1)[1].strip() if " " in header else header.strip()
    user = user_from_token(token) if token else None
    if not user:
        return Response({"detail": "Not authenticated."},
                        status=status.HTTP_401_UNAUTHORIZED)
    old = request.data.get("old_password") or ""
    new = request.data.get("new_password") or ""
    if not new or len(new) < 6:
        return Response({"detail": "New password must be at least 6 characters."},
                        status=status.HTTP_400_BAD_REQUEST)
    if not (user.password and user.check_password(old)):
        return Response({"detail": "Current password is incorrect."},
                        status=status.HTTP_400_BAD_REQUEST)
    user.set_password(new)
    user.save(update_fields=["password"])
    return Response({"status": "success", "message": "Password updated."})


urlpatterns = [
    path("login/", login, name="mobile-login"),
    path("login/send-otp/", login_send_otp, name="mobile-login-send-otp"),
    path("register/", register, name="mobile-register"),
    path("verify-otp/", verify_otp, name="mobile-verify-otp"),
    path("me/", me, name="mobile-me"),
    path("change-password/", change_password, name="mobile-change-password"),
]
