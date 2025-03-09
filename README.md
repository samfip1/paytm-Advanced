
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

2.  Install Dependencies
    ```bash
    npm install

3. Configure the .env File
    ```bash
    DATABASE_URL=postgresql://username:password@localhost:5432/paytm_clone
    JWT_SECRET=your_jwt_secret

4. Run Database Migrations
    ```bash
    npx prisma migrate dev


5.  Start the Development Server
    ```bash
    npm run dev


# Usage
##  Admin Access
 ### Admin users can manage accounts via the Admin Panel:
   - Delete Users: Admins can remove users if they detect violations or cheating.
- Deduct Funds: Admins can penalize users by deducting funds from their accounts for - fraudulent activities.


## User Access
### Regular users can:

- Transfer Money: Users can transfer money to other users.
- View Balance: Users can view the balance in their accounts.


# Future Enhancements
- Implement two-factor authentication for added security.
- Add a transaction history feature for better tracking.
- Introduce a wallet recharge and cashback system.
