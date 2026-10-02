# Fix notes — "sabka data sabko dikh raha tha" + Notice dropdown

## 1. Problem kya thi

`/api/service-requests/`, `/api/citizen-notifications/` waghairah par permission
`AllowAny` hai aur app `?user=<id>` bhej kar filter maang raha tha. Agar us
ViewSet ke filterset me `user` field nahi hai to DRF us param ko **chupchaap
ignore** kar deta hai aur poori list lauta deta hai. Isi wajah se har login user
ko doosron ki bookings, address aur notifications dikh rahe the.

Yahi bug in 7 screens par tha:
Bookings, My Applications, Notifications, Donations, Job Applications,
Passes, Blood Requests, Complaints.

## 2. App-side fix (is zip me ho chuka hai)

**Naye file:**

| File | Kaam |
|---|---|
| `src/utils/owner.js` | Tay karta hai ki koi record logged-in user ka hai ya nahi (id → phone → email). Rule: *"pata nahi kiska hai" = "mera nahi hai"*. |
| `src/api/mine.js` | `listMine()` — server ko filter bhejta hai, phir jo aaya usme se sirf apne records rakhta hai. |

**Badle hue file:** `serviceApi.js`, `notificationApi.js`, `donationApi.js`,
`complaintApi.js`, `careerApi.js`, `passApi.js`, `bloodApi.js` aur unke saatoN
screens (ab `user?.id` ki jagah poora `user` object jaata hai).

`listMine()` ka behaviour:

1. User identify nahi ho paaya (logout / adhoori profile) → **khaali list**, koi
   API call bhi nahi. Pehle is case me `user=undefined` jaata tha aur *poori*
   list aa jaati thi — yahi sabse bada leak tha.
2. Server ne filter maan liya → jo aaya wahi dikhega.
3. Server ne filter ignore kiya → app khud filter karta hai, aur baaki pages
   (max 12) bhi padhta hai taaki aapke purane records page-2/3 par chhup na jaayein.
4. Record ki `user` id aapse mismatch kare to phone match hone par bhi record
   **nahi** dikhega (spoof guard).

## 3. Backend fix (ye zaroori hai — please karwa lein)

App ka guard sirf app ko theek karta hai. API abhi bhi browser/Postman se khuli
hai — koi bhi `https://<server>/api/service-requests/` khol kar sabka data dekh
sakta hai. Asli fix server par hai:

`backend_addon/ownership.py` copy karein → `core/ownership.py`, phir har private
ViewSet par `OwnedByUserMixin` laga dein aur settings me
`MobileTokenAuthentication` add kar dein. Poora step-by-step usi file ke upar
comment me likha hai.

Private karne wale ViewSets: ServiceRequest, CitizenNotification, Complaint,
Donation, JobApplication, PassApplication, BloodRequest, FamilyMember, User.
Public rehne wale: Service, ServiceCategory, NewsUpdate, GalleryImage,
WorkUpdate, BloodDonor, City, Ward.

## 4. Notice / Notification ab alag

`src/screens/notifications/NotificationsScreen.js` naya:

- **Latest Notices / सूचना** — public notices, apna alag collapsible section
  (poora section chevron se khulta-band hota hai) aur **har notice ek dropdown**
  hai: tap karo to poora matter (description / content / details) khulta hai.
  Pehle sirf "Notice" aur date dikhta tha, matter kahin nahi tha.
- **My Notifications** — sirf aapke apne notifications, unread count ke saath.
  Lambe Hindi message ab 2 line me collapse hote hain, tap par pura khulta hai
  aur saath hi read bhi ho jaata hai.

## 5. Test kaise karein

1. User A se login → 2-3 booking banayein.
2. Logout → User B se login → Bookings aur Notifications kholein.
   User A ka ek bhi record nahi dikhna chahiye.
3. Logout state me app kholein → koi list nahi aani chahiye.
4. Notifications tab → Notice card par tap → matter khulna chahiye.

---

# Round 2 — Search, Gallery, Back, Section colours

## Search
- Services screen ka search box FlatList ke header me tha; har akshar par
  remount hota tha aur keyboard band ho jaata tha. Ab list ke bahar fixed hai.
- Home ka search box ab Services list kholta hai **aur keyboard bhi**.
- Hindi naam (`name_hi`) aur category naam bhi search hote hain; har shabd
  alag match hota hai.
