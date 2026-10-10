NOVA — Mini Banking App

NOVA is a web-based mini banking application designed to simplify basic banking operations through a simple and user-friendly interface.

Features

- User registration and login
- Account balance viewing
- Money deposits and withdrawals
- Fund transfers
- Transaction PIN verification
- Transaction history
- Downloadable account statements

Technology Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: SQLite
- Authentication: JWT
- Password Security: bcrypt
- Statement Generation: Node.js Readable Streams

Project Structure

- "public/" — Frontend files
- "server.js" — Main application server
- "database.js" — Database setup and operations
- "auth.js" — Authentication-related logic
- "authMiddleware.js" — Authentication middleware
- "login.js" — Login-related logic
- "transactions.js" — Transaction operations
- "statement.js" — Statement generation
- "package.json" — Project dependencies and scripts

Live Demo

https://nova-mini-banking.onrender.com/

Running Locally

1. Install Node.js.

2. Clone this repository.

3. Open the project folder in a terminal.

4. Install the dependencies:
   
   "npm install"

5. Start the application using the start script defined in "package.json".

6. Open the local URL displayed by the application.

Security Note

This project is intended for learning and demonstration purposes. It is not a production banking system.

Database

The current version uses SQLite to store account and transaction information.

Future Improvements

- Automated testing
- Stronger production security
- Durable hosted database storage
- Improved transaction reliability
