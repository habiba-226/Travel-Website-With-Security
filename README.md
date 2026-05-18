# Wanderly — Travel Website

A fully responsive full-stack travel website built with **React.js** (frontend), **Node.js / Express** (backend), and **PostgreSQL + Prisma ORM** (database).

Wanderly focuses on the idea of **Slow Travel** — encouraging travelers to explore destinations deeply and meaningfully instead of rushing through trips.

The project demonstrates modern web development concepts including:

- React Router
- REST APIs
- Form validation
- Database integration
- Responsive UI/UX design

---

# 1. Project structure

```
wanderly/
├── client/                           # React frontend (Vite)
│   ├── public/
│   │   └── favicon.svg
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            ←  navigation bar
│   │   │   └── Footer.jsx            ←  footer
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx              ← hero + featured + newsletter form
│   │   │   ├── Destinations.jsx      ← destinations grid with filters
│   │   │   ├── Tours.jsx             ← tours & packages
│   │   │   ├── Gallery.jsx           ← travel gallery
│   │   │   ├── Blog.jsx              ← travel articles
│   │   │   └── Booking.jsx           ← booking form
│   │   │
│   │   ├── lib/
│   │   │   └── api.js                ← central fetch wrapper
│   │   │
│   │   ├── styles/
│   │   │   ├── Home.css
│   │   │   ├── Global.css
│   │   │   ├── Gallery.css
│   │   │   ├── Booking.css
│   │   │   ├── Destinations.css
│   │   │   ├── Blog.css
│   │   │   ├── Navbar.css
│   │   │   └── Tours.css
│   │   │
│   │   ├── App.jsx                   ← React Router setup
│   │   ├── main.jsx                  ← React entry point
│   │   └── index.css
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                           # Node.js / Express backend
│   ├── prisma/
│   │   └── schema.prisma             ← Prisma database schema
│   │
│   ├── routes/
│   │   ├── destinations.js           ← GET destinations
│   │   ├── tours.js                  ← GET tours
│   │   ├── gallery.js                ← GET gallery images
│   │   ├── posts.js                  ← GET blog posts
│   │   ├── bookings.js               ← POST/GET bookings (saved to DB)
│   │   └── newsletter.js             ← POST/GET subscribers (saved to DB)
│   │
│   ├── lib/
│   │   └── prisma.js                 ← Prisma client singleton
│   │
│   ├── data/                         # JSON content files
│   │   ├── destinations.json
│   │   ├── tours.json
│   │   ├── gallery.json
│   │   └── posts.json
│   │
│   ├── server.js                     ← Express entry point
│   ├── package.json
│   └── .env
│
└── README.md
```

---

# 2. How to run

You will need:

- **Node.js 18+**
- **PostgreSQL**

---

## Step 1 — Clone the repository

```bash
git clone https://github.com/your-username/wanderly.git
cd wanderly
```

---

## Step 2 — Install frontend dependencies

```bash
cd client
npm install
```

---

## Step 3 — Install backend dependencies

```bash
cd ../server
npm install
```

---

## Step 4 — Configure environment variables

Create a `.env` file inside the `server/` folder:

```env
DATABASE_URL=postgresql://your_postgres_user:your_password@localhost:5432/wanderly
PORT=5000
```

---

## Step 5 — Push the database schema

```bash
npx prisma db push
```

This creates the `Booking` and `Subscriber` tables in your PostgreSQL database.

---

## Step 6 — Start the backend server

```bash
npm start
```

The backend API will run on:

```
http://localhost:5000
```

Test the API:

```
http://localhost:5000/api/destinations
```

---

## Step 7 — Start the frontend (new terminal)

```bash
cd client
npm run dev
```

Open the Vite URL shown in the terminal (usually `http://localhost:5173`).

---

## Step 8 (Optional) — View live data with Prisma Studio

Prisma Studio provides a clean, visual interface to inspect your database records without needing to keep heavy database managers like pgAdmin running. 

To view your saved bookings and newsletter subscribers:

1. Open a new terminal window and navigate to the server folder:
   ```bash
   cd server
   npx prisma studio
   ```
  This will automatically open a visual database browser in your default web browser at: http://localhost:5555

# 3. Features mapped to project requirements

| Requirement               | Where it's implemented                              |
| ------------------------- | --------------------------------------------------- |
| **React.js frontend**     | Entire `client/` folder                             |
| **Node.js backend**       | `server/server.js` using Express                    |
| **Database integration**  | PostgreSQL + Prisma ORM (Booking & Subscriber models) |
| **Responsive design**     | Bootstrap grid + custom media queries               |
| **6 pages**               | Home, Destinations, Tours, Gallery, Blog, Booking   |
| **Consistent navigation** | Navbar + Footer components on every page            |
| **Minimum 2 forms**       | Booking form + Newsletter subscription form         |
| **Form validation**       | Client-side (React) + server-side (Express)         |
| **REST API**              | 6 route files, 10+ endpoints                        |
| **Dynamic content**       | JSON datasets served from `server/data/`            |

