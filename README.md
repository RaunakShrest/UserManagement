# User Management System

This project is a **Node.js + TypeScript** backend API that handles user management with role-based access control (RBAC) using **JWT-based authentication**. The system currently supports three user roles: `super-admin`, `admin`, and `user`.

---

## 🚀 Features

- **Authentication** using JWT (access token generation on login)
- **Authorization** with Role-Based Access Control (RBAC)
- **CRUD Operations** for users by `super-admin`
- `super-admin` can view and manage both `admin` and `user` accounts
- `admin` can only view `user` accounts
- `user` accounts exist in the system but **cannot log in** yet

---

## 🔐 Authentication & Authorization

### 🔑 Login and Access Token Flow

1. A `super-admin` or `admin` logs in with email and password.
2. On successful login, an **Access Token** is generated using **JWT**.
3. This token must be sent in the `Authorization` header as `Bearer <token>` on all protected routes.
4. The token payload includes the user’s ID and role.

### 🛡️ Role-Based Access

| Role        | Permissions                                                           |
|-------------|------------------------------------------------------------------------|
| Super-Admin | 🔄 Full CRUD on all users and admins <br> 👀 View all users/admins     |
| Admin       | 👀 View user list only                                                |
| User        | ❌ Cannot log in (future support planned)                             |

Authorization is enforced through a middleware that verifies the token and checks the user's role before granting access to protected endpoints.


## ⚙️ Environment Variables

You can use env sample .
