# Personal Portfolio Website – Full Stack & Direct Email Integration

This project is a complete, production-ready full-stack portfolio website for **Mukkamalla Manasa Reddy**. It features a modern, responsive frontend (HTML, CSS, JavaScript) seamlessly integrated with a secure Node.js & Express.js backend that delivers contact messages directly to **`reddymanasa0271@gmail.com`** using **Nodemailer with Gmail SMTP**, while also persisting messages in MySQL.

---

## 📁 Project Structure

```text
manasa personal pertfolio/
├── frontend/
│   ├── index.html                # Portfolio markup (About Me, Education, Skills, Projects, Contact Me)
│   ├── style.css                 # Premium styles, animations, responsive design, spinner states
│   ├── script.js                 # Client-side validation, Fetch API integration, interactive UI
│   └── assets/                   # Profile photos and downloadable resume PDF
│       ├── profile.jpg
│       └── Manasa_Reddy_Resume.pdf
│
└── backend/
    ├── config/
    │   ├── db.js                 # MySQL connection pool and auto-migration check
    │   └── emailConfig.js        # Nodemailer Gmail SMTP transport (Port 465 SSL/TLS)
    ├── controllers/
    │   └── contactController.js  # Direct email delivery, MySQL logging, admin retrieval
    ├── database/
    │   └── schema.sql            # Database and contact_messages table creation script
    ├── middleware/
    │   ├── authMiddleware.js     # Timing-safe API Key authentication for admin endpoints
    │   └── errorHandler.js       # Centralized error handling & 404 handler
    ├── routes/
    │   └── contactRoutes.js      # Route definitions, rate limiting, and express-validator
    ├── .env                      # Local environment variables (kept private & git-ignored)
    ├── .env.example              # Configuration template with placeholder values
    ├── .gitignore                # Excludes node_modules and .env
    ├── package.json              # NPM dependencies and run scripts
    ├── server.js                 # Express application entry point & static file hosting
    └── test-api.js               # Automated end-to-end API test suite (10 scenarios)
```

---

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (Fetch API, responsive modern design).
- **Node.js & Express.js**: REST API server handling request validation and delivery.
- **Nodemailer**: Email service library communicating directly with Gmail SMTP over Port 465 SSL.
- **MySQL**: Relational database storing contact logs.
- **express-validator**: Server-side input validation and sanitization.
- **helmet**: Secure HTTP response headers.
- **express-rate-limit**: Rate limiting (10 requests per 15 min per IP) to mitigate spam and abuse.
- **dotenv**: Secure environment variable configuration.

---

## 📧 How Gmail SMTP & App Passwords Work

Google does **not** allow regular Gmail account passwords for SMTP automated sending due to security rules. Instead, Google requires a **16-character App Password**:

