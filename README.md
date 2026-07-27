# BudgetWise Frontend

Frontend for **BudgetWise**, a modern personal budget management platform built with **React.js**. The application enables users to manage budgets, explore activities, receive AI-powered financial recommendations, and communicate through an integrated AI chat.

## Live Demo

**Frontend:** https://budget-wise-front-end-w7fh.vercel.app/

**Backend API:** https://budget-wise-back-end-five.vercel.app/

**Backend Repository:** https://github.com/MoaazYahia-14/BudgetWise_BackEnd

---

## Technologies

| Technology | Description |
|------------|-------------|
| React 19 | Frontend framework |
| React Router v7 | Client-side routing |
| Axios | HTTP client |
| TanStack React Query | Data fetching & caching |
| Recharts | Charts & Analytics |
| Socket.IO Client | Real-time communication |
| i18next | Internationalization |
| Bootstrap 5 | UI framework |

---

## Features

- User Authentication
- Budget Management
- Expense Tracking
- AI Financial Assistant
- Activity Explorer
- Founder Dashboard
- Real-Time Notifications
- Interactive Charts & Analytics
- Multi-language Support (English & Arabic)

---

## Project Structure

```text
src/
├── pages/
├── components/
├── context/
├── services/
├── locales/
├── styles/
├── utils/
└── config.js
```

---

## Installation

### Requirements

- Node.js v18 or later
- BudgetWise Backend API

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root.

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Run the Application

```bash
npm start
```

The application will run on:

```text
http://localhost:3000
```

---

## Deployment

The project is ready for deployment on **Vercel**.

Required Environment Variables:

```env
REACT_APP_API_URL=https://budget-wise-back-end-five.vercel.app/api
REACT_APP_SOCKET_URL=https://budget-wise-back-end-five.vercel.app
```

---

## Architecture

- Component-Based Architecture
- REST API Integration
- Protected Routes
- Global State Management
- Responsive User Interface
- Production Ready

---

## Backend

The frontend communicates with the BudgetWise Backend API built with **Node.js**, **Express.js**, and **MongoDB Atlas**.

**Backend API:** https://budget-wise-back-end-five.vercel.app/

**Backend Repository:** https://github.com/MoaazYahia-14/BudgetWise_BackEnd
