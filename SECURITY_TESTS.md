# CareWeave — Security Testing & Verification Checklist

This document provides a structured manual test plan and judge demo checklist for validating the frontend security architecture, defensive controls, and data protection measures implemented in the CareWeave prototype.

---

## 1. Authentication & Session Flow

Validates in-memory session handling, demo persona switching, and session clearance without local persistence.

- [ ] **Unauthenticated Access Redirection**
  - **Steps**: In an incognito or fresh browser window, navigate directly to `http://localhost:5173/` or any sub-route (e.g., `/journey`, `/records`).
  - **Expected**: Instantly redirects to `/login`. No dashboard or patient records flash on screen.
- [ ] **Demo Persona Switching**
  - **Steps**: On the `/login` screen, select each demo persona:
    - **Login as Patient (Sarah Jenkins)** -> Authenticates with role `PATIENT`.
    - **Login as Doctor (Dr. Chen)** -> Authenticates with role `DOCTOR`.
    - **Login as Caregiver (Marcus Jenkins)** -> Authenticates with role `CAREGIVER`.
  - **Expected**: Redirects to the target dashboard view. The sidebar footer displays the selected user's name and role.
- [ ] **Sign Out & State Clearance**
  - **Steps**: Click the **Sign Out** button in the sidebar footer.
  - **Expected**: Clears in-memory session immediately and redirects back to `/login`. Subsequent clicks on browser "Back" do not display protected clinical data.

#### How to Verify in DevTools:
1. Open Chrome DevTools (`F12`) -> **Console**.
2. Run: `window.localStorage.length === 0 && window.sessionStorage.length === 0` -> Returns `true`.
3. Verify no tokens or patient data are stored in web storage.

---

## 2. Route Protection & UX Role Checking

Validates client-side route protection and return-path preservation.

- [ ] **Target Location State Preservation**
  - **Steps**: Enter `http://localhost:5173/records` directly into the address bar while unauthenticated.
  - **Expected**: Redirects to `/login`. Select any persona to sign in.
  - **Expected**: Automatically forwards the user to `/records` (restoring the requested destination).
- [ ] **Wildcard / 404 Route Protection**
  - **Steps**: Navigate to `http://localhost:5173/non-existent-route` while unauthenticated.
  - **Expected**: Redirects cleanly to `/login`.
- [ ] **Defense-in-Depth Role Verification Notice**
  - **Verification**: Inspect `src/auth/ProtectedRoute.jsx`. Confirm explicit notice that client-side role checking is for UX routing only and backend services independently enforce endpoint authorization.

---

## 3. Input Validation & Upload Hardening

Validates file upload restrictions, filename sanitization, and text input escaping.

- [ ] **File Type Extension Restriction**
  - **Steps**: Open **Health Records** -> Click **Upload Document**.
  - **Expected**: File input restricts selection to `.pdf,.png,.jpg,.jpeg`.
- [ ] **MIME Type & Header Validation**
  - **Steps**: Attempt to upload an unpermitted file (e.g., `.exe`, `.html`, `.js`, or `.svg`).
  - **Expected**: Upload halts. An accessible error banner appears in the modal: *"File type is not permitted. Only PDF, PNG, and JPEG documents are allowed."* The file input resets.
- [ ] **5 MB File Size Limit Enforcement**
  - **Steps**: Attempt to upload a document exceeding 5 MB in size.
  - **Expected**: Upload halts. An error banner displays: *"File size (... MB) exceeds the maximum allowed limit of 5 MB."*
- [ ] **Directory Traversal & Filename Sanitization**
  - **Steps**: Select a test file with directory traversal or unsafe characters (e.g., `../../sensitive_data#$%.pdf`).
  - **Expected**: File name is sanitized to `sensitive_data___.pdf` (stripping paths, consecutive dots, and special characters).
- [ ] **XSS Input Escaping**
  - **Steps**: Inspect `src/utils/validation.js` and verify `sanitizeTextInput()` escapes `<`, `>`, `&`, `"`, `'`.

#### How to Verify in DevTools:
1. Open DevTools -> **Console**.
2. Test validation utilities directly:
   ```javascript
   import('./src/utils/validation.js').then(v => {
     console.log('Sanitize Name:', v.sanitizeFileName('../../../etc/passwd.pdf'));
     console.log('Sanitize XSS:', v.sanitizeTextInput('<script>alert("XSS")</script>'));
     console.log('Safe URL (http):', v.isSafeUrl('https://careweave.org'));
     console.log('Safe URL (javascript):', v.isSafeUrl('javascript:alert(1)'));
   });
   ```
