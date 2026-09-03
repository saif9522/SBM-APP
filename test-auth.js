/**
 * Quick auth diagnostic — talks to the LIVE server and prints exactly what
 * comes back. Run:   node test-auth.js
 * (Node 18+ has fetch built in.)
 */
const BASE = 'https://swachhbharatmissionfoundation.com/api';

// A test mobile number (change if you like). 10 digits, starts 6-9.
const TEST_PHONE = '9000000001';
const TEST_PASSWORD = 'test1234';

async function hit(label, path, body) {
  const url = `${BASE}${path}`;
  process.stdout.write(`\n▶ ${label}\n  POST ${url}\n  body: ${JSON.stringify(body)}\n`);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = null; }
    console.log(`  → status: ${res.status} ${res.statusText}`);
    console.log(`  → content-type: ${res.headers.get('content-type')}`);
    if (parsed) console.log('  → JSON:', JSON.stringify(parsed, null, 2).replace(/\n/g, '\n     '));
    else console.log('  → RAW (first 300 chars):', text.slice(0, 300).replace(/\s+/g, ' '));
    return { status: res.status, parsed, text };
  } catch (e) {
    console.log('  ✖ NETWORK ERROR:', e.message);
    return { error: e.message };
  }
}

(async () => {
  console.log('=== SBM auth live test ===');
  console.log('Server:', BASE);

  // 1) Register (sends OTP if the endpoint works)
  await hit('REGISTER', '/auth/register/', {
    name: 'Test User', phone: TEST_PHONE, password: TEST_PASSWORD, email: 'test@example.com',
  });

  // 2) Ask for a login OTP (works if the user exists)
  await hit('LOGIN / SEND OTP', '/auth/login/send-otp/', { phone: TEST_PHONE });

  // 3) Try password login
  await hit('PASSWORD LOGIN', '/auth/login/', { phone: TEST_PHONE, password: TEST_PASSWORD });

  console.log('\n=== done ===');
  console.log('What the results mean:');
  console.log(' • JSON with {status:"success"...} or {token,...} → endpoint WORKS. If OTP never');
  console.log('   arrives by SMS, the server SMS gateway is off (verify OTP from Django admin instead).');
  console.log(' • RAW html / status 404 → the auth file is not deployed on THIS server.');
  console.log(' • status 500 → server error inside auth_api.py (paste the output to me).');
  console.log(' • NETWORK ERROR → server unreachable / wrong URL.');
})();