- "blood / khoon / pass / naukri / ambulance …" jaise shabd ab seedha us
  section ka shortcut dikhate hain.

## Gallery
- Photos: pehle sirf pehli 20 aati thin. Ab scroll ke saath saari.
- Album: tile par "+N"; kholne par saari photos swipe / thumbnail se.
- Videos: player `expo-av` par tha jo app me installed hi nahi — isliye kabhi
  nahi chalta tha. Ab `react-native-webview` (pehle se installed) me HTML5
  player. MP4 aur YouTube link dono. **Naya native build nahi chahiye.**
- Videos tab ab kholne par hi load hota hai; photo/video mix nahi hote.

## Back
- Home/Profile se kisi section me jaakar back dabane par ab wahi tab aata hai
  jahan se aaye the (`backBehavior="history"`), purane bache screens par nahi.
- Tab dabane par agar us stack me purana deep screen pada hai, to tab ka
  home screen dikhta hai.
- Header back kabhi dead-end nahi: peeche ja sake to peeche, warna Home.

## Section colours (`src/constants/sectionThemes.js`)
Blood laal · Ambulance kesariya · Auto peela · Complaint teal · Pass neela ·
Career indigo · Gallery baingani · Donation gulabi · Membership bhoora ·
Bookings slate · Notifications cyan · Services/Profile hara.
Home ki tile, us section ka header, background, buttons aur spinner — sab
ek hi rang. Naya screen jodne par `ROUTE_SECTION` me ek line jodiye.

## Backend (sbmvikash-Production)
`GalleryImageSerializer` ab `extras` (album photos) aur `extra_count` saath
bhejta hai. Purana backend ho tab bhi app `gallery-extras/` se khud le aata hai.

---

# Round 3 — Payment recorded nahi ho raha tha + Career fee

- `PaymentModal` ab band hote hi (Done / ✕ / back) server se poochta hai
  `/api/payments/status/` — server Razorpay se check karke payment record karta hai.
- GPay / PhonePe / Chrome se wapas aate hi apne aap check; paid hote hi sheet band.
- `/payment/verify/` ko ab intercept nahi karte (iOS par wo POST block ho jaata tha).
- Home: "Complete your registration" banner dikhte hi chupchaap status check —
  pehle ka bhugtan bhi mil jaata hai.
- Career: apply ke baad ₹159 joining fee (amount server se, hardcode nahi);
  My Applications me har card par "fee paid / pending" + "Pay" button;
  Job details par fee likhi hai.

---

# Round 4 — Phone se payment nahi ho raha tha (website se ho raha tha)

**Root cause (React Native source se verify kiya):** Razorpay app me GPay/PhonePe
ke liye `intent://pay?…#Intent;scheme=upi;package=…;end` link deta hai. Chrome
ye samajhta hai (isliye website par chalta tha), par RN ka `Linking.openURL`
use `Intent(ACTION_VIEW, "intent://…")` bana deta hai → koi app handle nahi
karta → error → purana code error ignore karta tha. Nateeja: app me GPay dabane
par kuch nahi hota tha, donation "Pending" me atka rehta tha, UPI ref khaali.

**Fix:** `src/utils/upiLinks.js` intent link ko asli `upi://pay?…` me badalta hai.
`PaymentModal` ab: upi:// kholta hai → wo app na ho to generic UPI chooser →
Razorpay ka fallback page → aur aakhir me user ko saaf message (UPI ID / Card
/ browser). Kabhi chupchaap fail nahi.

Donation / booking screens sheet band hote hi hamesha server se asli status lete hain.

**Ye ek naya app build (APK/AAB) maangta hai** — purane installed app me ye fix nahi aayega.

---

# Round 5 — App purane backend ke saath bhi chale

Backend abhi redeploy nahi ho sakta, isliye app dono ke saath kaam karta hai:
- `/api/payments/status/` aur `/api/payments/fees/` na milen (Django HTML 404) to
  app ek hi baar me samajh jaata hai, dobara call nahi karta, spinner nahi atakta.
- Payment ke baad screens apna record khud dobara padhti hain
  (user.payment_status / application.payment_status / donation.status).
- Fee amount pata na ho to bhi fee collect hoti hai; app galat number nahi
  dikhata — Razorpay page asli amount dikhata hai.