3. Confirm traversal sequences are stripped, XSS characters are escaped to HTML entities, and `javascript:` URLs return `false`.

---

## 4. Data Minimization & Storage Hygiene

Validates that sensitive healthcare data and credentials never touch persistent browser storage.

- [ ] **Zero Sensitive Data in `localStorage`**
  - **Steps**: Complete a full user journey (login, view records, view medications, upload document, sign out).
  - **Expected**: `localStorage.getItem('token')`, `localStorage.getItem('patient')`, etc., return `null`.
- [ ] **Zero Sensitive Data in `sessionStorage`**
  - **Expected**: `sessionStorage` remains empty.
- [ ] **Zero Sensitive Data in Cookies**
  - **Expected**: No client-set authentication or medical record cookies are present.

#### How to Verify in DevTools:
1. Open DevTools -> **Application** tab.
2. Under **Storage**, inspect:
   - **Local Storage**: 0 items.
   - **Session Storage**: 0 items.
   - **Cookies**: 0 client-created auth/patient cookies.

---

## 5. Secrets Isolation

Validates that no API keys, private credentials, or secrets are leaked to the client bundle.

- [ ] **Environment Configuration Verification**
  - **Steps**: Inspect `.env.example` at root.
  - **Expected**: Only public, client-safe variables prefixed with `VITE_` are defined (`VITE_API_BASE_URL`).
  - **Expected**: Clear security guidance instructs developers never to store private keys, secrets, or database credentials in client `.env` files.
- [ ] **Client Bundle Inspection**
  - **Steps**: Inspect generated production assets in `dist/assets/`.
  - **Expected**: No private keys (`PRIVATE_KEY`, `SECRET_KEY`, `JWT_SECRET`) exist in the bundled JavaScript.

#### How to Verify in DevTools:
1. Run `npm run build`.
2. Inspect `dist/assets/*.js` for sensitive keywords:
   ```powershell
   Get-ChildItem dist/assets/*.js | Select-String -Pattern "PRIVATE_KEY","SECRET_KEY","JWT_SECRET","PASSWORD"
   ```
3. Returns zero secret matches.

---

## 6. Network & Error Masking

Validates defensive API communication, error masking, and timeout handling.

- [ ] **Defensive Error Masking**
  - **Steps**: Inspect `src/services/apiClient.js`.
  - **Expected**: Non-2xx responses are parsed defensively. Any server stack traces, database exceptions, or raw HTML error pages are masked with user-friendly messages (e.g., *"An unexpected service error occurred. Please try again later."*).
- [ ] **Request Timeout Enforcement**
  - **Steps**: Verify that requests enforce a 10-second `AbortController` timeout to prevent hanging connections.
- [ ] **In-Memory Authorization Header**
  - **Steps**: Verify that `apiClient` automatically attaches `Authorization: Bearer <token>` from memory when active, and omits it when logged out.

---

## 7. Content Security Policy (CSP) & Referrer Policy

Validates browser-level policy enforcement via HTML `<meta>` tags.

- [ ] **Content Security Policy Tag**
  - **Steps**: Inspect `<head>` in `index.html`.
  - **Expected**: Strict CSP meta tag is present:
    ```html
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' http://localhost:* ws://localhost:*; object-src 'none'; base-uri 'self'; form-action 'self';"
    />
    ```
- [ ] **Referrer Policy**
  - **Expected**: `<meta name="referrer" content="strict-origin-when-cross-origin" />` is configured to prevent sensitive healthcare URL leakage in HTTP referrer headers.
- [ ] **Object & Base Restriction**
  - **Expected**: `object-src 'none'` prevents Flash/Java applet execution; `base-uri 'self'` prevents base tag hijacking.

#### How to Verify in DevTools:
1. Open DevTools -> **Elements** tab.
2. Expand `<head>` and locate the `<meta http-equiv="Content-Security-Policy">` tag.
3. In **Console**, verify there are no CSP violation errors during normal application navigation.

---

## 8. Summary of Automated Build Verification

- **Build Status**: `npm run build` passes with **0 errors**.
- **Bundle Generation**: Assets cleanly compiled to `dist/`.
- **Dependency Audit**: 0 high or critical vulnerabilities reported by `npm audit`.
