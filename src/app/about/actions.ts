"use server";

import { Resend } from "resend";

interface ContactPayload {
  name: string;
  email: string;
  msg: string;
}

type SendResult = { ok: true } | { ok: false; error: string };

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactEmail(
  payload: ContactPayload
): Promise<SendResult> {
  const { name, email, msg } = payload;

  if (!name.trim() || !email.trim() || !msg.trim()) {
    return { ok: false, error: "All fields are required." };
  }

  try {
    const { error } = await resend.emails.send({
      from: "Arcade Box <noreply@resend.dev>",
      to: email,
      subject: "Message received — Arcade Box",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Message received — Arcade Box</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:monospace;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#0d0d1a;border:1px solid #1e1e2e;max-width:600px;width:100%;">
          <!-- header bar -->
          <tr>
            <td style="background:#0a0a0f;border-bottom:1px solid #1e1e2e;padding:14px 20px;">
              <span style="font-family:'Press Start 2P',monospace;font-size:9px;color:#00f5ff;letter-spacing:0.14em;">ARCADE BOX // INCOMING MESSAGE</span>
            </td>
          </tr>
          <!-- neon rule -->
          <tr>
            <td style="height:3px;background:linear-gradient(90deg,transparent,#00f5ff,#ff006e,transparent);"></td>
          </tr>
          <!-- body -->
          <tr>
            <td style="padding:36px 32px;">
              <p style="font-family:'Press Start 2P',monospace;font-size:10px;color:#00f5ff;letter-spacing:0.12em;margin:0 0 24px;">PLAYER DETECTED</p>
              <p style="color:#a0a0b8;font-size:14px;line-height:1.7;margin:0 0 12px;">Hey <strong style="color:#fff;">${name}</strong>,</p>
              <p style="color:#a0a0b8;font-size:14px;line-height:1.7;margin:0 0 24px;">
                Your message has been received. We'll get back to you soon. Here's a copy of what you sent:
              </p>
              <!-- message box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:#0a0a0f;border:1px solid #1e1e2e;border-left:3px solid #00f5ff;padding:16px 18px;">
                    <p style="font-family:monospace;font-size:13px;color:#c0c0d8;line-height:1.7;margin:0;white-space:pre-wrap;">${msg.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
                  </td>
                </tr>
              </table>
              <p style="color:#606078;font-size:12px;line-height:1.6;margin:0;">
                — The Arcade Box crew<br />
                <span style="font-family:'Press Start 2P',monospace;font-size:8px;color:#00f5ff;letter-spacing:0.1em;">INSERT COIN TO CONTINUE</span>
              </p>
            </td>
          </tr>
          <!-- footer -->
          <tr>
            <td style="height:1px;background:#1e1e2e;"></td>
          </tr>
          <tr>
            <td style="padding:14px 32px;text-align:center;">
              <p style="font-family:monospace;font-size:11px;color:#404058;margin:0;">
                © Arcade Box · You received this because you submitted the contact form.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: message };
  }
}
