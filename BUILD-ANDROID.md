# Android APK kaise banayein (SBM Foundation app)

Aapka `eas.json` pehle se ready hai — usme `preview` profile APK banata hai.
Neeche 2 tarike hain. **Tarika 1 (EAS cloud)** sabse aasan hai, Windows par
bhi chalta hai, aur koi Android SDK setup nahi chahiye.

---

## Tarika 1 — EAS Cloud Build (RECOMMENDED)

Isme Expo ke server par build hota hai aur aapko ek APK download link milta hai.
Ek free Expo account chahiye (https://expo.dev par signup).

Project root (`D:\vsbm\sbmf-m-app`) me Git Bash kholo aur ye chalao:

```bash
# 1. EAS CLI install (ek baar)
npm install -g eas-cli

# 2. Apne Expo account me login
eas login

# 3. Project ko EAS se jodo — ye app.json me projectId apne aap bhar dega
eas init

# 4. APK build karo (preview profile = installable .apk)
eas build -p android --profile preview
```

Build queue me jayega (free plan). 10-20 min me terminal me ek **download link**
aayega — usse `.apk` download karke kisi bhi Android phone me install kar sakte ho
(phone me "Unknown sources / Install unknown apps" allow karna padega).

> Build ka status yahan bhi dikhta hai: https://expo.dev/accounts/[aapka-username]/projects/sbm-foundation/builds

---

## Tarika 2 — Apne computer par local build

Aapke paas Android Studio hai, to APK local bhi ban sakta hai (bina Expo account ke).
Ye emulator/phone par install ke liye theek hai.

```bash
# Ye android/ folder generate karega aur APK build karega
npx expo run:android --variant release
```

APK yahan milega:
`android/app/build/outputs/apk/release/app-release.apk`

> Note: `eas build --local` Windows par support nahi karta — isliye Windows par
> local ke liye upar wala `npx expo run:android` use karo, ya Tarika 1 (cloud).

---

## Play Store ke liye (baad me)

Play Store APK nahi, **AAB (app-bundle)** maangta hai. Uske liye:

```bash
eas build -p android --profile production
```

Ye `production` profile AAB banata hai (already `eas.json` me set hai).

---

## Zaruri baatein

- `app.json` me `android.package` = `com.sbmfoundation.app` (theek hai, isse mat badlo
  warna naya app ban jayega).
- Har nayi build se pehle `app.json` me `android.versionCode` badhana padta hai
  (1 -> 2 -> 3...) — production profile me `autoIncrement` ye apne aap karta hai.
- Auth/API sab live server (`swachhbharatmissionfoundation.com`) se chalega —
  APK me Expo Go ki zarurat nahi, ye standalone app hai.
