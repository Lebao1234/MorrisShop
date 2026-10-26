import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import logger from "../utils/logger.js";
import { formatVND } from "../utils/helpers.js";

let transporter = null;
if (env.mail.enabled) {
  transporter = nodemailer.createTransport({
    host: env.mail.host,
    port: env.mail.port,
    secure: env.mail.port === 465,
    auth: { user: env.mail.user, pass: env.mail.pass },
  });
}

const shell = (title, body) => `
<div style="background:#F7F5F0;padding:40px 0;font-family:Georgia,'Times New Roman',serif;color:#0B0B0B">
  <div style="max-width:560px;margin:0 auto;background:#fff;padding:40px">
    <p style="letter-spacing:.35em;font-size:11px;text-transform:uppercase;color:#B08D57;margin:0 0 24px">MORRIS</p>
    <h1 style="font-size:26px;font-weight:400;margin:0 0 20px;line-height:1.3">${title}</h1>
    ${body}
    <hr style="border:none;border-top:1px solid #E8E4DC;margin:32px 0" />
    <p style="font-size:12px;color:#8A8578;font-family:Arial,sans-serif;line-height:1.7;margin:0">
      Morris Grooming Co. &middot; Ha Noi, Viet Nam<br/>
      Email này được gửi tự động, vui lòng không trả lời.
    </p>
  </div>
</div>`;

/** Gui mail; neu chua cau hinh SMTP thi chi log ra console (khong lam vo luong nghiep vu) */
export const sendMail = async ({ to, subject, html }) => {
  if (!transporter) {
    logger.warn(`[EMAIL:DEV] To: ${to} | Subject: ${subject}`);
    return { skipped: true };
  }
  try {
    const info = await transporter.sendMail({ from: env.mail.from, to, subject, html });
    logger.info(`Email da gui toi ${to} (${info.messageId})`);
    return info;
  } catch (err) {
    logger.error(`Gui email that bai toi ${to}: ${err.message}`);
    return { error: err.message };
  }
};

export const sendWelcomeEmail = (user) =>
  sendMail({
    to: user.email,
    subject: "Chào mừng bạn đến với Morris",
    html: shell(
      `Xin chào ${user.name},`,
      `<p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.8;color:#3A3831">
        Tài khoản của bạn đã được tạo thành công. Khám phá bộ sưu tập sáp vuốt tóc thủ công của chúng tôi
        và tìm kết cấu phù hợp nhất với mái tóc của bạn.</p>
      <p style="margin-top:28px">
        <a href="${env.clientUrl}/shop" style="background:#0B0B0B;color:#fff;padding:14px 28px;text-decoration:none;font-family:Arial,sans-serif;font-size:12px;letter-spacing:.15em;text-transform:uppercase">Khám phá bộ sưu tập</a>
      </p>`,
    ),
  });

export const sendResetPasswordEmail = (user, resetUrl) =>
  sendMail({
    to: user.email,
    subject: "Đặt lại mật khẩu Morris",
    html: shell(
      "Yêu cầu đặt lại mật khẩu",
      `<p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.8;color:#3A3831">
        Nhấn vào nút bên dưới để tạo mật khẩu mới. Liên kết có hiệu lực trong <strong>15 phút</strong>.
        Nếu bạn không yêu cầu điều này, hãy bỏ qua email.</p>
      <p style="margin-top:28px">
        <a href="${resetUrl}" style="background:#B08D57;color:#fff;padding:14px 28px;text-decoration:none;font-family:Arial,sans-serif;font-size:12px;letter-spacing:.15em;text-transform:uppercase">Đặt lại mật khẩu</a>
      </p>
      <p style="font-family:Arial,sans-serif;font-size:12px;color:#8A8578;margin-top:20px;word-break:break-all">${resetUrl}</p>`,
    ),
  });

