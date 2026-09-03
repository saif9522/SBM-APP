# Mobile token-auth — backend install (additive, ~2 minutes)

This enables clean token auth for the mobile app **without a new backend and
without any database migration**. It reuses your existing `User` model and the
`generate_otp` / `send_otp` / `verify_user_otp` helpers already in
`core/views.py`.

## 1. Copy the file
Copy `auth_api.py` into your Django app at `core/auth_api.py`.

## 2. Register the routes
Open `core/api_urls.py` and add ONE line inside `urlpatterns` (before the
router include):

```python
urlpatterns = [
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
    path('docs/',   SpectacularSwaggerView.as_view(url_name='api:schema'), name='swagger-ui'),
    path('redoc/',  SpectacularRedocView.as_view(url_name='api:schema'), name='redoc'),

    path('auth/', include('core.auth_api')),   # <-- ADD THIS LINE

    path('', include(router.urls)),
]
```

(`include` is already imported at the top of that file.)

## 3. Restart the server
That's it. New endpoints are live under `/api/auth/`:

| Method | Path                      | Body                                   | Returns            |
|--------|---------------------------|----------------------------------------|--------------------|
| POST   | `/api/auth/login/`        | `{phone, password}`                    | `{token, user}`    |
| POST   | `/api/auth/register/`     | `{name, phone, password, email?, address?, ward_no?}` | `{status, message}` (sends OTP) |
| POST   | `/api/auth/login/send-otp/` | `{phone}`                            | `{status, message}` (sends OTP) |
| POST   | `/api/auth/verify-otp/`   | `{phone, otp}`                         | `{token, user}`    |
| GET    | `/api/auth/me/`           | header `Authorization: Bearer <token>` | `user`             |
| POST   | `/api/auth/change-password/` | `{old_password, new_password}` + Bearer | `{status, message}` |

## How the token works
The token is a signed value (HMAC using your `SECRET_KEY`), so it's stateless —
no `Token` table, no migration. It encodes only the user id and expires after
30 days. The mobile app stores it in the device keystore (expo-secure-store)
and sends it as `Authorization: Bearer <token>`.

## Notes
- `register` creates the user as `is_verified=False`; `verify-otp` flips it to
  verified and returns the session token. This matches your website's OTP flow.
- If you'd rather not touch the backend, the app can instead use session-cookie
  auth against your existing `/login/` page — ask and I'll switch the client.