### Steps to Generate a Gmail App Password:
1. Log in to your Google Account: [https://myaccount.google.com/](https://myaccount.google.com/).
2. Click **Security** on the left menu.
3. Under *"How you sign in to Google"*, ensure **2-Step Verification** is turned **ON**. *(App passwords cannot be created without 2-Step Verification)*.
4. Search or go to **App passwords** ([https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)).
5. In the App name field, enter `Portfolio Website` and click **Create**.
6. Google displays a **16-character code** (e.g., `abcd efgh ijkl mnop`).
7. Copy this code (spaces can be removed) and paste it into `backend/.env`:
   ```env
   EMAIL_USER=your_sender_gmail@gmail.com
   EMAIL_APP_PASSWORD=abcdefghijklmnop
   CONTACT_RECEIVER=reddymanasa0271@gmail.com
   ```

---

## 📩 Email Format Received in Gmail

When a visitor submits the contact form, an email is delivered to **`reddymanasa0271@gmail.com`**:

- **From**: `"Portfolio Contact Form" <your_sender_gmail@gmail.com>`
- **To**: `reddymanasa0271@gmail.com`
- **Reply-To**: `visitor@example.com` *(When you click "Reply" in Gmail, it automatically addresses the visitor!)*
- **Subject**: `New Portfolio Contact Message` *(or includes visitor's subject)*
- **Body**:
  ```text
  Visitor Name: [Visitor's Name]
  Visitor Email: [Visitor's Email]

  Message:
  [Visitor's Message]

  Submitted At: [Submission Date and Time]
  ```

---

## 🚀 Step-by-Step Execution Guide

### Step 1: Open the Backend Directory
```bash
cd "c:\Users\M.MANASA REDDY\Desktop\manasa personal pertfolio\backend"
```

### Step 2: Configure Environment Variables
Inside `backend/.env`:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://127.0.0.1:5500

# Gmail SMTP Email Configuration
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_APP_PASSWORD=your_16_character_app_password
CONTACT_RECEIVER=reddymanasa0271@gmail.com

# Database (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Manasa@901
DB_NAME=portfolio_db
DB_CONNECTION_LIMIT=10

ALLOWED_ORIGINS=http://localhost:5500,http://127.0.0.1:5500,http://localhost:3000,http://localhost:5000,null
ADMIN_API_KEY=ManasaPortfolioAdminSecret2026!
```

### Step 3: Start the Backend Server
- **Development mode (with auto-reload):**
  ```bash
  npm run dev
  ```
- **Production mode:**
  ```bash
  npm start
  ```

### Step 4: Run the Portfolio Frontend
You have two easy options to view and test your website:

**Option A (Direct via Backend):**
Open your browser and navigate to:
`http://localhost:5000`

**Option B (VS Code Live Server):**
1. In VS Code, right-click `frontend/index.html`.
2. Select **Open with Live Server** (runs on `http://127.0.0.1:5500`).
3. CORS is already pre-configured to allow requests from Live Server to `http://localhost:5000`.

### Step 5: Run Automated Tests
```bash
npm test
```

---

## 📡 REST API Endpoints Specification

### 1. `GET /api/health`
Returns system status, MySQL connectivity, and email configuration status.
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "status": "healthy",
    "service": "portfolio-backend-api",
    "uptime": 240,
    "database": "connected",
    "emailService": {
      "recipient": "reddymanasa0271@gmail.com",
      "status": "configured"
    },
    "timestamp": "2026-10-28T08:35:00.000Z"
  }
  ```

### 2. `POST /api/contact`
Receives visitor details, validates input, rate-limits abuse, and dispatches the email via Gmail SMTP.
- **Sample Request**:
  ```json
  {
    "name": "Sarah Jenkins",
    "email": "sarah.jenkins@example.com",
    "subject": "Collaboration Inquiry",
    "message": "Hello Manasa, I would love to connect regarding an engineer opening."
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Your message has been sent successfully."
  }
  ```
- **Error Response (400 Bad Request - Validation Failed)**:
  ```json
  {
    "success": false,
    "message": "Validation failed. Please verify your inputs.",
    "errors": [
      { "field": "email", "message": "Please enter a valid email address." },
      { "field": "message", "message": "Message must be between 5 and 5000 characters." }
    ]
  }
  ```
- **Error Response (500 Internal Server Error - Email Delivery Failed)**:
  ```json
  {
    "success": false,
    "message": "Unable to send your message. Please try again later."
  }
  ```

### 3. `GET /api/contact` (Protected Admin Endpoint)
- **Header**: `x-api-key: ManasaPortfolioAdminSecret2026!`
- **Success Response (200 OK)**: Returns list of contact records saved in the database.

---

## 🧪 Testing Checklist

- [x] **Scenario 1**: Submit empty form -> Highlights errors and displays validation alert.
- [x] **Scenario 2**: Submit invalid email (e.g. `test@invalid`) -> Rejected with clear error message.
- [x] **Scenario 3**: Submit message under 5 characters -> Rejected with minimum length error.
- [x] **Scenario 4**: Click "Send Message" -> Button disabled, displays spinner, prevents duplicate clicks.
- [x] **Scenario 5**: Stop backend -> Frontend shows friendly error without false success message.
- [x] **Scenario 6**: Live email delivery -> Delivered directly to `reddymanasa0271@gmail.com`.
- [x] **Scenario 7**: Direct reply -> Reply button in Gmail automatically addresses the visitor's email.
