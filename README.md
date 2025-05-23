# E-Table: A Web-Based Restaurant Reservation System

**E-Table** is a full-stack web application built using **Next.js** and **MySQL** as part of a final-year thesis. It allows customers to find and reserve tables at restaurants, and restaurant owners to manage listings and bookings.

---

## 📌 Features

- 👥 **User Roles**: Customers and Restaurant Owners
- 🏢 **Restaurant Listings**: Owners can add and manage their restaurants
- 📅 **Reservations**: Customers can book tables for specific dates and time slots
- 🔍 **Search & Filter**: Browse restaurants by name, cuisine, or location
- 💺 **Seat Tracking**: Available seats automatically adjust per reservation
- 💰 **Estimated Pricing**: Total cost calculated per party size
- 📊 **Owner Dashboard**: See today's, upcoming, and past reservations
- 📧 **Email Notifications** *(planned feature)*

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) 15, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: MySQL
- **Authentication**: Custom auth system
- **Development Tools**: TypeScript, VS Code

---

## 🗂️ Folder Structure

e-table/
├── app/ # All pages (auth, dashboard, restaurants)
├── components/ # UI and logic components
├── lib/ # DB and API logic
├── public/ # Static assets
├── styles/ # Global styles
├── .env.local # MySQL and auth config (not included)
├── README.md # This file



---

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/e-table.git
cd e-table

2. Install dependencies

npm install

3. Set up the environment
Create a .env.local file:


DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=etable
JWT_SECRET=your_jwt_secret

4. Set up the database

Run these commands in MySQL Workbench:

CREATE DATABASE etable;

-- Then run the table schema commands (available in your thesis or migration file)

5. Start the development server

npm run dev
Visit http://localhost:3000

📖 Thesis Overview
This project is part of a final-year thesis titled:

E-Table: A Web-Based Restaurant Reservation System

The goal is to digitize and streamline restaurant bookings, offering users a seamless way to explore dining options and reserve tables based on availability.
