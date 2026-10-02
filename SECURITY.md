# Security Checklist — SBM Foundation App

Ye guide app + backend ko production ke liye secure karne ke liye hai.
Iska matlab "100% unhackable" nahi hai (aisa kuch hota nahi) — par ye common
aur serious risks band kar deta hai.

> Legend: 🔴 = zaroori (must-fix), 🟡 = strongly recommended, 🟢 = already done.

---

## 1. Backend (Django / DRF) — sabse important

### 🔴 1.1 API endpoints ko lock karo (AllowAny hatao)
Abhi REST API `AllowAny` par lagta hai — matlab bina login ke koi bhi data
padh/likh sakta hai. Har ViewSet par proper permission lagao.

`settings.py`:
```python
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {"anon": "30/min", "user": "120/min"},
}
```
Jo endpoints public hone chahiye (jaise services/gallery list), sirf unhi par
explicitly `permission_classes = [AllowAny]` rakho — baaki sab authenticated.

### 🔴 1.2 Object-level permission (apna hi data)
User sirf apni complaints/donations/requests dekhe. ViewSet me:
```python
def get_queryset(self):
    qs = super().get_queryset()
    if self.request.user.is_staff:
        return qs
    return qs.filter(user=self.request.user)
```

### 🔴 1.3 OTP kabhi response me mat bhejo (production)
SMS fail hone par bhi OTP ko JSON/response me return mat karo. `debug_otp`
jaisa koi field production me nahi hona chahiye. OTP endpoints ko throttle karo
(jaise `5/min` per phone) taaki brute-force na ho.

### 🟡 1.4 Proper token, predictable fallback nahi
Backend hamesha ek real signed token de (addon me `make_token` theek hai).
App me `session_<id>` jaisa fallback tabhi banta hai jab backend token na de —
ise avoid karo, backend se hamesha token bhejo.

### 🟡 1.5 CORS / CSRF
- `CORS_ALLOWED_ORIGINS` me sirf apne domains rakho (`*` mat karo).
- Session/cookie auth use kar rahe ho to CSRF protection on rakho.

---

## 2. Transport / server

- 🔴 HTTPS enforce (`SECURE_SSL_REDIRECT = True`), HSTS on
  (`SECURE_HSTS_SECONDS`, `...INCLUDE_SUBDOMAINS`, `...PRELOAD`).
- 🔴 `DEBUG = False` production me, `ALLOWED_HOSTS` sahi set.
- 🟡 Cookies: `SESSION_COOKIE_SECURE = True`, `CSRF_COOKIE_SECURE = True`,
  `SESSION_COOKIE_HTTPONLY = True`.
- 🟡 Login/OTP par rate limiting + brute-force lockout.
- 🟡 File uploads: type/size validate, executable files block.

---

## 3. App (React Native / Expo) — is repo me

- 🟢 Auth token **expo-secure-store** (encrypted keychain/keystore) me — plain
  storage me nahi. (`src/utils/authStorage.js`)
- 🟢 Poora app **HTTPS** base URL par (`src/constants/config.js`).
- 🟢 Token/response ka **console logging hata diya** (production logs me leak nahi).
- 🟢 401 par token clear + auto-logout (`src/api/axios.js`, `AuthContext`).
- 🟡 **Certificate pinning** (advanced): man-in-the-middle se bachne ke liye.
  Expo me `expo-build-properties` / native config se ho sakta hai.
- 🟡 Release build me console logs strip karo (babel `transform-remove-console`).
- 🟡 Sensitive screens par screenshot/masking (optional).

### Babel se production logs hatana (optional)
`babel.config.js` me production ke liye:
```js
env: {
  production: { plugins: ['transform-remove-console'] },
}
```
(`npm i -D babel-plugin-transform-remove-console`)

---

## 4. Baaki

- 🔴 Secrets (`SECRET_KEY`, SMS/API keys) code me nahi — environment variables me.
- 🟡 `pip`/`npm audit` regularly chalao, dependencies update rakho.
- 🟡 Server access logs + error monitoring (Sentry etc.) lagao.
- 🟡 Database backups + restore test.

---

### Sabse pehle kya karein (priority)
1. Backend endpoints ko authenticated karo (Section 1.1) — **sabse bada risk.**
2. Object-level permission (1.2).
3. OTP response/throttle fix (1.3).
4. `DEBUG=False` + HTTPS/HSTS + secure cookies (Section 2).

In 4 ke baad app kaafi solid ho jaayega. Baaki 🟡 items time ke saath karo.
