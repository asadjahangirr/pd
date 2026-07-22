import nodemailer from "nodemailer";

/* Sends order emails via Gmail (using a Gmail App Password).
   If GMAIL_USER / GMAIL_APP_PASSWORD aren't set, it quietly skips —
   so placing an order never fails just because email isn't configured. */

const STORE = process.env.STORE_NAME || "Delight Pharma";
const rs = (n) => `Rs. ${Number(n || 0).toLocaleString()}`;

let transporter = null;
function getTransporter() {
  const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    });
  }
  return transporter;
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
  const from = `"${STORE}" <${process.env.GMAIL_USER}>`;
  const owner = process.env.OWNER_EMAIL || process.env.GMAIL_USER;
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
