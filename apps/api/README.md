# Backend - Modular Monolithic Architecture

## Project Overview

This project is a backend API built using Node.js and Express.js following a Modular Monolithic architecture.  
The application is structured into independent modules where each module contains its own routes, controllers, services, and data access logic while still running within a single application.

This architecture improves maintainability, scalability, and code organization compared to a traditional monolithic structure.

---

## Tech Stack

- Node.js (v20.19.4)
- Express.js

---

## Architecture

The project follows a Modular Monolithic architecture where each feature is organized as an independent module.

Each module typically contains:

- Routes
- Controllers
- Services
- Database queries / models

Modules communicate internally but remain logically separated.

---

## Project Structure

src/
│
├── modules/
│ ├── users/
│ │ ├── user.routes.js
│ │ ├── user.controller.js
│ │ ├── user.service.js
│ │ └── user.repository.js
│ │
│ ├── posts/
│ │ ├── post.routes.js
│ │ ├── post.controller.js
│ │ ├── post.service.js
│ │ └── post.repository.js
│
├── config/
│ └── db.js
│
├── middleware/
│
├── utils/
│
└── server.js

---

## Setup Instructions

### 1. Clone Repository

git clone <repository-url>

cd <project-folder>

### 2. Install Dependencies

npm install

### 3. Environment Variables

Create a `.env` file in the root directory.

Example:

PORT=3000

### 4. Run Server

Development:

npm run dev

Production:

npm start

---

## API Base URL

http://localhost:3000

---

## Development Notes

- Each feature is implemented as a module.
- Modules are isolated to improve maintainability.
- Business logic is handled in service layers.
- Controllers handle request/response logic.
- Database interactions are handled in repository or model files.

---
