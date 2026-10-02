/**
 * SECTION THEMES — har section ki apni pehchaan.
 *
 * Pehle poora app ek hi hare rang me tha, isliye Blood ke andar ho ya Pass
 * ke andar, pata hi nahi chalta tha ki kahan hain. Ab har section ka apna
 * rang hai, aur wahi rang teen jagah dikhta hai:
 *
 *   1. Home par us section ki Quick Service tile
 *   2. Us section ke har screen ka header gradient
 *   3. Us section ke screens ka halka background + buttons + spinner
 *
 * Isse user Blood tile (laal) dabata hai to agla screen bhi laal hota hai —
 * turant samajh aata hai ki "main Blood section me hoon".
 *
 * Rang jaan-boojh kar alag hue (hue) chune gaye hain taaki do section
 * kabhi ek jaise na lagen:
 *   laal · kesariya · peela · hara · teal · neela · indigo · baingani ·
 *   gulabi · bhoora · slate · cyan
 *
 * Kesariya (saffron) sirf Ambulance ke liye hai — theme.js ke niyam ke
 * mutabik wo rang sirf emergency ke liye reserved hai.
 */

const make = (key, label, icon, [g1, g2, g3], tint, [s1, s2], chip) => ({
  key,
  label,
  icon,
  grad: [g1, g2, g3],   // header gradient (light → dark)
  tint,                 // buttons, active tabs, spinners, icons
  soft: [s1, s2],       // page background gradient (very light)
  chip,                 // tinted surface for tiles / selected chips
});

export const SECTION_THEMES = {
  home:          make('home', 'Home', 'home',
                   ['#1BA80C', '#138808', '#0B5E04'], '#138808', ['#F4FAF3', '#E3F0E1'], '#E7F4E6'),
  services:      make('services', 'Services', 'grid',
                   ['#1BA80C', '#138808', '#0B5E04'], '#138808', ['#F4FAF3', '#E3F0E1'], '#E7F4E6'),
  blood:         make('blood', 'Blood', 'water',
                   ['#EF4444', '#D32F2F', '#991B1B'], '#D32F2F', ['#FFF6F6', '#FDE4E4'], '#FDE8E8'),
  ambulance:     make('ambulance', 'Ambulance', 'medkit',
                   ['#FF8A1F', '#FF6B00', '#C2410C'], '#E85D00', ['#FFF8F2', '#FFE9D6'], '#FFEEDD'),
  auto:          make('auto', 'Auto', 'car',
                   ['#F5B301', '#D99A00', '#8A5A00'], '#B77F00', ['#FFFCF2', '#FCF1CF'], '#FDF3D2'),
  complaint:     make('complaint', 'Complaint', 'megaphone',
                   ['#14B8A6', '#0F766E', '#134E4A'], '#0F766E', ['#F2FBFA', '#D8F2EE'], '#DDF4F0'),
  pass:          make('pass', 'Pass', 'card',
                   ['#3B82F6', '#1D4ED8', '#1E3A8A'], '#1D4ED8', ['#F4F8FF', '#E0EAFF'], '#E3ECFF'),
  career:        make('career', 'Career', 'briefcase',
                   ['#6366F1', '#4338CA', '#312E81'], '#4338CA', ['#F6F6FF', '#E5E5FC'], '#E7E7FD'),
  gallery:       make('gallery', 'Gallery', 'images',
                   ['#A855F7', '#7E22CE', '#581C87'], '#7E22CE', ['#FAF5FF', '#EEE2FB'], '#F1E6FC'),
  donation:      make('donation', 'Donation', 'heart',
                   ['#EC4899', '#DB2777', '#9D174D'], '#DB2777', ['#FFF5FA', '#FCE3F0'], '#FCE7F3'),
  membership:    make('membership', 'Membership', 'ribbon',
                   ['#A1887F', '#795548', '#4E342E'], '#795548', ['#FBF8F6', '#EFE6E1'], '#F1E9E4'),
  bookings:      make('bookings', 'Bookings', 'briefcase',
                   ['#78909C', '#546E7A', '#37474F'], '#546E7A', ['#F6F8F9', '#E3E9EC'], '#E6ECEF'),
  notifications: make('notifications', 'Notifications', 'notifications',
                   ['#22B8D6', '#0891B2', '#155E75'], '#0891B2', ['#F2FBFD', '#D9F1F7'], '#DDF3F8'),
  profile:       make('profile', 'Profile', 'person',
                   ['#1BA80C', '#138808', '#0B5E04'], '#138808', ['#F4FAF3', '#E3F0E1'], '#E7F4E6'),
};

export const DEFAULT_THEME = SECTION_THEMES.services;

/**
 * Screen (route) ka naam → section.
 * Naya screen jodte waqt bas yahan ek line jodiye; header, background aur
 * buttons apne aap sahi rang le lenge.
 */
const ROUTE_SECTION = {
  // Blood
  BloodHome: 'blood', BloodDonors: 'blood', DonorDetails: 'blood', BecomeDonor: 'blood',
  CreateBloodRequest: 'blood', BloodRequestSuccess: 'blood', MyBloodRequests: 'blood',
  // Ambulance / Auto
  AmbulanceHome: 'ambulance', AmbulanceBooking: 'ambulance',
  AutoHome: 'auto', AutoBooking: 'auto',
  // Complaint
  ComplaintHome: 'complaint', NewComplaint: 'complaint', ComplaintSuccess: 'complaint',
  MyComplaints: 'complaint', ComplaintDetails: 'complaint',
  // Pass
  PassHome: 'pass', ApplyPass: 'pass', PassSuccess: 'pass', MyPasses: 'pass', PassDetails: 'pass',
  // Career
  CareerHome: 'career', JobDetails: 'career', ApplyJob: 'career', MyJobApplications: 'career',
  // Gallery
  Gallery: 'gallery', PhotoDetails: 'gallery', VideoPlayer: 'gallery',
  // Donation
  DonationHome: 'donation', DonationForm: 'donation', DonationPayment: 'donation',
  DonationHistory: 'donation',
  // Membership
  MembershipHome: 'membership',
  // Bookings tab
  BookingsHome: 'bookings', BookingDetails: 'bookings', BookingSuccess: 'bookings',
  // Notifications tab
  Notifications: 'notifications',
  // Profile tab
  ProfileHome: 'profile', EditProfile: 'profile', Settings: 'profile', About: 'profile',
  ContactUs: 'profile', ChangePassword: 'profile', PrivacyPolicy: 'profile',
  // Services (catalogue)
  ServicesHome: 'services', ServiceDetails: 'services', ServiceApplication: 'services',
  ApplicationSuccess: 'services', MyApplications: 'services',
  Home: 'home',
};

export function themeForRoute(routeName) {
  const key = ROUTE_SECTION[routeName];
  return (key && SECTION_THEMES[key]) || DEFAULT_THEME;
}

export function themeFor(sectionKey) {
  return SECTION_THEMES[sectionKey] || DEFAULT_THEME;
}

/** '#RRGGBB' + alpha (0-1) → '#RRGGBBAA'. Tiles ke halke background ke liye. */
export function withAlpha(hex, alpha) {
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16).padStart(2, '0');
  return `${hex}${a}`;
}

export default SECTION_THEMES;
