<<<<<<< HEAD
# 🐾 Pawcare — Digital Animal Record & Adoption System

A full-stack, cloud-based web application for managing rescued animals, health records, adoptions, and data integrity via AI + Blockchain simulation.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ installed
- MongoDB running locally (or MongoDB Atlas account)
- PowerShell or Command Prompt

---

## ⚙️ Setup Instructions

### 1. Setup Backend

```powershell
cd "backend"
# Install dependencies
node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" install
```

**Configure environment** — Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/pawcare
JWT_SECRET=pawcare_super_secret_jwt_key_2024
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

**Seed sample data** (optional):
```powershell
node seed.js
```

**Start backend server:**
```powershell
node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run dev
# OR: node server.js
```

Backend runs at: **http://localhost:5000**

---

### 2. Setup Frontend

```powershell
cd "../frontend"
# Install dependencies (already done if you followed setup)
node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" install

# Start dev server
node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run dev
```

Frontend runs at: **http://localhost:5173**

---

## 🧪 Test Accounts (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@pawcare.com | admin123 |
| Staff | staff@pawcare.com | staff123 |
| Adopter | adopter@pawcare.com | adopter123 |

---

## 📁 Project Structure

```
pawcare project/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── controllers/              # Business logic
│   │   ├── authController.js
│   │   ├── animalController.js
│   │   └── adoptionController.js
│   ├── middleware/               # Express middleware
│   │   ├── auth.js               # JWT verification
│   │   ├── roleGuard.js          # Role-based access
│   │   └── upload.js             # Multer image upload
│   ├── models/                   # Mongoose schemas
│   │   ├── User.js
│   │   ├── Animal.js
│   │   └── Adoption.js
│   ├── modules/                  # Feature modules
│   │   ├── aiModule.js           # AI recommendations + reminders
│   │   └── blockchainModule.js   # Hash-linked blockchain sim
│   ├── routes/                   # Express routers
│   │   ├── authRoutes.js
│   │   ├── animalRoutes.js
│   │   ├── adoptionRoutes.js
│   │   └── blockchainRoutes.js
│   ├── uploads/                  # Animal photos (auto-created)
│   ├── blockchain_ledger.json    # Persisted blockchain (auto-created)
│   ├── seed.js                   # Sample data seeder
│   ├── server.js                 # Entry point
│   └── .env                      # Environment config
│
└── frontend/
    └── src/
        ├── api/axios.js          # API client
        ├── context/AuthContext.jsx
        ├── components/           # Reusable UI components
        │   ├── Navbar.jsx
        │   ├── AnimalCard.jsx
        │   └── ProtectedRoute.jsx
        ├── pages/                # Application pages
        │   ├── Login.jsx
        │   ├── Signup.jsx
        │   ├── Dashboard.jsx
        │   ├── Animals.jsx
        │   ├── AddAnimal.jsx
        │   ├── AnimalDetail.jsx
        │   ├── Adoptions.jsx
        │   └── Blockchain.jsx
        └── styles/global.css     # Design system
```

---

## 🌐 API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | ❌ | Register new user |
| POST | /api/auth/login | ❌ | Login, returns JWT |
| GET | /api/auth/me | ✅ | Get current user |
| PUT | /api/auth/preferences | ✅ | Update AI preferences |

### Animals
| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | /api/animals | ❌ | All | List animals (filterable) |
| GET | /api/animals/:id | ❌ | All | Single animal |
| POST | /api/animals | ✅ | Admin, Staff | Add animal (with image) |
| PUT | /api/animals/:id | ✅ | Admin, Staff | Update animal |
| DELETE | /api/animals/:id | ✅ | Admin | Delete animal |
| POST | /api/animals/:id/vaccinations | ✅ | Admin, Staff | Add vaccination |
| POST | /api/animals/recommend | ✅ | All | AI recommendations |
| GET | /api/animals/reminders | ✅ | Admin, Staff | Vaccination reminders |

