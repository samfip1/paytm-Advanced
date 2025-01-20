# Paytm Clone Application

A robust and feature-rich Paytm clone that allows users to sign up, sign in, transfer money, and view their account balance. The application supports role-based access control with two primary user roles: **Admin** and **User**. Built using the MERN stack with **Prisma** as the ORM and **PostgreSQL** as the database, this project ensures high performance and scalability. 

---

## Features

### User Features:
1. **Sign Up and Sign In**  
   - Users can create an account or log in using their credentials.
2. **Money Transfer**  
   - Users can transfer money securely to other users.
3. **View Balance**  
   - Users can check their current account balance.

### Admin Features:
1. **User Management**  
   - Admins can delete user accounts if any violations are detected.
2. **Penalty System**  
   - Admins can deduct money from users' accounts if caught cheating or violating rules.

---

## Tech Stack

### Frontend:
- **React** + **TypeScript**: For building a responsive and interactive user interface.
- **Tailwind CSS**: For modern, utility-first styling.

### Backend:
- **Node.js**: For creating the server-side application logic.
- **Express.js**: For building robust and scalable APIs.

### Database:
- **PostgreSQL**: Relational database for securely storing user and transaction data.
- **Prisma**: ORM for seamless database access and management.

### Others:
- **JWT Authentication**: For secure login sessions.
- **Role-Based Access Control (RBAC)**: For differentiating admin and user functionalities.

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/paytm-clone.git
   cd paytm-clone
