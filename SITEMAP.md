# TShare Frontend Sitemap

Last updated: 19 April 2026

## 1. Route-Level Sitemap

- `/` - Home / Landing (`P1`)
- `/sharePage` - Share Text (`SharePage`)
- `/share-image` - Share Image (`ImageSharePage`)
- `/share-pdf` - Share PDF (`PdfSharePage`)
- `/recievePage` - Receive Content (`RecievePage`)
- `/admin/login` - Admin Login (`AdminLogin`)
- `/admin/panel` - Admin Panel (`AdminPanel`) [session-gated]
- `/public-room` - Public Room Chat (`PublicRoom`)
- `/public-room?code=<ROOM_CODE>` - Public Room Chat with prefilled room code (`PublicRoom`)

## 2. Detailed Page Structure

### 2.1 `/` Home / Landing

Purpose:
- Main entry point for user actions.

Primary sections:
- Top banner text area.
- App logo/title (`TShare`).
- Action buttons:
  - Share -> navigates to `/sharePage`
  - Receive -> navigates to `/recievePage`
- Public Rooms CTA:
  - Public Rooms -> navigates to `/public-room`
- Footer links:
  - Admin -> navigates to `/admin/login`

Outbound links:
- `/sharePage`
- `/recievePage`
- `/public-room`
- `/admin/login`

---

### 2.2 `/sharePage` Share Text

Purpose:
- Create a text payload and receive a share code.

Primary sections:
- Banner text.
- Text input area (multiline textarea).
- Generated code display (when success), copy-to-clipboard interaction.
- Action buttons:
  - Share Text (POST save request)
  - Share Image -> `/share-image`
  - Share PDF -> `/share-pdf`
  - Back -> `/`

Key states:
- Idle (no code yet).
- Loading (`Processing...`).
- Success (code shown + copy state toggle).
- Error (alert on failure).

Outbound links:
- `/share-image`
- `/share-pdf`
- `/`

---

### 2.3 `/share-image` Share Image

Purpose:
- Upload an image and generate a share code.

Primary sections:
- Banner text.
- Image upload input (`accept=image/*`).
- Preview area (shows selected image).
- Code badge (after successful upload), click-to-copy.
- Action buttons:
  - Share Image (upload)
  - Share Text -> `/sharePage`
  - Share PDF -> `/share-pdf`
  - Back -> `/`

Key states:
- Idle (no selected file).
- Validation error (no file selected).
- Uploading (`Sharing...`).
- Success (image code available).
- Error message (upload failure).

Outbound links:
- `/sharePage`
- `/share-pdf`
- `/`

---

### 2.4 `/share-pdf` Share PDF

Purpose:
- Upload a PDF and generate a share code.

Primary sections:
- Banner text.
- PDF upload input (`accept=application/pdf`).
- Preview iframe (for selected local file).
- Code badge (after successful upload), click-to-copy.
- Action buttons:
  - Share PDF (upload)
  - Share Image -> `/share-image`
  - Share Text -> `/sharePage`
  - Back -> `/`

Key states:
- Idle (no selected file).
- Validation error (no file selected).
- Uploading (`Sharing...`).
- Success (PDF code available).
- Error message (upload failure).

Outbound links:
- `/share-image`
- `/sharePage`
- `/`

---

### 2.5 `/recievePage` Receive Content

Purpose:
- Retrieve shared text/image/PDF by code.

Primary sections:
- Banner text.
- Result panel:
  - Text mode: preformatted text output.
  - Image mode: large image preview + file name.
  - PDF mode: embedded PDF preview + file name.
- Input field for share code.
- Status messaging:
  - Error message
  - Success message
- Action buttons:
  - Copy (text only)
  - Download (image only)
  - Download PDF (PDF only)
  - Receive Text
  - Receive Image
  - Receive PDF
  - Back -> `/`

Key states:
- Idle (placeholder message).
- Fetching text.
- Fetching image.
- Fetching PDF.
- Error (invalid code/not found/network failure).
- Success by content type.

Outbound links:
- `/`

---

### 2.6 `/admin/login` Admin Login

Purpose:
- Authenticate admin user and establish session gate.

Primary sections:
- Banner + Admin badge.
- Password form.
- Error message area.
- Buttons:
  - Login (on success sets sessionStorage flag and redirects)
  - Back to Home -> `/`

Key states:
- Idle.
- Submitting (`Logging in...`).
- Authentication failure.
- Success redirect to `/admin/panel`.