### Adoptions
| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | /api/adoptions | ✅ | All* | List adoptions |
| POST | /api/adoptions | ✅ | Adopter | Apply for adoption |
| GET | /api/adoptions/:id | ✅ | All* | Single adoption |
| PUT | /api/adoptions/:id/status | ✅ | Admin, Staff | Approve/Reject |

*Adopters see only their own

### Blockchain
| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | /api/blockchain/log | ✅ | Admin, Staff | Full ledger |
| GET | /api/blockchain/verify | ✅ | Admin | Verify integrity |

---

## 🧠 AI Module

Located at `backend/modules/aiModule.js`:

- **recommendAnimals(animals, preferences)** — Rule-based scoring system that matches available animals to user preferences (species, age range, experience level)
- **getVaccinationReminders(animals, daysAhead)** — Finds animals with vaccinations due within N days, with urgency levels (overdue, urgent, soon, upcoming)

---

## 🔗 Blockchain Module

Located at `backend/modules/blockchainModule.js`:

- **SHA-256 hashing** of each block's content
- **Linked blocks** — each block stores the previous block's hash
- **Persistent storage** to `blockchain_ledger.json`
- **Integrity verification** — recalculates and compares all hashes
- Events recorded: Animal Registration, Updates, Vaccinations, Adoption Applications, Confirmations, Rejections

---

## 🗄️ Database Schemas

### User
```json
{ "name": "string", "email": "string", "password": "hashed",
  "role": "admin|staff|adopter", "preferences": { "species": "string", "ageRange": "string" } }
```

### Animal
```json
{ "name": "string", "species": "dog|cat|bird|rabbit|other",
  "breed": "string", "age": { "value": 3, "unit": "years" },
  "gender": "male|female|unknown", "healthStatus": "healthy|recovering|critical|under-treatment",
  "vaccinations": [{ "name": "Rabies", "date": "...", "nextDue": "..." }],
  "adoptionStatus": "available|pending|adopted", "image": "filename.jpg",
  "blockchainHash": "sha256hash" }
```

### Adoption
```json
{ "animal": "ObjectId", "applicant": "ObjectId",
  "status": "pending|approved|rejected",
  "message": "string", "homeType": "string",
  "hasOtherPets": false, "hasChildren": false,
  "experience": "first-time|some-experience|experienced",
  "reviewedBy": "ObjectId", "reviewNotes": "string" }
```

---

## 🎨 Features Overview

| Feature | Details |
|---|---|
| 🔐 Authentication | JWT + bcrypt, 3 roles (Admin, Staff, Adopter) |
| 🐾 Animal Records | Full CRUD with image upload, health, vaccinations |
| 🏠 Adoptions | Apply → Review → Approve/Reject workflow |
| 🤖 AI Matching | Rule-based scoring for 5 preference dimensions |
| 💉 Reminders | Vaccination due-date tracking with urgency |
| 🔗 Blockchain | SHA-256 hash-linked immutable event ledger |
| 📱 Responsive | Mobile-friendly dark mode UI |

---

## 🎨 Design

- **Theme**: Dark mode with teal/purple gradient accents
- **Typography**: Inter + Outfit (Google Fonts)
- **Effects**: Glassmorphism, smooth animations, hover effects
- **Components**: Card system, badges, modals, filter bars

---

## 🔧 Troubleshooting

| Issue | Solution |
|---|---|
| MongoDB connection fails | Start MongoDB service or check MONGO_URI |
| Port already in use | Change PORT in .env |
| CORS errors | Ensure CLIENT_URL matches frontend URL |
| Images not loading | Check uploads/ directory exists |
| npx won't run | Use `node "path/to/npm-cli.js"` instead |
=======
# Pawcare
Animal Shelter Management System(pawcare)
>>>>>>> 6bcc7dcce7b6d5bba5ef0c9b93e5642963757d02
