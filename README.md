# Wanderly — Travel Website

A fully responsive travel website built with **React.js** (frontend) and **Node.js / Express** (backend).
It demonstrates full-stack web development with HTML, CSS, Bootstrap 5, React Router, and a REST API.

---

## 1. Project structure

```
travel-website/
├── client/                  # React frontend (Vite)
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          ← consistent nav bar across all pages
│   │   │   └── Footer.jsx          ← consistent footer across all pages
│   │   ├── pages/
│   │   │   ├── Home.jsx            ← Page 1: hero + featured + newsletter form
│   │   │   ├── Destinations.jsx    ← Page 2: filterable destination grid
│   │   │   └── Booking.jsx         ← Page 3: booking form with validation
│   │   ├── App.jsx                 ← React Router setup
│   │   ├── main.jsx                ← React entry point + Bootstrap import
│   │   └── index.css               ← global styles
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                  # Node.js / Express backend
│   ├── data/
│   │   └── destinations.json       ← destinations "database"
│   ├── routes/
│   │   ├── destinations.js         ← GET /api/destinations (with filters)
│   │   ├── bookings.js             ← POST /api/bookings (with validation)
│   │   └── newsletter.js           ← POST /api/newsletter (with validation)
│   ├── server.js                   ← Express entry point
│   └── package.json
│
└── README.md                ← this file
```

---

## 2. How to run

You will need **Node.js 18+** installed.

### Step 1 — Start the backend

```bash
cd server
npm install
npm start
```

The API will run on **http://localhost:5000**. Test it with:
```
http://localhost:5000/api/destinations
```

### Step 2 — Start the frontend (in a second terminal)

```bash
cd client
npm install
npm run dev
```

Open the URL Vite prints (usually **http://localhost:5173**).

The Vite dev server proxies `/api/*` to the Express server, so the frontend
talks to the backend automatically.

---

## 3. Features mapped to project requirements

| Requirement | Where it's implemented |
|---|---|
| **React.js frontend** | Entire `client/` folder uses React + Vite |
| **HTML, CSS, Bootstrap** | `index.html`, `index.css`, Bootstrap 5 imported in `main.jsx` |
| **Node.js backend** | `server/server.js` using Express |
| **3 pages** | `Home.jsx`, `Destinations.jsx`, `Booking.jsx` |
| **Consistent navigation** | `Navbar` + `Footer` rendered in `App.jsx` for every route |
| **Minimum 2 forms** | Newsletter form on Home, Booking form on Booking page |
| **Form input validation** | Client-side (live, on blur) + server-side validation in routes |
| **Fully responsive** | Bootstrap grid + custom breakpoints in `index.css` |

---

## 4. Pages

### Home (`/`)
- Full-bleed hero with imagery, eyebrow, headline, CTAs
- Featured destinations section (data fetched from `/api/destinations`)
- "Why Wanderly" feature grid
- **Form #1 — Newsletter signup** with name + email validation

### Destinations (`/destinations`)
- Search bar (live filtering via API query string)
- Continent filter pills
- Responsive card grid with rating, price, duration, tags
- "Book this trip" button pre-fills destination on the booking page

### Booking (`/booking`)
- **Form #2 — Trip booking form** with 9 fields:
  - Full name, email, phone (text inputs)
  - Travelers (number)
  - Destination, room type (selects)
  - Departure date, return date (date pickers)
  - Special requests (textarea)
- Validation on every field, both client-side and server-side
- Confirmation screen with booking reference after successful submission

---

## 5. Form validation details

**Client-side** (in React, runs on blur and on submit):
- Required fields are checked
- Email format validated with regex
- Phone format validated
- Departure date must not be in the past
- Return date must be after departure
- Travelers must be between 1 and 12

**Server-side** (in Express, runs on every request):
- The same rules are re-applied so the API can never be bypassed
- Returns `400 Bad Request` with a per-field `errors` object

---

## 6. API endpoints

| Method | Path | Description |
|---|---|---|
| GET  | `/api/health` | Service health check |
| GET  | `/api/destinations` | List destinations (supports `?continent=`, `?search=`, `?maxPrice=`) |
| GET  | `/api/destinations/:id` | Single destination by id |
| POST | `/api/bookings` | Create a new booking |
| GET  | `/api/bookings` | List all bookings (admin/testing) |
| POST | `/api/newsletter` | Subscribe to newsletter |
| GET  | `/api/newsletter` | List subscribers (admin/testing) |

---

## 7. Responsive design

Tested layouts at:
- **Desktop** (≥ 1200px): 3-column destination grid, side-by-side hero
- **Tablet** (768–1199px): 2-column grid, stacked CTAs
- **Mobile** (< 768px): 1-column grid, hamburger menu, full-width buttons

Bootstrap's grid system (`col-md-6`, `col-lg-4`, etc.) plus custom media queries
in `index.css` handle every breakpoint.

---

## 8. Tech stack summary

**Frontend**
- React 18
- React Router 6
- Bootstrap 5 + Bootstrap Icons
- Vite (dev server + bundler)
- Google Fonts: Fraunces (display) + Manrope (body)

**Backend**
- Node.js
- Express 4
- CORS middleware
- JSON file as data store (easy to swap for MongoDB/MySQL later)

---

## 9. Possible extensions (if you want extra credit)

- Replace the JSON store with MongoDB or MySQL
- Add user authentication (JWT)
- Send confirmation emails with Nodemailer
- Add a payment step with Stripe
- Add an admin dashboard to view bookings
# Travel-Website-With-Security
