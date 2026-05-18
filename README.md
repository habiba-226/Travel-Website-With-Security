# Wanderly — Travel Website

A fully responsive full-stack travel website built with **React.js** (frontend), **Node.js / Express** (backend), and **PostgreSQL + Prisma ORM** (database).

Wanderly focuses on the idea of **Slow Travel** — encouraging travelers to explore destinations deeply and meaningfully instead of rushing through trips.

The project demonstrates modern web development concepts including:

- React Router
- REST APIs
- Form validation
- Authentication
- Database integration
- Responsive UI/UX design

---

# 1. Project structure

```bash
wanderly/
├── client/                           # React frontend (Vite)
│   ├── public/
│   │   └── favicon.svg
│   │
│   ├── src/
│   │   ├
│   │   │
│   │   ├── components/
│   │   │   ├── Navbar.jsx            ←  navigation bar
│   │   │   ├── Footer.jsx            ←  footer
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx              ← hero + featured + newsletter
│   │   │   ├── Destinations.jsx      ← destinations grid
│   │   │   ├── Tours.jsx             ← tours & packages
│   │   │   ├── Gallery.jsx           ← travel gallery
│   │   │   ├── Blog.jsx              ← travel articles
│   │   │   ├── Booking.jsx           ← booking form
│   │   │   ├── Login.jsx             ← user login
│   │   │   └── Signup.jsx            ← user registration
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
│   │   └── index.css                 ← global styles
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                           # Node.js / Express backend
│   ├── prisma/
│   │   ├── schema.prisma             ← Prisma database schema
│   │   └── migrations/
│   │
│   ├── routes/
│   │   ├── destinations.js           ← GET destinations API
│   │   ├── bookings.js               ← booking APIs
│   │   ├── gallery.js               ← booking APIs
│   │   ├── newsletter.js             ← newsletter APIs
│   │   ├── auth.js                   ← login/signup routes
│   │   ├── tours.js                  ← tours API
│   │   └── posts.js                  ← blog API
│   │
│   │
│   ├── data/                         # JSON data storage
│   │   ├── destinations.json         ← destinations data
│   │   ├── tours.json                ← tours & packages data
│   │   ├── gallery.json              ← gallery images data
│   │   └── posts.json                ← blog posts data
│   │
│   │
│   ├── middleware/
│   │   ├── auth.js
│   │
│   │
│   ├── server.js                     ← Express entry point
│   ├── package.json
│   └── .env
│
├── README.md
└── package.json
```

---

# 2. How to run

You will need:

- **Node.js 18+**
- **PostgreSQL**
- **Prisma ORM**

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
DATABASE_URL="postgresql://username:password@localhost:5432/wanderly"
PORT=5000
JWT_SECRET=your_secret_key
```

---

## Step 5 — Run Prisma migration

```bash
npx prisma migrate dev
```

---

## Step 6 — Start the backend server

```bash
npm start
```

The backend API will run on:

```bash
http://localhost:5000
```

Test the API:

```bash
http://localhost:5000/api/destinations
```

---

## Step 7 — Start the frontend (new terminal)

```bash
cd client
npm run dev
```

Open the Vite URL shown in the terminal (usually):

```bash
http://localhost:5173
```

The frontend automatically communicates with the backend API.

---

# 3. Features mapped to project requirements

| Requirement                | Where it's implemented                                           |
| -------------------------- | ---------------------------------------------------------------- |
| **React.js frontend**      | Entire `client/` folder                                          |
| **Node.js backend**        | `server/server.js` using Express                                 |
| **Database integration**   | PostgreSQL + Prisma ORM                                          |
| **Responsive design**      | Bootstrap grid + custom media queries                            |
| **Multiple pages**         | Home, Destinations, Tours, Gallery, Blog, Booking, Login, Signup |
| **Consistent navigation**  | Navbar + Footer components                                       |
| **Minimum 2 forms**        | Booking form + Newsletter form                                   |
| **Authentication system**  | Login + Signup pages                                             |
| **Client-side validation** | React validation functions                                       |
| **Server-side validation** | Express validation middleware                                    |
| **REST API integration**   | Backend API routes                                               |
| **Dynamic travel content** | JSON datasets inside `server/data/`                              |

---

# 4. JSON data system

The backend includes a dedicated `data/` folder containing structured JSON files used as a lightweight content management system.

## destinations.json

Stores destination information including:

- Destination name
- Country
- Continent
- Pricing
- Ratings
- Tags
- Descriptions
- Images

Example destinations:

- Santorini
- Kyoto
- Marrakech
- Cairo
- Bali
- Banff

---

## tours.json

Stores travel package information including:

- Tour title
- Destination
- Pricing
- Group size
- Difficulty
- Tour highlights
- Included/excluded services

Example tours:

- Greek Island Hopper
- Japan in Bloom
- Northern Lights & Glaciers
- Bali Wellness Retreat

---

## gallery.json

Stores responsive gallery image data including:

- Image title
- Location
- Category
- Dynamic image sizing
- Unsplash image URLs

Gallery categories:

- Nature
- Culture
- Islands
- Mountains
- Desert

---

## posts.json

Stores blog post content including:

- Article title
- Slug
- Author information
- Read time
- Excerpts
- Tags
- Full article body

Example blog topics:

- Slow travel philosophy
- Kyoto travel guide
- Iceland packing tips
- Sahara winter travel
- Bali off-season travel

---

# 5. Pages

## Home (`/`)

- Hero section with CTA buttons
- Featured destinations
- Slow travel introduction
- Newsletter subscription form

---

## Destinations (`/destinations`)

- Dynamic destination cards
- Search and filtering
- Responsive destination grid
- Data fetched from `/api/destinations`

---

## Tours (`/tours`)

- Travel package listings
- Pricing and duration information
- Tour highlights
- Dynamic tour cards

---

## Gallery (`/gallery`)

- Masonry-style responsive gallery
- Dynamic image rendering
- Category filtering
- Mobile-friendly layout

---

## Blog (`/blog`)

- Dynamic travel articles
- Blog cards with excerpts
- Read-time indicators
- Travel guides and tips

---

## Booking (`/booking`)

### Form #1 — Trip Booking Form

Includes:

- Full name
- Email
- Phone number
- Number of travelers
- Destination selection
- Travel dates
- Special requests

Validation includes:

- Required fields
- Email regex validation
- Date validation
- Character limits

---

## Login (`/login`)

### Form #2 — Login Form

- Email validation
- Password validation
- Authentication handling

---

## Signup (`/signup`)

### Form #3 — Registration Form

- User registration
- Password confirmation
- Form validation

---

# 6. Form validation details

## Client-side validation (React)

Validation runs:

- On blur
- On input change
- On submit

Checks include:

- Empty fields
- Email formatting
- Password length
- Valid dates
- Character limits

---

## Server-side validation (Express)

Validation rules are re-applied in backend routes to prevent bypassing frontend validation.

Invalid requests return:

```json
{
  "errors": {
    "email": "Invalid email format"
  }
}
```

---

# 7. API endpoints

| Method | Route                   | Description          |
| ------ | ----------------------- | -------------------- |
| GET    | `/api/health`           | Server health check  |
| GET    | `/api/destinations`     | Fetch destinations   |
| GET    | `/api/destinations/:id` | Single destination   |
| GET    | `/api/tours`            | Fetch tours/packages |
| GET    | `/api/gallery`          | Fetch gallery images |
| GET    | `/api/posts`            | Fetch blog posts     |
| POST   | `/api/bookings`         | Create booking       |
| GET    | `/api/bookings`         | View bookings        |
| POST   | `/api/newsletter`       | Newsletter signup    |
| POST   | `/api/auth/signup`      | Register user        |
| POST   | `/api/auth/login`       | Login user           |

---

# 8. Database integration

The project uses:

- PostgreSQL database
- Prisma ORM
- Prisma migrations
- Prisma Studio

Open Prisma Studio:

```bash
npx prisma studio
```

---

# 9. Responsive design

Tested on:

- Desktop
- Tablet
- Mobile devices

Responsive features:

- Bootstrap grid system
- Mobile navigation menu
- Flexible gallery layouts
- Custom CSS breakpoints
- Responsive cards and forms

---

# 10. Tech stack summary

## Frontend

- React.js
- React Router
- Bootstrap 5
- HTML5
- CSS3
- JavaScript (ES6)
- Vite

---

## Backend

- Node.js
- Express.js
- Prisma ORM
- JWT Authentication
- REST API Architecture

### How the backend layers fit together

```
Node.js (runtime — executes the server code)
  └── Express.js (web framework — handles HTTP routes and middleware)
        └── Prisma ORM (database helper — translates JavaScript into SQL queries)
              └── PostgreSQL (the actual database — stores users, bookings, tokens)
```

**Node.js** is the runtime that runs JavaScript on the server.
**Express.js** is a framework built on top of Node.js that makes it easy to define routes and handle requests.
**Prisma** is a library (not a separate runtime) that runs inside Node.js. Instead of writing raw SQL like `SELECT * FROM users WHERE email = ?`, you write JavaScript like `prisma.user.findUnique({ where: { email } })`. It is just a Node.js package — the backend is still Node.js.
**PostgreSQL** is the database that stores all persistent data.

---

## Database

- PostgreSQL

---

## Data Management

- JSON-based content system
- RESTful API endpoints
- Dynamic frontend rendering