Outbound links:
- `/`
- `/admin/panel` (on success)

---

### 2.7 `/admin/panel` Admin Panel (Session-Gated)

Access rule:
- Requires `sessionStorage.adminAuthenticated === 'true'`.
- Otherwise immediate redirect to `/admin/login`.

Purpose:
- Manage all shared text, image entries, and public rooms.

Top-level controls:
- Refresh Data
- Delete All Texts
- Delete All Images
- Create Public Room
- Change Password
- Logout -> `/`

Main sections:
1. Shared Texts table
- Columns: Code, Text preview, Created At, Actions.
- Actions per row:
  - Edit Text
  - Edit Code
  - New Code (regenerate)
  - Delete

2. Shared Images table
- Columns: Code, Preview, File name, Size, Created At, Actions.
- Actions per row:
  - Copy Code
  - View file
  - Edit Code
  - New Code (regenerate)
  - Delete

3. Public Rooms table
- Columns: Code, Name, Status, Created At, Actions.
- Actions per row:
  - Copy Code
  - Activate/Deactivate
  - Delete
- Extra CTA: Create New Public Room

Modal flows:
- Edit Text modal
- Change Password modal
- Edit Text Code modal
- Edit Image Code modal
- Create Public Room modal

Key states:
- Independent loading/error states for texts/images/public rooms.
- Temporary action feedback messages.

Outbound links:
- `/admin/login` (if unauthorized)
- `/` (logout)

---

### 2.8 `/public-room` Public Room Chat

Purpose:
- Real-time public chat room join + messaging via Socket.IO.

Entry variants:
- Direct entry: `/public-room`
- Deep link entry: `/public-room?code=<ROOM_CODE>`

Sub-flows:
1. Username gate modal
- Triggered when user has no stored username.
- Persists username in localStorage.

2. Room code entry view (before joining)
- Input room code.
- Join action validates room first, then joins socket room.
- Back to Home action.

3. Joined chat view
- Header with room name + room code.
- Users sidebar with online user list.
- Messages timeline:
  - Own messages
  - Other user messages
  - System messages (join/leave)
  - Typing indicators
- Message composer + send button.
- Leave Room action.

4. Offline/reconnect state
- Connection lost indicator + Retry Connection action.

Key states:
- Not joined.
- Joining/loading.
- Joined.
- Sending message.
- Typing broadcast active.
- Offline/reconnecting.
- Error states from room validation/join.

Outbound links:
- `/` (cancel, leave, or back actions)

## 3. Navigation Graph (User Journey View)

Primary user journeys:
- Home (`/`)
  - -> Share Text (`/sharePage`) -> Share Image (`/share-image`) / Share PDF (`/share-pdf`) / Back Home
  - -> Receive (`/recievePage`) -> Back Home
  - -> Public Rooms (`/public-room`) -> Join room -> Chat -> Back Home
  - -> Admin Login (`/admin/login`) -> Admin Panel (`/admin/panel`) -> Logout -> Home

Cross-links between share modes:
- `/sharePage` <-> `/share-image` <-> `/share-pdf`
- Each share mode has direct return to `/`

Public room deep-link path:
- External/shared link -> `/public-room?code=<ROOM_CODE>` -> username gate (if needed) -> room validation -> joined chat

## 4. Access and Guard Rules

- Admin route gating:
  - `/admin/panel` is client-guarded by sessionStorage flag.
  - Unauthorized user is redirected to `/admin/login`.
- Public rooms:
  - Room code is validated before join.
  - Room availability depends on server-side room status (active/inactive).

## 5. Non-Route but Important IA States

These are not separate URLs but are meaningful nodes in the information architecture:
- Generated code badges (text/image/pdf) with copy affordance.
- Receive result modes (text/image/pdf) inside one page.
- Admin modals (edit/create/password/code operations).
- Public room connectivity states (online/offline/retry).
- Public room typing indicator state.

## 6. Backend-Linked URL Patterns Used by Frontend

For coordination with backend/API docs:
- Text retrieval by code: `/get/:id`
- Image retrieval/download: `/image/:id`, `/image/download/:id`
- PDF retrieval/preview/download: `/pdf/:id`, `/pdf/preview/:id`, `/pdf/download/:id`
- Public room validation: `/public-room/validate/:code`

These are API endpoints, not frontend routes, but they define key content paths used by the UI.
