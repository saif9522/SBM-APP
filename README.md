# Swachh Bharat Mission Foundation — Mobile App (Expo / React Native)

A native mobile client for the existing Django backend at
`https://swachhbharatmissionfoundation.com`. This is a real React Native app —
**not** a WebView. All screens talk to the backend's real REST API; nothing uses
fake data, fake auth, or fake payments.

---

## Features

- **Auth** — phone + password or OTP login, registration with OTP, forgot/reset
  password, change password. Tokens stored encrypted (SecureStore).
- **Home** — dashboard: quick services, popular services, live notices, gallery strip.
- **Services** — searchable catalogue with category filter, details, apply (photo
  upload), My Applications.
- **Auto & Ambulance** — book category services with live location; ambulance has
  a one-tap emergency call.
- **Bookings** — all service requests with status tracking + details.
- **Blood** — donor search by group, donor call, become a donor, raise/track requests.
- **Complaints** — file with category, location + GPS, photo; track status.
- **Pass** — apply for bus/auto pass; digital pass card with QR code.
- **Donation** — donate via the real Razorpay gateway; donation history.
- **Membership** — membership-category services.
- **Gallery** — photos grid + video player.
- **Careers** — open positions, full application with resume/Aadhaar upload.
- **Notifications** — in-app list with read / read-all.
- **Profile & Settings** — edit profile, contact us, about, privacy, preferences.

---

## Install & run

Expo Go runs the latest SDK, so let the CLI align native package versions:

```bash
cd sbm-foundation
npm install
npx expo install --fix     # aligns native modules to your installed SDK
npx expo start
```

Scan the QR with Expo Go, or press `a` (Android) / `i` (iOS).

---

## Backend setup (one-time, required for auth)

The REST API is open CRUD but has **no token/login endpoint**, so a small
additive file enables clean mobile auth. See `backend_addon/INSTALL.md`:

1. Copy `backend_addon/auth_api.py` -> your Django app at `core/auth_api.py`.
2. Add one line to `core/api_urls.py`: `path('auth/', include('core.auth_api'))`.
3. Restart the server.

No migration is needed (tokens are signed with your `SECRET_KEY`). This exposes
`/api/auth/login`, `register`, `login/send-otp`, `verify-otp`, `me`, and
`change-password`. Password reset already works against the site's existing JSON
endpoints without any change.

---

## Configuration

All configuration lives in **`src/constants/config.js`**:

```js
export const SITE_BASE_URL = 'https://swachhbharatmissionfoundation.com';
export const API_BASE_URL  = `${SITE_BASE_URL}/api`;
export const EMERGENCY_PHONE = '108';  // override with your helpline
```

No secrets are hardcoded. Auth tokens live only in `expo-secure-store`.

---

## API integration

- **REST API (`/api/`)** — auto-generated DRF CRUD. Session auth + `AllowAny`,
  PageNumberPagination (`{count, next, previous, results}`), `?search=`,
  `?ordering=`, field filters. Wrapped by `src/api/*.js`.
- **Auth** — `src/api/authApi.js` (token endpoints + password reset).
- **Payments** — donations open the real Razorpay page `/pay/donation/<id>/` via
  `expo-linking`; the backend verifies server-side and the app refetches to
  confirm. Never simulated.

---

## Folder structure

```
App.js                 entry - providers + ErrorBoundary + navigation
app.json / eas.json    Expo + build config
assets/                icon, splash, adaptive icon, favicon
backend_addon/         auth_api.py + INSTALL.md (drop into Django)
src/
  api/                 axios instance + one module per backend resource
  components/          reusable UI (Button, Input, Card, ChipGroup, QrView,
                       FilePicker, ConfirmDialog, ErrorBoundary, ...)
  constants/           config, theme tokens, real endpoint map
  context/             AuthContext (global auth state)
  hooks/               useApi, useOnboarding
  navigation/          Root / Auth / MainTabs / Services / Bookings / Profile
  screens/             one folder per module
  utils/               authStorage, format, apiHelpers, upload, location, prefs
  validation/          validators
```

---

## Android build

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview      # APK for testing
eas build -p android --profile production    # AAB for Play Store
```

## iOS build

```bash
eas build -p ios --profile production
```

Set `extra.eas.projectId` in `app.json` after `eas build:configure`.

---

## Payments & QR

- **Donations** create a `Donation`, open the Razorpay checkout, then refetch to
  reflect verified status. No fake payments.
- **Pass QR** uses `react-native-qrcode-svg`; if not installed, the pass screen
  shows the code as text instead of crashing:
  `npx expo install react-native-svg && npm install react-native-qrcode-svg`

---

## Assets

`assets/` ships with generated brand placeholders (green SBM mark). Replace with
final artwork before publishing: `icon.png` (1024x1024), `adaptive-icon.png`
(1024x1024 foreground within the safe zone), `splash.png` (centered logo on white).

---

## Notes / honest limitations

- **Auth** requires the `backend_addon` file (the REST API issues no token by
  itself). Two minutes, no migration.
- **Fares** for auto/ambulance are the service price (no distance-based fare on
  the backend).
- **Push notifications** aren't integrated (no device push-token field on the
  backend); the in-app notification list uses the real API.
- **Terms & Conditions** isn't linked because the site has no such page (only
  About, Privacy Policy, Contact exist).

---

## Troubleshooting

- Version mismatch warnings -> `npx expo install --fix`
- Metro cache issues -> `npx expo start -c`
- SecureStore errors on web -> SecureStore is native-only; use a device/emulator
- Requests fail on device -> confirm `API_BASE_URL` is reachable over HTTPS
