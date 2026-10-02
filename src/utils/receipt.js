import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { currency, formatDate } from './format';

/**
 * Builds a nice HTML bill for a paid service request and lets the user
 * save / share it as a PDF. Fully in-app (no backend session needed).
 */
export async function downloadServiceBill(req, serviceName) {
  try {
    const name = serviceName || req?.service_name || 'Service';
    const html = `
      <html><head><meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        * { font-family: -apple-system, Roboto, Arial, sans-serif; }
        body { padding: 28px; color: #1a1a1a; }
        .head { text-align:center; border-bottom: 3px solid #138808; padding-bottom: 14px; }
        .org { font-size: 20px; font-weight: 800; color: #138808; }
        .sub { font-size: 12px; color: #555; margin-top: 3px; }
        .title { text-align:center; font-size: 15px; font-weight:700; letter-spacing:1px; margin: 20px 0 4px; }
        .paid { display:inline-block; background:#e6f4ea; color:#138808; font-weight:700;
                padding:4px 12px; border-radius: 20px; font-size: 12px; }
        table { width:100%; border-collapse: collapse; margin-top: 18px; }
        td { padding: 9px 4px; font-size: 13px; border-bottom: 1px solid #eee; }
        td.k { color:#666; } td.v { text-align:right; font-weight:600; }
        .total td { border-top: 2px solid #138808; border-bottom:none; font-size: 16px; font-weight:800; color:#138808; padding-top: 12px; }
        .foot { margin-top: 28px; text-align:center; font-size: 11px; color:#888; line-height:1.6; }
      </style></head>
      <body>
        <div class="head">
          <div class="org">Swachh Bharat Mission Foundation</div>
          <div class="sub">Garhwa, Jharkhand – 822114 · +91 94312 52735</div>
          <div class="sub">swachhbharatmissionfoundation.com</div>
        </div>
        <div class="title">PAYMENT RECEIPT</div>
        <div style="text-align:center;"><span class="paid">● PAID</span></div>
        <table>
          <tr><td class="k">Receipt No.</td><td class="v">${req?.request_no || ('#' + (req?.id || ''))}</td></tr>
          <tr><td class="k">Service</td><td class="v">${name}</td></tr>
          <tr><td class="k">Quantity</td><td class="v">${req?.quantity || 1}</td></tr>
          <tr><td class="k">Date</td><td class="v">${formatDate(req?.created_at) || '-'}</td></tr>
          <tr><td class="k">Payment Ref</td><td class="v">${req?.payment_ref || '-'}</td></tr>
          <tr><td class="k">Address</td><td class="v">${(req?.address || '-').replace(/</g, '')}</td></tr>
          <tr class="total"><td class="k">Total Paid</td><td class="v">${currency(req?.total_price)}</td></tr>
        </table>
        <div class="foot">
          This is a system-generated receipt from the Swachh Bharat Mission Foundation app.<br/>
          Thank you for your contribution towards a cleaner, greener community.
        </div>
      </body></html>`;

    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Save / share your bill', UTI: 'com.adobe.pdf' });
    } else {
      Alert.alert('Bill ready', `Saved to: ${uri}`);
    }
  } catch (e) {
    Alert.alert('Could not generate bill', 'Please try again.');
  }
}
