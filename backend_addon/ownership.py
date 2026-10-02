"""
core/ownership.py  —  "har user ko sirf apna data" ka ASLI fix (server side).

Problem
-------
Abhi REST API ke saare ViewSets `AllowAny` hain aur `?user=<id>` sirf tab kaam
karta hai jab us ViewSet ke filterset me `user` field ho. Agar na ho, DRF us
query param ko chupchaap ignore kar deta hai aur POORI list bhej deta hai —
yaani koi bhi banda `/api/service-requests/` khol kar sabki bookings, address
aur phone number dekh sakta hai. Mobile app me guard laga diya gaya hai, par
API abhi bhi browser/Postman se khuli hai. Asli fix yahi file hai.

Install (2 steps, koi migration nahi)
------------------------------------
1) Ye file `core/ownership.py` par copy karein.

2) `core/views.py` (jahan ViewSets hain) me:

       from .ownership import OwnedByUserMixin, MobileTokenAuthentication

   ...aur har "private" ViewSet ko mixin de dein, e.g.:

       class ServiceRequestViewSet(OwnedByUserMixin, viewsets.ModelViewSet):
           queryset = ServiceRequest.objects.all()
           serializer_class = ServiceRequestSerializer
           owner_field = "user"           # default hi "user" hai

       class CitizenNotificationViewSet(OwnedByUserMixin, viewsets.ModelViewSet):
           ...

       class DonationViewSet(OwnedByUserMixin, viewsets.ModelViewSet):
           owner_field = "user"
           owner_phone_field = "phone"    # jahan user FK nullable hai

   Ye ViewSets private hone chahiye:
       ServiceRequest, CitizenNotification, Complaint, Donation,
       JobApplication, PassApplication, BloodRequest, FamilyMember, User

   Ye public rehne chahiye (mat chhuein):
       Service, ServiceCategory, NewsUpdate, GalleryImage, WorkUpdate,
       BloodDonor (search), City, Ward

3) `settings.py` ke REST_FRAMEWORK me authentication class add karein taaki
   `request.user` mobile token se bhi bhare:

       REST_FRAMEWORK = {
           ...
           "DEFAULT_AUTHENTICATION_CLASSES": [
               "core.ownership.MobileTokenAuthentication",
               "rest_framework.authentication.SessionAuthentication",
           ],
       }
"""

from rest_framework import authentication, exceptions

try:  # auth_api.py me jo signed-token helper already hai, wahi reuse karte hain
    from .auth_api import user_from_token
except ImportError:  # pragma: no cover
    user_from_token = None


class MobileTokenAuthentication(authentication.BaseAuthentication):
    """`Authorization: Bearer <signed-token>` ko request.user me badalta hai."""

    keywords = ("bearer", "token")

    def authenticate(self, request):
        header = request.META.get("HTTP_AUTHORIZATION", "") or ""
        if not header:
            return None
        parts = header.split(" ", 1)
        raw = parts[1].strip() if len(parts) == 2 and parts[0].lower() in self.keywords else header.strip()
        if not raw or user_from_token is None:
            return None
        user = user_from_token(raw)
        if user is None:
            raise exceptions.AuthenticationFailed("Invalid or expired token.")
        # Custom User model DRF ke liye authenticated dikhna chahiye:
        user.is_authenticated = True
        return (user, raw)


class OwnedByUserMixin:
    """
    ViewSet ka queryset hamesha logged-in user tak seemit kar deta hai.

    - Anonymous  -> khaali queryset (401 dena ho to `require_auth = True`)
    - Staff/admin-> poori list (dashboard ke liye)
    - Warna      -> owner_field == request.user
    - create()   -> owner_field automatically request.user set ho jaata hai,
                    taaki koi dusre ki id bhej kar record na bana sake.
    """

    owner_field = "user"
    owner_phone_field = None      # e.g. "phone" jahan user FK nullable hai
    allow_staff_all = True
    require_auth = False

    def _current_user(self):
        user = getattr(self.request, "user", None)
        if user is None or not getattr(user, "is_authenticated", False):
            return None
        return user

    def get_queryset(self):
        qs = super().get_queryset()
        user = self._current_user()

        if user is None:
            if self.require_auth:
                raise exceptions.NotAuthenticated("Login required.")
            return qs.none()

        if self.allow_staff_all and (getattr(user, "is_staff", False) or getattr(user, "is_superuser", False)):
            return qs

        qs = qs.filter(**{self.owner_field: user})

        # user FK nullable hai to phone se bhi apne records jodo
        if self.owner_phone_field and getattr(user, "phone", None):
            from django.db.models import Q
            base = super().get_queryset()
            qs = base.filter(
                Q(**{self.owner_field: user}) | Q(**{self.owner_phone_field: user.phone})
            )
        return qs

    def perform_create(self, serializer):
        user = self._current_user()
        if user is not None:
            serializer.save(**{self.owner_field: user})
        else:
            serializer.save()
