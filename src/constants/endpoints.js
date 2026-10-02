/**
 * REAL backend endpoints — transcribed directly from the Django project
 * (core/api_urls.py, core/urls.py, core/views.py). Nothing here is invented.
 *
 * ── Two very different surfaces exist on this backend ─────────────────────
 *
 * 1) REST API  (base: /api/)  — drf ModelViewSet CRUD for every model.
 *    - Auth:    SessionAuthentication only
 *    - Perms:   AllowAny  (every endpoint is open)
 *    - Paging:  PageNumberPagination -> { count, next, previous, results }
 *    - Query:   ?search=, ?ordering=, and DjangoFilter field lookups
 *    - Each resource: LIST/CREATE at `/<name>/`, DETAIL at `/<name>/<id>/`
 *
 * 2) HTML / session routes (base: site root) — the website's own login,
 *    register and OTP flow. These render HTML and use session cookies + CSRF.
 *    Only forgot-password endpoints return JSON. See AUTH_ROUTES below and
 *    the note in src/api/authApi.js.
 *
 * IMPORTANT: there is NO token/JWT endpoint and NO login/register REST API.
 * Auth strategy is a decision documented in authApi.js.
 */

// ── REST API resources (relative to API_BASE_URL) ────────────────────────
export const API = {
  cities: 'cities/',
  wards: 'wards/',

  users: 'users/',
  admins: 'admins/',
  employees: 'employees/',
  agents: 'agents/',
  familyMembers: 'family-members/',

  complaints: 'complaints/',
  donations: 'donations/',

  serviceCategories: 'service-categories/',
  services: 'services/',
  serviceRequests: 'service-requests/',

  galleryImages: 'gallery-images/',
  galleryExtras: 'gallery-extras/',

  contactMessages: 'contact-messages/',
  workUpdates: 'work-updates/',
  newsUpdates: 'news-updates/',
  newsCutouts: 'news-cutouts/',
  activityLogs: 'activity-logs/',

  jobApplications: 'job-applications/',
  jobApplicationUpdates: 'job-application-updates/',

  bloodDonors: 'blood-donors/',
  bloodRequests: 'blood-requests/',
  bloodRequestUpdates: 'blood-request-updates/',

  citizenNotifications: 'citizen-notifications/',
  passApplications: 'pass-applications/',

  // employee/agent HR resources (not used by the citizen app, listed for completeness)
  attendances: 'attendances/',
  leaveRequests: 'leave-requests/',
  salaryRecords: 'salary-records/',
  employeeDocuments: 'employee-documents/',
  resignations: 'resignations/',
  employeeNotifications: 'employee-notifications/',
  paymentCategories: 'payment-categories/',
  agentPayments: 'agent-payments/',
  taskAssignments: 'task-assignments/',
  cityBodyConfigs: 'city-body-configs/',
};

// Build a detail path: detail(API.services, 12) -> 'services/12/'
export const detail = (resource, id) => `${resource}${id}/`;

// ── REST auth routes (relative to API_BASE_URL, i.e. under /api/auth/) ─────
// These are the REAL JSON endpoints confirmed from the live backend URLconf.
// They are called through the shared `api` axios instance (baseURL = /api/).
export const AUTH_ROUTES = {
  register: 'auth/register/',                    // {name, phone, email, address, ward_no, password} -> sends OTP
  registerVerify: 'auth/register/verify-otp/',   // {phone, otp} -> {token, user}
  registerResend: 'auth/register/resend-otp/',   // {phone}
  login: 'auth/login/',                          // {phone, password} -> {token, user}  (citizen)
  agentLogin: 'auth/agent/login/',               // {identifier, password} -> {token, user}   (agent)
  employeeLogin: 'auth/employee/login/',         // {identifier, password} -> {token, user} (employee)
  forgotSendOtp: 'auth/forgot-password/send-otp/', // {phone}
  forgotReset: 'auth/forgot-password/reset/',      // {phone, otp, new_password}
  logout: 'auth/logout/',
  me: 'auth/me/',                                // Bearer -> user (role-aware)
  changePassword: 'auth/change-password/',       // {old_password, new_password}
};

// Known backend choice values (kept in sync with core/models.py) so the UI
// never hardcodes strings that must match the API.
export const CHOICES = {
  // Account types shown on the Register screen. "user" = normal citizen,
  // "agent" = field/partner agent, "employee" = staff. The value is sent to
  // the backend as `role`/`user_type` so the account is created correctly.
  userRoles: [
    { label: 'User', value: 'user', icon: 'person-outline', color: '#0047AB', hint: 'Citizen using civic services' },
    { label: 'Agent', value: 'agent', icon: 'briefcase-outline', color: '#138808', hint: 'Field / partner agent' },
    { label: 'Employee', value: 'employee', icon: 'id-card-outline', color: '#7C3AED', hint: 'Foundation staff member' },
  ],

  complaintStatus: ['pending', 'processing', 'resolved'],
  serviceRequestStatus: ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'],
  donationStatus: ['pending', 'verified', 'failed'],
  bloodRequestStatus: ['pending', 'approved', 'completed', 'rejected'],
  passStatus: ['applied', 'approved', 'rejected', 'expired'],
  bloodGroups: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  passType: [{ label: 'Bus Pass', value: 'bus' }, { label: 'Auto Pass', value: 'auto' }],
  passCategory: [
    { label: 'Women', value: 'women' },
    { label: 'Student', value: 'student' },
    { label: 'Senior Citizen', value: 'senior' },
    { label: 'Employee', value: 'employee' },
  ],
  passDuration: [{ label: 'Monthly', value: 'monthly' }, { label: 'Yearly', value: 'yearly' }],
};

export default { API, AUTH_ROUTES, CHOICES, detail };
