-- Run this once to set up the Wanderly database
-- psql -U <user> -d <dbname> -f setup.sql

CREATE TABLE IF NOT EXISTS users (
  id       SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  email    TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,          -- stored plaintext (vulnerable by design)
  role     TEXT NOT NULL DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS destinations (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  country     TEXT NOT NULL,
  description TEXT,
  price       INT,
  duration    TEXT,
  image       TEXT
);

CREATE TABLE IF NOT EXISTS posts (
  id         SERIAL PRIMARY KEY,
  title      TEXT NOT NULL,
  excerpt    TEXT,
  body       TEXT,
  author     TEXT,
  image      TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comments (
  id         SERIAL PRIMARY KEY,
  post_id    INT REFERENCES posts(id) ON DELETE CASCADE,
  username   TEXT,
  body       TEXT,               -- stored raw, no sanitization (vulnerable by design)
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed admin user (plaintext password, vulnerable by design)
INSERT INTO users (username, email, password, role) VALUES
  ('admin', 'admin@wanderly.com', 'admin123', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Seed destinations
INSERT INTO destinations (name, country, description, price, duration, image) VALUES
  ('Bali',        'Indonesia', 'Tropical paradise with stunning temples and rice terraces.',      1200, '7 days',  'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800'),
  ('Paris',       'France',    'The city of love, art, and world-class cuisine.',                 1800, '5 days',  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800'),
  ('Santorini',   'Greece',    'Iconic white-washed buildings perched over the Aegean Sea.',     2100, '6 days',  'https://images.unsplash.com/photo-1507501336603-6760d5ebb116?w=800'),
  ('Tokyo',       'Japan',     'Where ancient tradition meets cutting-edge modernity.',           2400, '8 days',  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800'),
  ('Machu Picchu','Peru',      'Ancient Incan citadel set high in the Andes Mountains.',         1600, '7 days',  'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800'),
  ('Masai Mara',  'Kenya',     'Witness the great migration across the Masai Mara savannah.',    3200, '10 days', 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800')
ON CONFLICT DO NOTHING;

-- Seed blog posts
INSERT INTO posts (title, excerpt, body, author, image) VALUES
  (
    'Top Hidden Gems in Southeast Asia',
    'Discover roads less traveled — from misty mountain villages to untouched coastlines.',
    'Southeast Asia is full of hidden gems waiting to be discovered. From the misty highlands of northern Vietnam to the secret beaches of the Philippines, there is always something new to explore. The key is to get off the beaten path and venture beyond the tourist hotspots. Talk to locals, take the slow train, and let serendipity be your guide.',
    'Sarah Chen',
    'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800'
  ),
  (
    'How to Travel on a Budget Without Sacrificing Experience',
    'Smart strategies for seeing the world without draining your bank account.',
    'Traveling on a budget does not mean cutting corners on experience. With the right planning and mindset, you can see the world''s most amazing places without spending a fortune. Book flights on Tuesday afternoons, stay in locally-owned guesthouses, eat where the locals eat, and use public transport. The memories you make will be richer for it.',
    'Marco Rivera',
    'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800'
  ),
  (
    'A Week in Kyoto: The Complete Guide',
    'From bamboo forests to ancient tea ceremonies — everything you need for the perfect Kyoto trip.',
    'Kyoto is a city that deserves more than a day trip. Spend a week here and you will begin to understand why it captivates travelers from around the world. Start with Fushimi Inari at dawn before the crowds arrive. Spend an afternoon in Arashiyama. Book a tea ceremony in Gion. Rent a bicycle to explore the Philosopher''s Path. Take the train to Nara for the day. Let the city unfold slowly.',
    'Emma Thompson',
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800'
  )
ON CONFLICT DO NOTHING;