---

# 4. Pages

## Home (`/home`)

- Hero section with CTA buttons
- Featured destinations
- Slow travel introduction section
- Newsletter subscription form (Form 2)

---

## Destinations (`/destinations`)

- Dynamic destination cards
- Continent filter, text search, and max-price filter
- Data fetched from `/api/destinations`

---

## Tours (`/tours`)

- Travel package listings with pricing, duration, and group size
- Category filter
- Data fetched from `/api/tours`

---

## Gallery (`/gallery`)

- Masonry-style responsive gallery
- Category filtering
- Data fetched from `/api/gallery`

---

## Blog (`/blog`)

- Travel articles with excerpts and read-time indicators
- Search and category filters
- Data fetched from `/api/posts`

---

## Booking (`/booking`)

### Form 1 — Trip Booking Form

Fields:

- Full name
- Email address
- Phone number
- Destination
- Travel date / Return date
- Number of travelers
- Room type
- Special requests

Validation:

- Required field checks
- Email regex
- Phone regex
- Date order (return must be after departure)
- Traveler count range (1–12)

Submissions are saved permanently to the PostgreSQL database via Prisma.

---

# 5. Form validation details

## Client-side (React)

- Runs on input change, blur, and submit
- Checks: empty fields, email format, phone format, date logic, numeric ranges

## Server-side (Express)

Validation is re-applied in the backend route so the API cannot be bypassed.

Invalid requests return:

```json
{
  "error": "Validation failed",
  "errors": {
    "email": "A valid email address is required"
  }
}
```

---

# 6. API endpoints

| Method | Route                   | Description                         |
| ------ | ----------------------- | ----------------------------------- |
| GET    | `/api/health`           | Server health check                 |
| GET    | `/api/destinations`     | List destinations (filterable)      |
| GET    | `/api/destinations/:id` | Single destination                  |
| GET    | `/api/tours`            | List tours (filterable by category) |
| GET    | `/api/gallery`          | List gallery images                 |
| GET    | `/api/posts`            | List blog posts (filterable)        |
| POST   | `/api/bookings`         | Submit a booking (saved to DB)      |
| GET    | `/api/bookings`         | List all bookings                   |
| POST   | `/api/newsletter`       | Subscribe to newsletter (saved to DB) |
| GET    | `/api/newsletter`       | List all subscribers                |

---

# 7. Database

The project uses **PostgreSQL** with **Prisma ORM**.

### Models

**Booking** — stores travel booking submissions:

| Field          | Type     |
| -------------- | -------- |
| id             | Int (PK) |
| reference      | String (unique, e.g. WND-1A2B3C) |
| fullName       | String   |
| email          | String   |
| phone          | String   |
| destination    | String   |
| travelDate     | String   |
| returnDate     | String   |
| travelers      | Int      |
| roomType       | String   |
| specialRequests| String   |
| createdAt      | DateTime |

**Subscriber** — stores newsletter signups:

| Field       | Type     |
| ----------- | -------- |
| id          | Int (PK) |
| email       | String (unique) |
| name        | String   |
| subscribedAt| DateTime |

### Prisma Studio (visual DB browser)

```bash
npx prisma studio
```

---

# 8. JSON data system

Static content is served from `server/data/` JSON files. This keeps the backend simple while still demonstrating a real data layer through the API.

| File                  | Content                                      |
| --------------------- | -------------------------------------------- |
| `destinations.json`   | 10+ destinations with name, country, price, rating, tags |
| `tours.json`          | Tour packages with highlights and inclusions |
| `gallery.json`        | Gallery images with categories and sizing    |
| `posts.json`          | Blog articles with author, tags, and body    |

---

# 9. Responsive design

Tested on desktop, tablet, and mobile.

- Bootstrap 5 grid system
- Collapsible mobile navigation
- Flexible masonry gallery
- Custom CSS breakpoints for cards and forms

---

# 10. Tech stack

## Frontend

- React 18
- React Router v6
- Bootstrap 5 + Bootstrap Icons
- Vite (dev server + bundler)
- CSS3 / HTML5

## Backend

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL

### How the layers fit together

```
Node.js  →  Express.js  →  Prisma ORM  →  PostgreSQL
(runtime)   (routing)      (query builder)  (database)
```

- **Node.js** runs JavaScript on the server.
- **Express.js** defines HTTP routes and handles requests/responses.
- **Prisma** translates JavaScript method calls into SQL queries (e.g. `prisma.booking.create()` becomes `INSERT INTO "Booking" ...`).
- **PostgreSQL** stores all persistent data (bookings and newsletter subscribers).
