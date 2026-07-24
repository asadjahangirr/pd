import nodemailer from "nodemailer";

/* Sends order emails.
   Prefers a generic SMTP service (Brevo, SendGrid, …) if SMTP_* env vars are
   set; otherwise falls back to Gmail (GMAIL_USER / GMAIL_APP_PASSWORD).
   Credentials are whitespace-stripped, since values pasted into hosting
   dashboards often pick up spaces/line-breaks (a common cause of "Invalid
   login"). If nothing is configured it quietly skips, so orders never fail. */

const STORE = process.env.STORE_NAME || "Delight Pharma";
const rs = (n) => `Rs. ${Number(n || 0).toLocaleString()}`;

const trim = (v) => (v || "").trim();
const stripSpaces = (v) => (v || "").replace(/\s+/g, "");

function fromAddress() {
  const addr = trim(process.env.SMTP_FROM) || trim(process.env.GMAIL_USER);
  return `"${STORE}" <${addr}>`;
}

let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  const env = process.env;

  // Option 1 — generic SMTP (Brevo / SendGrid / Mailgun, etc.)
  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
    const port = Number(env.SMTP_PORT) || 587;
    transporter = nodemailer.createTransport({
      host: trim(env.SMTP_HOST),
      port,
      secure: port === 465,
      auth: { user: trim(env.SMTP_USER), pass: stripSpaces(env.SMTP_PASS) },
    });
    return transporter;
  }

  // Option 2 — Gmail app password
  if (env.GMAIL_USER && env.GMAIL_APP_PASSWORD) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: trim(env.GMAIL_USER), pass: stripSpaces(env.GMAIL_APP_PASSWORD) },
    });
    return transporter;
  }

  return null;
}

function itemsTable(order) {
  const rows = order.items
    .map(
      (it) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;">${it.name} × ${it.qty}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${rs(it.price * it.qty)}</td>
      </tr>`
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse;font-size:14px;color:#17241f;margin-top:12px;">
    ${rows}
    ${order.discount ? `<tr><td style="padding:6px 0;">Discount</td><td style="padding:6px 0;text-align:right;">- ${rs(order.discount)}</td></tr>` : ""}
    <tr><td style="padding:6px 0;">Shipping</td><td style="padding:6px 0;text-align:right;">${order.shipping ? rs(order.shipping) : "Free"}</td></tr>
    <tr><td style="padding:8px 0;font-weight:bold;">Total (Cash on Delivery)</td><td style="padding:8px 0;text-align:right;font-weight:bold;">${rs(order.total)}</td></tr>
  </table>`;
}

function customerHtml(order) {
  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:8px;">
    <h2 style="color:#226f51;margin:0 0 8px;">Thank you for your order!</h2>
    <p style="font-size:14px;color:#17241f;">Hi ${order.customer.name}, we've received your order
      <b>#${order.orderNumber}</b> and will confirm it on WhatsApp shortly.</p>
    ${itemsTable(order)}
    <p style="margin-top:16px;font-size:14px;color:#17241f;"><b>Delivery to:</b><br>
      ${order.customer.address}${order.customer.city ? ", " + order.customer.city : ""}<br>${order.customer.phone}</p>
    <p style="font-size:13px;color:#5c6b64;">Please keep <b>${rs(order.total)}</b> ready for the delivery rider.</p>
    <p style="font-size:12px;color:#5c6b64;margin-top:20px;">— ${STORE}</p>
  </div>`;
}

function ownerHtml(order) {
  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:8px;">
    <h2 style="color:#226f51;margin:0 0 8px;">🛒 New order #${order.orderNumber}</h2>
    <p style="font-size:14px;color:#17241f;"><b>${order.customer.name}</b> · ${order.customer.phone}${order.customer.email ? " · " + order.customer.email : ""}</p>
    <p style="font-size:14px;color:#17241f;">${order.customer.address}${order.customer.city ? ", " + order.customer.city : ""}${order.customer.notes ? "<br>Note: " + order.customer.notes : ""}</p>
    ${itemsTable(order)}
  </div>`;
}

export async function sendOrderEmails(order) {
  const t = getTransporter();
  if (!t) {
    console.log("ℹ Email not configured (GMAIL_USER/GMAIL_APP_PASSWORD) — skipping order emails.");
    return;
  }
  const from = fromAddress();
  const owner = trim(process.env.OWNER_EMAIL) || trim(process.env.GMAIL_USER) || trim(process.env.SMTP_FROM);
  const jobs = [];

  if (order.customer?.email) {
    jobs.push(
      t.sendMail({ from, to: order.customer.email, subject: `Your ${STORE} order #${order.orderNumber}`, html: customerHtml(order) })
    );
  }
  jobs.push(
    t.sendMail({ from, to: owner, subject: `New order #${order.orderNumber} — ${rs(order.total)}`, html: ownerHtml(order) })
  );

  try {
    await Promise.all(jobs);
    console.log(`✓ Order emails sent for #${order.orderNumber}`);
  } catch (err) {
    console.error("✗ Order email error:", err.message);
  }
}
