# SPEC 03 — About Page with Contact Form

> **Status:** Implemented · **Depends on:** SPEC 02 · **Date:** 2026-06-25
> **Objective:** Implement the `/about` page with an About section and a Contact form that sends a confirmation email to the submitter via Resend using a Next.js Server Action.

---

## Scope

**In:**

- New route `app/about/page.tsx` (`"use client"`) with two sections from the reference template (`references/templates/home-about/about.jsx`):
  1. About — mission statement, 3 highlight cards (Heart, Browser, Plant pixel SVG icons)
  2. Contact — form (name, email, message), shake animation on empty submit, terminal-style success screen after send
- New `app/about/actions.ts` (`"use server"`) with the `sendContactEmail` Server Action — calls Resend and sends an HTML confirmation email to the address the user typed in the form
- HTML confirmation email styled to the arcade/neon theme (inline CSS, no external assets)
- New CSS classes in `app/globals.css` for the About page (`.about`, `.about-hero`, `.about-title`, `.about-mission`, `.highlight-row`, `.highlight`, `.hl-icon`, `.hl-text`, `.about-divider`, `.div-bar`, `.div-pixels`, `.about-contact`, `.contact-grid`, `.contact-intro`, `.contact-title`, `.contact-sub`, `.contact-tips`, `.tip`, `.tip-led`, `.contact-form`, `.field`, `.terminal-success`, `.term-bar`, `.term-body`, `.term-title`, `.dot`, `.line`, `.prompt`, `.success`, `.caret`, `.shake`)
- `components/nav.tsx` — add "About" as a third nav link pointing to `/about` on both desktop and mobile
- `.env.local` — document `RESEND_API_KEY` variable (value to be filled by the developer)
- `package.json` — add `resend` package

**Out of scope (for future specs):**

- Admin notification email (only the confirmation to the submitter is sent)
- Server-side email format validation beyond checking non-empty fields
- Rate limiting or CAPTCHA on the contact form
- Real domain verification (sender is `noreply@resend.dev`, Resend sandbox)
- Any database persistence of contact submissions
- Changes to pages other than Nav

---

## Data Model

```ts
// app/about/actions.ts
interface ContactPayload {
  name: string;
  email: string;
  msg: string;
}

type SendResult =
  | { ok: true }
  | { ok: false; error: string };

export async function sendContactEmail(payload: ContactPayload): Promise<SendResult>
```

No new persistent data structures — submissions are not stored anywhere. The form state lives in component `useState`; nothing is written to localStorage or any database.

---

## Implementation Plan

