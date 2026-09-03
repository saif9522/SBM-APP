/**
 * Central app configuration. Nothing environment-specific should be
 * hardcoded anywhere else in the codebase — import from here.
 */

// Root of the live Django site (HTML auth routes + /media live here).
export const SITE_BASE_URL = 'https://swachhbharatmissionfoundation.com';

// REST API root (auto-generated DRF CRUD lives under here).
export const API_BASE_URL = `${SITE_BASE_URL}/api`;

// Where uploaded files (ImageField/FileField) are served from.
export const MEDIA_BASE_URL = SITE_BASE_URL; // media paths already start with /media/

// Network
export const REQUEST_TIMEOUT_MS = 20000;

// DRF PageNumberPagination page size (matches backend settings PAGE_SIZE).
export const PAGE_SIZE = 20;


// Emergency dial number for the Ambulance screen. Defaults to India's public
// ambulance service (108). Override with the Foundation's own helpline if you
// have one.
export const EMERGENCY_PHONE = '108';


// Razorpay checkout is a hosted web page on the Django site. The app creates
// the record via the API, then opens this URL so the user pays on the real
// gateway (never faked). kind is one of: donation | service | membership | career.
export const paymentUrl = (kind, id) => `${SITE_BASE_URL}/pay/${kind}/${id}/`;


export const APP_VERSION = '1.0.0';

// Real static pages on the website (opened via Linking).
export const WEB_PAGES = {
  about: `${SITE_BASE_URL}/about/`,
  privacy: `${SITE_BASE_URL}/privacy-policy/`,
  contact: `${SITE_BASE_URL}/contact/`,
};

export const APP_NAME = 'Swachh Bharat Mission Foundation';
export const APP_SHORT_NAME = 'SBM Foundation';

export default {
  SITE_BASE_URL,
  API_BASE_URL,
  MEDIA_BASE_URL,
  REQUEST_TIMEOUT_MS,
  PAGE_SIZE,
  APP_NAME,
  APP_SHORT_NAME,
  EMERGENCY_PHONE,
  paymentUrl,
  APP_VERSION,
  WEB_PAGES,
};
