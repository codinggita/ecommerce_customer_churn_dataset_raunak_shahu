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
- **Phase 1: Backend Development** - Implementation of database models, security features, CRUD operations, statistics endpoints, analytics pipelines, role protection middlewares, and Postman API collection.
- **Phase 2: Frontend Development** - UI development, React components integration, state management, dashboard analytics charts, and deployment configuration.

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
- **Source:** E-Commerce Customer Churn Dataset (`ecommerce_customer_churn_dataset.json`)
- **Format:** JSON
- **Records Count:** 15,259 customer documents

### Detailed Data Field Structure:
- **Demographics:**
  - `name`: Synthetically generated full name of the customer
  - `email`: Synthetically generated unique email address
  - `age`: Customer age (Integer)
  - `gender`: Gender values (`Male`, `Female`, `Other`)
  - `country`: Country of residence (e.g., USA, UK, Canada, Germany)
  - `city`: City name
- **Customer Behavior:**
  - `membershipYears`: Years of membership (Decimal/Integer)
  - `loginFrequency`: Average number of logins per month
  - `sessionDuration`: Average session duration in minutes
  - `pagesPerSession`: Average pages browsed per session
  - `cartAbandonmentRate`: Percentage of abandoned shopping carts
  - `wishlistItems`: Count of items in customer's wishlist
  - `daysSinceLastPurchase`: Days since customer last placed an order
  - `mobileUsage`: Average mobile app usage minutes per month
- **Financial Metrics:**
  - `purchases`: Total purchases made
  - `averageOrderValue`: Average order spending value
  - `discountRate`: Average discount rate utilized
  - `returnsRate`: Product returns rate
  - `creditBalance`: Available credit balance
  - `lifetimeValue` (LTV): Total calculated customer lifetime value
- **Engagement Indicators:**
  - `emailOpenRate`: Email open rate percentage
  - `customerServiceCalls`: Customer service interaction calls count
  - `productReviewsWritten`: Total reviews written by the customer
  - `socialMediaEngagementScore`: Score measuring social media engagement (0 to 100)
- **Metadata and Targets:**
  - `churned`: Target binary variable (`0` for Active Customer, `1` for Churned Customer)
  - `signupQuarter`: Fiscal quarter when customer signed up (`Q1`, `Q2`, `Q3`, `Q4`)
  - `isDeleted`: Soft delete flag (`true` if deleted, default `false`)

*Note: Since the raw source dataset does not contain name or email parameters, the database seeding script dynamically generates a unique full name and email for every document to support correct profile CRUD operations.*

## 📂 9. Entire Project Folder Structure with All Files

```text
ecommerce_customer_churn_dataset_raunak_shahu/
├── README.md
└── backend/
    ├── .env
    ├── .env.example
    ├── .gitignore
    ├── ecommerce_customer_analytics.postman_collection.json
    ├── package-lock.json
    ├── package.json
    ├── server.js
    ├── config/
    │   ├── constants.js
    │   └── database.js
    ├── controllers/
    │   ├── analyticsController.js
    │   ├── authController.js
    │   ├── customerController.js
    │   ├── jwtController.js
    │   ├── searchController.js
    │   └── statsController.js
    ├── data/
    │   └── ecommerce_customer_churn_dataset.json
    ├── logs/
    ├── middlewares/
    │   ├── authMiddleware.js
    │   ├── errorMiddleware.js
    │   ├── loggingMiddleware.js
    │   ├── rateLimitMiddleware.js
    │   ├── uploadMiddleware.js
    │   └── validationMiddleware.js
    ├── models/
    │   ├── Customer.js
    │   ├── index.js
    │   └── User.js
    ├── routes/
    │   ├── analyticsRoutes.js
    │   ├── authRoutes.js
    │   ├── customerRoutes.js
    │   ├── index.js
    │   ├── jwtRoutes.js
    │   ├── middlewareRoutes.js
    │   ├── searchRoutes.js
    │   └── statsRoutes.js
    ├── scripts/
    │   └── importDataset.js
    ├── services/
    │   ├── analyticsService.js
    │   ├── authService.js
    │   ├── customerService.js
    │   └── statsService.js
    ├── uploads/
    ├── utils/
    │   ├── apiResponse.js
    │   ├── filterBuilder.js
    │   ├── generateToken.js
    │   ├── paginationHelper.js
    │   └── seedDatabase.js
    └── validations/
        ├── authValidation.js
        ├── customerValidation.js
        └── index.js
```

## 🌐 10. API Endpoints Overview (Major Categories)

| Category | Description |
| :--- | :--- |
| **CRUD Operations** | Create, read, update, delete customers |
| **Customer Info** | Filter by country, city, gender, age, status |
| **Search** | Case-insensitive search across fields |
| **Analytics** | Aggregation pipelines for insights |
| **Statistics** | Counts, averages, min/max values |
| **Authentication** | Register, login, profile management |
| **JWT Protected** | Token-based secure routes |

## 🎯 11. Deliverables
- ✅ Complete backend with all APIs
- ✅ Postman collection for testing
- ✅ Frontend dashboard (Phase 2)
- ✅ README documentation
- ✅ Deployment-ready code

## 🎓 12. College Project Information
- **Assignment:** Full Stack Project
- **Technology:** MERN Stack
