<<<<<<< HEAD
# 🎰 RoyalBet Casino Platform

A full-stack production-ready online casino platform with 20+ games, real-time communication, coin wallet system, and an admin panel.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Zustand |
| Game Rendering | HTML5 Canvas + CSS Animations |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Real-time | Socket.io |
| Auth | JWT + bcrypt |
| Admin Charts | Recharts |

---

## 🎮 20 Games

| # | Game | Type | Description |
|---|------|------|-------------|
| 1 | ✈️ Aviator | Crash | Plane flies with rising multiplier – cash out before crash |
| 2 | 🚀 Crash Rocket | Crash | Rocket multiplier crash game |
| 3 | 🎨 Color Prediction | Prediction | Predict color/number on a spinning wheel |
| 4 | 🎡 Roulette | Casino | European roulette with canvas wheel + ball physics |
| 5 | 🃏 Blackjack | Cards | Classic 21 with deal/hit/stand/double animations |
| 6 | 🎴 Baccarat | Casino | Punto Banco with natural hand detection |
| 7 | ♠️ Teen Patti | Indian | 3-card Indian poker with chaal/fold/show |
| 8 | 🎯 Andar Bahar | Indian | Animated card dealing match game |
| 9 | ♣️ Poker | Cards | 5-card hand rankings with preflop/flop/showdown |
| 10 | 🎰 Slot Machine | Slots | Canvas spinning reels with 8-symbol pay table |
| 11 | 🐉 Dragon Tiger | Casino | Single-card high/low with flip animation |
| 12 | 🎲 Sic Bo | Dice | 3-dice game with animated rolling dice |
| 13 | ⚀ Dice | Dice | Roll over/under with adjustable target slider |
| 14 | 🎡 Lucky Wheel | Arcade | Canvas prize wheel with deceleration physics |
| 15 | 💎 Mines | Arcade | 25-tile grid: find gems, avoid mines, cashout anytime |
| 16 | ⚡ Plinko | Arcade | Full ball-drop physics simulation with pegs |
| 17 | 🐔 Chicken Road | Arcade | Canvas road crossing with fire tiles |
| 18 | 🗼 Tower | Arcade | Climb 10-level tower, avoid bombs |
| 19 | 📈 Hi-Lo | Cards | Higher or lower card streak with multiplier |
| 20 | 🎪 Spin & Win | Slots | CSS animated prize wheel |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & Install

```bash
git clone <repo>
cd casino-platform

# Install all dependencies
npm run install:all
```

### 2. Configure Environment

Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/casino_platform
JWT_SECRET=your_super_secret_key_here
ADMIN_SECRET=your_admin_secret_here
```

### 3. Start MongoDB

```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas (update MONGO_URI in .env)
```

### 4. Start All Services

```bash
# Start all 3 services concurrently
npm install        # install concurrently
npm run dev

# Or start individually:
npm run dev:backend    # http://localhost:5000
npm run dev:frontend   # http://localhost:3000
npm run dev:admin      # http://localhost:3001
```

### 5. Create Admin Account

```bash
# After backend is running:
curl -X POST http://localhost:5000/api/admin/create \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@royalbet.com","password":"admin123","adminSecret":"admin_panel_secret_key"}'
```

---

## 📁 Project Structure

```
casino-platform/
├── frontend/                    # React + Vite player app
│   └── src/
│       ├── components/          # Layout, Header, Sidebar, BetPanel
│       ├── games/               # All 20 game components
│       ├── pages/               # Home, Login, Signup, Dashboard, Lobby
│       ├── store/               # Zustand state management
│       └── styles/              # Global CSS
│
├── backend/                     # Node.js + Express API
│   ├── controllers/             # authController, betController, walletController, adminController
│   ├── middleware/              # JWT auth middleware
│   ├── models/                  # User, Bet, WalletTransaction
│   ├── routes/                  # auth, wallet, bets, admin
│   └── server.js               # Main entry with Socket.io
│
├── admin-panel/                 # React admin dashboard
│   └── src/
│       ├── components/          # AdminLayout
│       └── pages/               # Dashboard, Users, UserDetail, BetHistory, Login
│
└── scripts/
    └── createAdmin.js           # Admin account creation helper
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register (gets 1000 coins) |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Wallet
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wallet/balance` | Get balance |
| GET | `/api/wallet/transactions` | Transaction history |

### Bets
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bets/place` | Place a bet |
| POST | `/api/bets/settle` | Settle bet result |
| GET | `/api/bets/history` | Bet history |
| GET | `/api/bets/stats` | Player stats |

### Admin (requires admin JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Platform stats |
| GET | `/api/admin/users` | All users |
| GET | `/api/admin/users/:id` | Single user |
| POST | `/api/admin/users/:id/add-coins` | Add coins |
| POST | `/api/admin/users/:id/remove-coins` | Remove coins |
| POST | `/api/admin/users/:id/reset-wallet` | Reset wallet |
| PATCH | `/api/admin/users/:id/block` | Toggle block |
| GET | `/api/admin/bets` | All bets |

---

## 💰 Coin Wallet System

- New users receive **1,000 free coins** on signup
- All games deduct coins before play begins
- Wins are credited instantly to balance
- No real money involved — coins only
- Admin can add/remove/reset any user's wallet

---

## 🔒 Security Features

- JWT tokens with 7-day expiry
- bcrypt password hashing (12 rounds)
- Rate limiting on all API routes (300 req/15min)
- Helmet security headers
- Blocked user detection on every request
- Admin-only route protection

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary Gold | `#c9a227` |
| Background | `#0a0a0f` |
| Card BG | `#16161f` |
| Green (Win) | `#00d084` |
| Red (Loss) | `#ff4444` |
| Font Display | Cinzel (serif) |
| Font Body | Outfit (sans) |

---

## 📝 Notes

- The platform runs fully offline — no external payment APIs needed
- Socket.io is ready for live multiplayer features (aviator sync, etc.)
- All games use client-side RNG — for production, move RNG to backend
- The `betAmount` deduction in games uses local Zustand state; for production, always validate on the server before deducting

## New Hierarchy Panels (v20)

### Ports
| Panel | Port | Role |
|-------|------|------|
| Frontend (User) | 3000 | Players |
| Admin Panel | 3001 | Admin |
| Supermaster Panel | 3002 | Supermaster |
| Master Panel | 3003 | Master |
| Agent Panel | 3004 | Agent |

### Hierarchy
Supermaster → Master → Agent → User

### Create First Supermaster
```bash
curl -X POST http://localhost:5000/api/hierarchy/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{"username":"supermaster1","emailOrPhone":"super@royalbet.com","password":"super123","role":"supermaster","commissionRate":20}'
```

### Start All Panels
```bash
npm run dev:supermaster  # port 3002
npm run dev:master       # port 3003
npm run dev:agent        # port 3004
```
=======
# casino-platform
RoyalBet Casino Platform
>>>>>>> f92a28be5b876faeb8b2cf7698385554bf71c09f
