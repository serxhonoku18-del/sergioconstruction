// Vercel serverless function: receives form submissions and emails them to you.
// Triggered when the contact form on the homepage POSTs to /api/contact.
//
// Required environment variables (set in Vercel Dashboard → Settings → Environment Variables):
//   RESEND_API_KEY     — from https://resend.com/api-keys
//   LEAD_INBOX_EMAIL   — your inbox, e.g. sergioconstructionshpk@gmail.com
//   FROM_EMAIL         — must use a verified domain on Resend.
//                        Until you verify sergioconstruction.al on Resend,
//                        leave this unset and emails will use onboarding@resend.dev.

import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const inbox  = process.env.LEAD_INBOX_EMAIL;
  const from   = process.env.FROM_EMAIL || 'Sergio Leads <onboarding@resend.dev>';

  // If Resend isn't configured yet, succeed silently — WhatsApp is the
  // primary channel; we don't want a half-configured site to block leads.
  if (!apiKey || !inbox) {
    return res.status(200).json({ ok: true, note: 'Resend not configured.' });
  }

  try {
    const { name, phone, email, city, message } = (req.body || {});

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required.' });
    }

    const safe = (v) => String(v || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');

    const html = `
      <div style="font-family: -apple-system, Segoe UI, Inter, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #fafaf7; border: 1px solid #e8e4da; border-radius: 8px;">
        <h2 style="margin: 0 0 16px; font-family: Georgia, serif; color: #0b0b0c;">Lead i ri nga sergioconstruction.al</h2>
        <table style="width: 100%; border-collapse: collapse; line-height: 1.6;">
          <tr><td style="padding: 6px 12px 6px 0; color: #666; vertical-align: top;"><strong>Emri</strong></td><td style="padding: 6px 0;">${safe(name)}</td></tr>
          <tr><td style="padding: 6px 12px 6px 0; color: #666; vertical-align: top;"><strong>Telefoni</strong></td><td style="padding: 6px 0;"><a href="tel:${safe(phone)}" style="color: #c9a45a;">${safe(phone)}</a></td></tr>
          ${email ? `<tr><td style="padding: 6px 12px 6px 0; color: #666; vertical-align: top;"><strong>Email</strong></td><td style="padding: 6px 0;"><a href="mailto:${safe(email)}" style="color: #c9a45a;">${safe(email)}</a></td></tr>` : ''}
          ${city  ? `<tr><td style="padding: 6px 12px 6px 0; color: #666; vertical-align: top;"><strong>Qyteti</strong></td><td style="padding: 6px 0;">${safe(city)}</td></tr>` : ''}
          ${message ? `<tr><td style="padding: 6px 12px 6px 0; color: #666; vertical-align: top;"><strong>Mesazhi</strong></td><td style="padding: 6px 0;">${safe(message).replace(/\n/g, '<br>')}</td></tr>` : ''}
        </table>
        <p style="margin: 24px 0 0; font-size: 0.85em; color: #888;">
          Dërguar nga formulari i kontaktit në landing page. Përgjigju brenda 24 orëve për konvertim më të lartë.
        </p>
      </div>
    `;

    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to: inbox,
      subject: `Lead i ri: ${name}${city ? ` — ${city}` : ''}`,
      html,
      replyTo: email || undefined,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact form error:', err);
    // Still return 200 so the WhatsApp flow on the frontend isn't blocked.
    return res.status(200).json({ ok: false, error: 'Send failed.' });
  }
}
