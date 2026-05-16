# 📊 E-Commerce Customer Analytics Platform
**Full Stack MERN Project (2026)**

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## 🚀 1. Project Overview
- Full stack application for customer analytics with advanced filtering, sorting, pagination, and aggregation.
- **Backend:** Node.js + Express.js + MongoDB + JWT Authentication
- **Frontend:** React + Vite + Tailwind CSS + MUI + Redux Toolkit

## ⚙️ 2. Features (Backend)
- 🗄️ **Full CRUD operations** for customer management
- 🔍 **Advanced filtering** (country, city, gender, age, signup quarter)
- 📈 **Sorting on all fields** (age, purchases, lifetime value, credit balance, etc.)
- 📄 **Pagination** with limit/skip
- 🔎 **Case-insensitive search** using regex
- 📊 **MongoDB aggregation pipelines** for analytics
- 🔒 **JWT authentication** (register, login, profile)
- 🛡️ **Role-based access control** (Admin/User)
- ✅ **Request validation middleware**
- 🛑 **Global error handling** with try-catch
- ⏱️ **API rate limiting**
- 📦 **Bulk operations** (create, update, delete)

## 🖥️ 3. Features (Frontend - coming in Phase 2)
- 🎛️ Admin Dashboard with sidebar navigation
- 👤 User Dashboard
- 🔐 Authentication flow (login/register)
- 📝 Customer management CRUD UI
- 📋 Data tables with sorting/pagination/filtering
- 📈 Analytics dashboard with charts
- ⚙️ Profile management
- 🌓 Dark/Light theme
- 📱 Fully responsive design

## 🛠️ 4. Technology Stack

### Backend:
- Node.js (v18+)
- Express.js (v4)
- MongoDB with Mongoose (v7+)
- JSON Web Tokens (JWT)
- bcryptjs for password hashing
- express-validator for input validation
- express-rate-limit for rate limiting
- morgan for logging
- helmet for security

### Frontend:
- React (v18+)
- Vite for build tool
- Tailwind CSS for styling
- Material-UI (MUI) components
- Redux Toolkit for state management
- Axios for API calls
- React Router DOM for routing
- Formik + Yup for forms

## 📅 5. Project Timeline
- **Backend Development:** 13 May 2026 – 28 May 2026 (15 Days)
- **Frontend Development:** 29 May 2026 – 13 June 2026 (15 Days)

## 🏗️ 6. Setup Instructions

### Prerequisites
- Node.js installed (v18 or higher)
- MongoDB installed locally or MongoDB Atlas account
- Git

### Backend Setup
```bash
# Clone repository
git clone <your-repo-url>
cd project/backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your MongoDB URI and JWT secret

# Seed the database with dataset
npm run seed

# Start development server
npm run dev
```

### Frontend Setup (Coming after backend completion)
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## 🔐 7. Environment Variables

Create a `.env` file in the backend directory with the following structure:

```text
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecommerce_analytics
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=7d
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## 📊 8. Dataset Information
**Source:** E-Commerce Customer Analytics Dataset  
**Format:** JSON

**Key Fields:**
- **Customer demographics:** name, email, age, gender, country, city
- **Purchase behavior:** purchases, averageOrderValue, lifetimeValue
- **Engagement metrics:** loginFrequency, sessionDuration, mobileUsage
- **Financial data:** creditBalance, discountRate
- **Loyalty metrics:** membershipYears, signupQuarter, churned

## 🌐 9. API Endpoints Overview (Major Categories)

| Category | Description |
| :--- | :--- |
| **CRUD Operations** | Create, read, update, delete customers |
| **Customer Info** | Filter by country, city, gender, age, status |
| **Search** | Case-insensitive search across fields |
| **Analytics** | Aggregation pipelines for insights |
| **Statistics** | Counts, averages, min/max values |
| **Authentication** | Register, login, profile management |
| **JWT Protected** | Token-based secure routes |

## 📂 10. Project Structure (Planned)

```text
backend/
├── config/          # Database, constants
├── models/          # Mongoose schemas
├── controllers/     # Request handlers
├── routes/          # API endpoints
├── middlewares/     # Auth, validation, error
├── services/        # Business logic
├── utils/           # Helpers, seed script
├── validations/     # Input validation
└── server.js        # Entry point

frontend/ (Coming soon)
├── components/      # Reusable UI
├── pages/           # Dashboard pages
├── features/        # Redux slices
├── services/        # API calls
└── App.jsx
```

## 🎯 11. Deliverables
- ✅ Complete backend with all APIs
- ✅ Postman collection for testing
- ✅ Frontend dashboard (Phase 2)
- ✅ README documentation
- ✅ Deployment-ready code

## 🎓 12. College Project Information
- **Assignment:** Full Stack Project 2026
- **Technology:** MERN Stack
- **Deadline:** 13 June 2026

## 📜 13. License
**MIT License** - Educational Purpose