1. **Install `resend` and set up env variable**
   - `npm install resend`
   - Create `.env.local` (if it doesn't exist) and add:
     ```
     RESEND_API_KEY=re_xxxxxxxxxxxx  # replace with your Resend API key
     # Note: noreply@resend.dev sandbox only delivers to the email registered in your Resend account
     ```

2. **Add CSS classes to `app/globals.css`**
   - Port all About/Contact classes from the reference template styles: `.about`, `.about-hero`, `.about-title`, `.about-mission`, `.highlight-row`, `.highlight`, `.hl-icon`, `.hl-text`, `.about-divider`, `.div-bar`, `.div-pixels`, `.about-contact`, `.contact-grid`, `.contact-intro`, `.contact-title`, `.contact-sub`, `.contact-tips`, `.tip`, `.tip-led`, `.contact-form`, `.field`, `.terminal-success`, `.term-bar`, `.term-body`, `.term-title`, `.dot`, `.line`, `.prompt`, `.success`, `.caret`, `.shake`

3. **Create `app/about/actions.ts`**
   - `"use server"` directive at the top
   - Import `Resend` from `"resend"`
   - Instantiate with `new Resend(process.env.RESEND_API_KEY)`
   - `sendContactEmail(payload: ContactPayload): Promise<SendResult>`:
     - Validate all three fields are non-empty; return `{ ok: false, error: "..." }` if not
     - Call `resend.emails.send()` with:
       - `from`: `"Arcade Box <noreply@resend.dev>"`
       - `to`: `payload.email`
       - `subject`: `"Message received — Arcade Box"`
       - `html`: arcade-themed HTML string (dark background, neon accents, pixel font via Google Fonts, shows the user's name and message)
     - Return `{ ok: true }` on success or `{ ok: false, error }` on Resend failure
     - Wrap in try/catch so a missing `RESEND_API_KEY` returns `{ ok: false }` instead of crashing

4. **Create `app/about/page.tsx`**
   - `"use client"` directive
   - `HighlightIcon` component — three pixel SVG variants from the reference template (HEART, BROWSER, PLANT)
   - `useReveal` hook — `IntersectionObserver` on `.reveal` elements, adds `.in` class; disconnects on unmount
   - `AboutPage` component:
     - `useState` for `form` (name/email/msg), `sent` (name string or null), `shake`, `pending`, `error`
     - About section: kicker, title, mission paragraph, 3 highlight cards
     - Pixel divider with 24 animated `<span>` elements
     - Contact section: intro column (kicker, title, subtitle, 3 tips) + form column
     - `onSubmit` handler: sets `pending` true, calls `sendContactEmail(form)`, on success sets `sent`; on failure sets `error` message below the button; always sets `pending` false
     - Submit button disabled while `pending` is true
     - Success state: terminal-style screen showing `{sent.toUpperCase()}`, "SEND ANOTHER MESSAGE" button resets `sent`, `form`, and `error`
   - All text in English

5. **Update `components/nav.tsx`**
   - Add "About" link to `/about` as the third item in the desktop nav and the mobile menu, after "Hall of Fame"

---

## Acceptance Criteria

- [ ] `GET /about` renders the About section with mission text and 3 highlight cards (Heart, Browser, Plant pixel SVG icons)
- [ ] `GET /about` renders the Contact form with Name, Email, and Message fields
- [ ] Submitting the form with any empty field triggers the shake animation and does not call the Server Action
- [ ] Submitting a valid form sends a confirmation email to the address entered in the Email field via Resend
- [ ] After a successful send, the form is replaced by the terminal-style success screen showing the user's name in uppercase
- [ ] "SEND ANOTHER MESSAGE" on the success screen resets the form to empty and hides the success screen
- [ ] If Resend returns an error, the form stays visible and an error message appears below the submit button
- [ ] The submit button is disabled while the Server Action is in flight
- [ ] Sections with `.reveal` animate in when scrolled into view
- [ ] The Nav shows an "About" link that navigates to `/about` on both desktop and mobile
- [ ] `npm run build` and `npm run lint` pass without errors

---

## Decisions Taken and Discarded

- **Server Action vs API Route** → Server Action (`app/about/actions.ts`). More idiomatic in Next.js 16 App Router; avoids exposing a public REST endpoint for a simple one-off form.

- **Email recipient: admin notification vs user confirmation** → confirmation to the submitter only. No admin inbox to configure; the user gets a receipt acknowledging their message was received.

- **Sender domain: custom domain vs `noreply@resend.dev`** → Resend sandbox (`noreply@resend.dev`). No domain verification step required; unblocks implementation immediately. Can be swapped for a real domain later by changing the `from` field and verifying in Resend.

- **Email format: plain text vs HTML** → HTML with arcade/neon styling (inline CSS). Consistent with the app's visual identity; Resend handles HTML reliably across major email clients.

- **Form validation: client-only vs server-side** → client-only (non-empty check in the Server Action as a guard, but primary UX feedback is in the browser). No complex validation rules warrant a dedicated validation library.

- **CSS: new file vs `globals.css`** → `globals.css`, consistent with specs 01 and 02.

---

## Identified Risks

- **`RESEND_API_KEY` missing at runtime.** If the variable is not set in `.env.local`, the Resend client will throw on instantiation. The Server Action wraps the call in try/catch and returns `{ ok: false }` rather than crashing the page.

- **Resend sandbox restriction.** `noreply@resend.dev` can only deliver to the email address registered in the Resend account during development. Emails to other addresses will be silently dropped until a real domain is verified. Documented in `.env.local` comments.

- **`"use client"` / `"use server"` boundary.** The page is a Client Component; the Server Action must live in a separate `actions.ts` file with `"use server"`. Defining it inline in the page file will cause a Next.js build error.

- **Pending state UX.** The submit button must be disabled while the Server Action is in flight to prevent duplicate submissions; forgetting this risks multiple emails being sent for one click.

---

## What is Not in This Spec

- Admin notification email when a user submits the form.
- Rate limiting or CAPTCHA on the contact endpoint.
- Real domain verification (deferred until a production domain is available).
- Persistence of contact submissions in any database.