const itemsTable = (order) => `
  <table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:13px">
    ${order.items
      .map(
        (i) => `<tr>
          <td style="padding:10px 0;border-bottom:1px solid #EFEDE7">${i.name} <span style="color:#8A8578">(${i.variantName || i.variantSku}) x${i.quantity}</span></td>
          <td style="padding:10px 0;border-bottom:1px solid #EFEDE7;text-align:right">${formatVND(i.price * i.quantity)}</td>
        </tr>`,
      )
      .join("")}
    <tr><td style="padding:10px 0">Tạm tính</td><td style="text-align:right">${formatVND(order.subtotal)}</td></tr>
    <tr><td style="padding:4px 0">Phí vận chuyển</td><td style="text-align:right">${formatVND(order.shippingFee)}</td></tr>
    ${order.discount ? `<tr><td style="padding:4px 0;color:#B08D57">Giảm giá</td><td style="text-align:right;color:#B08D57">-${formatVND(order.discount)}</td></tr>` : ""}
    <tr><td style="padding:12px 0;font-weight:bold;border-top:1px solid #0B0B0B">Tổng cộng</td>
        <td style="text-align:right;font-weight:bold;border-top:1px solid #0B0B0B">${formatVND(order.total)}</td></tr>
  </table>`;

export const sendOrderConfirmation = (order, user) =>
  sendMail({
    to: user.email,
    subject: `Xác nhận đơn hàng ${order.orderCode}`,
    html: shell(
      `Cảm ơn bạn, ${user.name}`,
      `<p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.8;color:#3A3831">
        Don hang <strong>${order.orderCode}</strong> đã được ghi nhận. Chúng tôi sẽ liên hệ xác nhận trong 24 giờ.</p>
      ${itemsTable(order)}
      <p style="font-family:Arial,sans-serif;font-size:13px;color:#3A3831;margin-top:24px">
        <strong>Giao tới:</strong><br/>${order.shippingAddress.fullName} - ${order.shippingAddress.phone}<br/>
        ${order.shippingAddress.street}, ${order.shippingAddress.ward}, ${order.shippingAddress.district}, ${order.shippingAddress.province}</p>
      <p style="margin-top:28px">
        <a href="${env.clientUrl}/account/orders/${order._id}" style="background:#0B0B0B;color:#fff;padding:14px 28px;text-decoration:none;font-family:Arial,sans-serif;font-size:12px;letter-spacing:.15em;text-transform:uppercase">Theo dõi đơn hàng</a>
      </p>`,
    ),
  });

const STATUS_LABEL = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  processing: "Đang chuẩn bị hàng",
  shipping: "Đang giao",
  delivered: "Đã giao thành công",
  cancelled: "Đã huỷ",
  returned: "Đã hoàn trả",
};

export const sendOrderStatusUpdate = (order, user, note = "") =>
  sendMail({
    to: user.email,
    subject: `Don hang ${order.orderCode}: ${STATUS_LABEL[order.orderStatus]}`,
    html: shell(
      `Don hang ${order.orderCode}`,
      `<p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.8;color:#3A3831">
        Trạng thái mới: <strong style="color:#B08D57">${STATUS_LABEL[order.orderStatus]}</strong></p>
      ${note ? `<p style="font-family:Arial,sans-serif;font-size:13px;color:#8A8578">${note}</p>` : ""}
      <p style="margin-top:28px">
        <a href="${env.clientUrl}/account/orders/${order._id}" style="background:#0B0B0B;color:#fff;padding:14px 28px;text-decoration:none;font-family:Arial,sans-serif;font-size:12px;letter-spacing:.15em;text-transform:uppercase">Xem chi tiết</a>
      </p>`,
    ),
  });

export const sendLowStockAlert = (adminEmails, products) =>
  sendMail({
    to: adminEmails.join(","),
    subject: `[Morris] ${products.length} sản phẩm sắp hết hàng`,
    html: shell(
      "Cảnh báo tồn kho thấp",
      `<ul style="font-family:Arial,sans-serif;font-size:13px;line-height:1.9;color:#3A3831">
        ${products.map((p) => `<li>${p.name} - con ${p.variants.reduce((s, v) => s + v.stock, 0)} san pham</li>`).join("")}
      </ul>`,
    ),
  });

export default { sendMail, sendWelcomeEmail, sendResetPasswordEmail, sendOrderConfirmation, sendOrderStatusUpdate, sendLowStockAlert };
