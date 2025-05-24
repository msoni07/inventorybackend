# Medical Inventory Backend API

## Description

This project is the backend API for a pharmacy or medical store inventory management system. It provides functionalities for user authentication, role-based access control, and management of medical inventory.

## Tech Stack

*   **Node.js:** JavaScript runtime environment.
*   **Express.js:** Web application framework for Node.js.
*   **MongoDB:** NoSQL database for storing application data.
*   **Mongoose:** ODM (Object Data Modeling) library for MongoDB and Node.js.
*   **JSON Web Tokens (JWT):** For securing API endpoints and user authentication.
*   **Joi:** For request body validation.
*   **Winston:** For logging application events and errors.
*   **bcryptjs:** For hashing passwords.
*   **dotenv:** For managing environment variables.

## Features Implemented So Far

*   User Authentication (Register, Login) with JWT.
*   Role-Based Access Control (Admin, Manager, Staff roles).
*   User profile endpoint (`/api/auth/me`).
*   Basic Inventory Management for Medicines (CRUD operations - Create, Read, Update, Delete).
*   Request Logging using Winston (to console in dev, to files in production).
*   Request Body Validation using Joi for authentication and medicine routes.
*   Seeders for creating an initial admin user and sample medicine data.
*   Password hashing for user credentials.
*   Middleware for authentication (`protect`) and authorization (`authorize`).
*   Structured project layout (config, controllers, middlewares, models, routes, validators, seeders).

## Prerequisites

*   **Node.js:** v14.x or later (or any active LTS version).
*   **npm** (Node Package Manager) or **yarn**.
*   **MongoDB:** v4.x or later, running locally or accessible via a URI.

## Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url-here>
    ```
    (Replace `<your-repository-url-here>` with the actual URL of the repository once available.)

2.  **Navigate to the project directory:**
    ```bash
    cd medical-inventory-backend
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    # or if you prefer yarn:
    # yarn install
    ```

4.  **Create a `.env` file:**
    Create a file named `.env` in the root directory of the project (`medical-inventory-backend/.env`). You can copy the structure from `.env.example` (if provided, otherwise create it manually) and fill in your specific configuration.

    Example content for `.env`:
    ```ini
    PORT=3000
    MONGODB_URI=mongodb://localhost:27017/medical_inventory
    JWT_SECRET=yourSuperSecretAndStrongKeyForJWTGoesHere
    LOG_LEVEL=info # Optional: 'debug', 'info', 'warn', 'error'
    NODE_ENV=development # Optional: 'development' or 'production'
    ```

5.  **Update the `.env` file with your configuration:**
    *   `PORT`: The port on which the application will run (e.g., 3000).
    *   `MONGODB_URI`: Your MongoDB connection string (e.g., `mongodb://localhost:27017/medical_inventory` for a local MongoDB instance, or a cloud MongoDB URI).
    *   `JWT_SECRET`: A strong, unique secret key used for signing and verifying JSON Web Tokens.
    *   `LOG_LEVEL` (Optional): Sets the logging level for Winston. Defaults to `info`.
    *   `NODE_ENV` (Optional): Set to `development` for development-specific features (like colored console logs) or `production`.

## Running the Application

*   **Development Mode (with auto-restarting using Nodemon):**
    ```bash
    npm run dev
    ```
    This command uses `nodemon` to automatically restart the server when file changes are detected.

*   **Production Mode:**
    ```bash
    npm run start
    ```
    This command runs the application using `node app.js`.

The server will be running at `http://localhost:PORT` (where `PORT` is the value you set in your `.env` file, e.g., `http://localhost:3000`).

## Running Seeders

Seeders are scripts to populate your database with initial data.

*   **Important Note for Seeders:** Running a seeder script will typically **delete all existing data** in the respective collection(s) before inserting the new sample data. Use with caution, especially in environments with important data.

*   **To seed the database with initial users (Admin, Manager, Staff):**
    ```bash
    npm run seed:users
    ```

*   **To seed with sample medicines:**
    (This requires an Admin or Manager user to exist in the database, as the `lastUpdatedBy` field needs to be populated. Run `seed:users` first if no suitable user exists.)
    ```bash
    npm run seed:medicines
    ```

*   **To run all seeders sequentially (Users then Medicines):**
    ```bash
    npm run seed
    ```

## API Endpoints (Brief Overview)

All API routes are prefixed with `/api`.

### Authentication (`/auth`)

*   `POST /auth/register`: Register a new user.
    *   Body: `{ "username", "email", "password", "role" (optional), "firstName" (optional), "lastName" (optional) }`
*   `POST /auth/login`: Authenticate a user and get a JWT token.
    *   Body: `{ "email" (or "username"), "password" }`
*   `GET /auth/me`: Get the profile of the currently logged-in user.
    *   Requires: Authentication Token (Bearer Token in Authorization header).

### Inventory - Medicines (`/inventory/medicines`)

*   `POST /inventory/medicines`: Add a new medicine to the inventory.
    *   Requires: Authentication Token, Admin or Manager role.
    *   Body: Medicine details (name, manufacturer, batchNumber, expiryDate, mrp, etc.).
*   `GET /inventory/medicines`: Get a list of all medicines (paginated).
    *   Requires: Authentication Token.
    *   Query Params (optional): `page`, `limit`.
*   `GET /inventory/medicines/:id`: Get details of a specific medicine by its ID.
    *   Requires: Authentication Token.
*   `PUT /inventory/medicines/:id`: Update an existing medicine by its ID.
    *   Requires: Authentication Token, Admin or Manager role.
    *   Body: Fields to update.
*   `DELETE /inventory/medicines/:id`: Delete a medicine by its ID.
    *   Requires: Authentication Token, Admin role.

---
This README provides a comprehensive guide to setting up, running, and understanding the Medical Inventory Backend API.
For detailed API specifications, please refer to any accompanying API documentation or examine the route definitions in the `routes/` directory.
