/**
 * OWNERSHIP GUARD
 * ───────────────────────────────────────────────────────────────────────────
 * Backend ke REST endpoints AllowAny hain aur unme se kai `?user=<id>` jaisa
 * filter support nahi karte. Aisi soorat me DRF un unknown query params ko
 * chupchaap ignore kar deta hai aur POORI list return kar deta hai — yaani
 * har user ko dusron ki bookings / notifications dikhne lagti hain.
 *
 * Ye module ek last-line-of-defence hai: server jo bhi bheje, app sirf wahi
 * records dikhayega jo PROVE ho sakein ki logged-in user ke hain.
 *
 * Rule: "pata nahi kiska hai" == "mera nahi hai" (privacy > convenience).
 */

// Record me user/owner ki id in fields me ho sakti hai.
const OWNER_ID_FIELDS = [
  'user', 'user_id', 'userId',
  'citizen', 'citizen_id',
  'created_by', 'created_by_id', 'createdBy',
  'applicant', 'applicant_id',
  'requested_by', 'requested_by_id',
  'owner', 'owner_id',
  'donor', 'donor_id',
  'customer', 'customer_id',
  'account', 'account_id',
  'profile', 'profile_id',
];

// Jahan user FK nahi hai (jaise donations / pass applications), wahan phone se match.
const OWNER_PHONE_FIELDS = [
  'phone', 'phone_no', 'phone_number', 'phoneNumber',
  'mobile', 'mobile_no', 'mobile_number',
  'contact', 'contact_no', 'contact_number',
  'user_phone', 'donor_phone', 'applicant_phone', 'whatsapp',
];

const OWNER_EMAIL_FIELDS = ['email', 'user_email', 'applicant_email', 'donor_email'];

/** Sirf digits rakho aur India ka +91 / 0 prefix hata do -> 10 digit. */
export function normalizePhone(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length > 10) return digits.slice(-10);
  return digits;
}

const asId = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    return asId(value.id ?? value.pk ?? value.user_id ?? value.uuid ?? '');
  }
  const s = String(value).trim();
  return s && s !== 'null' && s !== 'undefined' ? s : '';
};

/** Logged-in user ki saari pehchaan (ids, phones, emails) ek jagah. */
export function identityOf(user) {
  const ids = new Set();
  const phones = new Set();
  const emails = new Set();

  if (user && typeof user === 'object') {
    [user.id, user.pk, user.user_id, user.userId, user.uuid].forEach((v) => {
      const id = asId(v);
      if (id) ids.add(id);
    });
    [user.phone, user.mobile, user.mobile_no, user.phone_number, user.contact]
      .forEach((v) => {
        const p = normalizePhone(v);
        if (p.length === 10) phones.add(p);
      });
    [user.email].forEach((v) => {
      const e = String(v ?? '').trim().toLowerCase();
      if (e.includes('@')) emails.add(e);
    });
  }

  return { ids, phones, emails };
}

/** Kya hum user ko identify kar paa rahe hain? Nahi -> kuch bhi mat dikhao. */
export function hasIdentity(user) {
  const { ids, phones, emails } = identityOf(user);
  return ids.size > 0 || phones.size > 0 || emails.size > 0;
}

/** Record me se owner id nikaalo (agar serializer ne bheji ho). */
function recordOwnerId(record) {
  for (const field of OWNER_ID_FIELDS) {
    if (record && Object.prototype.hasOwnProperty.call(record, field)) {
      const id = asId(record[field]);
      if (id) return id;
    }
  }
  return '';
}

function recordPhones(record) {
  const out = [];
  for (const field of OWNER_PHONE_FIELDS) {
    const p = normalizePhone(record?.[field]);
    if (p.length === 10) out.push(p);
  }
  // nested user object ka phone bhi
  const nested = record?.user;
  if (nested && typeof nested === 'object') {
    const p = normalizePhone(nested.phone || nested.mobile);
    if (p.length === 10) out.push(p);
  }
  return out;
}

function recordEmails(record) {
  const out = [];
  for (const field of OWNER_EMAIL_FIELDS) {
    const e = String(record?.[field] ?? '').trim().toLowerCase();
    if (e.includes('@')) out.push(e);
  }
  const nested = record?.user;
  if (nested && typeof nested === 'object' && nested.email) {
    out.push(String(nested.email).trim().toLowerCase());
  }
  return out;
}

/**
 * Kya ye record logged-in user ka hai?
 * - id match  -> haan
 * - id mismatch -> NAHI (chahe phone match ho jaaye)
 * - id hi nahi -> phone / email se try, warna NAHI
 */
export function ownsRecord(record, user) {
  if (!record || typeof record !== 'object') return false;
  const { ids, phones, emails } = identityOf(user);
  if (!ids.size && !phones.size && !emails.size) return false;

  const ownerId = recordOwnerId(record);
  if (ownerId) return ids.has(ownerId);

  if (phones.size) {
    const rp = recordPhones(record);
    if (rp.some((p) => phones.has(p))) return true;
  }
  if (emails.size) {
    const re = recordEmails(record);
    if (re.some((e) => emails.has(e))) return true;
  }
  return false;
}

/** List me se sirf apne records. */
export function filterMine(items = [], user) {
  return (Array.isArray(items) ? items : []).filter((r) => ownsRecord(r, user));
}

export default { identityOf, hasIdentity, ownsRecord, filterMine, normalizePhone };
