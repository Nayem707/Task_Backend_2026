# 🌟 Social Feed Platform

**Modern React-based Social Media Application**

[![React](https://img.shields.io/badge/React-19.2.4-blue.svg)](https://reactjs.org/) [![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2.11.2-purple.svg)](https://redux-toolkit.js.org/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.2.2-38bdf8.svg)](https://tailwindcss.com/) [![Vite](https://img.shields.io/badge/Vite-8.0.1-646cff.svg)](https://vitejs.dev/) [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Folder & Architecture Breakdown](#3-folder--architecture-breakdown)
4. [Features Analysis](#4-features-analysis)
5. [API & Data Flow](#5-api--data-flow)
6. [Authentication & Security](#6-authentication--security)
7. [State Management](#7-state-management)
8. [Performance Analysis](#8-performance-analysis)
9. [UI/UX Review](#9-uiux-review)
10. [Deployment & Environment](#10-deployment--environment)
11. [Code Quality](#11-code-quality)
12. [Missing Parts / Improvement Plan](#12-missing-parts--improvement-plan)

---

## 1. Project Overview

**BuddyScripts** is a full-featured social media web application — similar in concept to Facebook or LinkedIn — that allows users to create accounts, publish posts (with images), comment, like, follow other users, send direct messages, view 24-hour stories, and receive real-time notifications.

### Core Purpose

| Aspect       | Description                                                         |
| ------------ | ------------------------------------------------------------------- |
| Type         | Social networking platform                                          |
| Architecture | Decoupled SPA frontend + REST API backend                           |
| Target Users | General social media users                                          |
| Deployment   | Frontend on Netlify/Vercel/Render; Backend on a remote Linux server |

### Core Capabilities

- User registration and login with JWT-based authentication
- Create, edit, delete, and view posts (text + up to 5 images)
- Nested comments with replies and comment likes
- Polymorphic like system (posts and comments)
- User profiles with follow/unfollow social graph
- Real-time direct messaging with delivery/read receipts
- 24-hour stories with emoji reactions
- Group communities with OWNER/ADMIN/MEMBER roles
- Push-style in-app notifications
- Real-time updates via WebSocket (Socket.IO)
- Swagger/OpenAPI interactive documentation at `/api-docs`

---

## 2. Tech Stack

### Frontend (`cli/`)

| Layer            | Technology              | Version |
| ---------------- | ----------------------- | ------- |
| Framework        | React                   | ^19.2.4 |
| Build Tool       | Vite                    | ^8.0.1  |
| Routing          | React Router DOM        | ^6.30.1 |
| State Management | Redux Toolkit           | ^2.11.2 |
| HTTP Client      | Axios                   | ^1.14.0 |
| Forms            | React Hook Form         | ^7.72.0 |
| Styling          | Tailwind CSS            | ^4.2.2  |
| Icons            | Lucide React            | ^1.7.0  |
| Notifications    | React Hot Toast         | ^2.6.0  |
| Language         | JavaScript (ES Modules) | —       |

### Backend (`api/`)

| Layer       | Technology                       | Version  |
| ----------- | -------------------------------- | -------- |
| Runtime     | Node.js                          | ≥16      |
| Framework   | Express.js                       | ^4.18.2  |
| ORM         | Prisma                           | ^5.8.0   |
| Database    | PostgreSQL                       | remote   |
| Real-time   | Socket.IO                        | ^4.8.3   |
| Auth        | JWT (jsonwebtoken)               | ^9.0.2   |
| Validation  | Joi                              | ^17.11.0 |
| Hashing     | bcryptjs                         | ^2.4.3   |
| File Upload | Multer                           | ^2.1.1   |
| Caching     | In-memory TTL cache              | custom   |
| Logging     | Winston                          | ^3.11.0  |
| API Docs    | Swagger UI / swagger-jsdoc       | ^6.2.8   |
| Security    | Helmet, express-rate-limit, CORS | —        |

---

## 3. Folder & Architecture Breakdown

### Root Structure

```
buddyscripts/
├── api/          → Backend REST API
├── cli/          → Frontend React SPA
├── DOCUMENTATION.md
└── DEPLOYMENT.md
```

---

### Backend (`api/`)

```
api/
├── src/
│   ├── server.js           → Entry point: loads .env, handles uncaught errors, starts server
│   ├── app.js              → Express App class: middleware pipeline, routes, error handling
│   ├── config/
│   │   ├── index.js        → Centralizes all env vars with validation and defaults
│   │   └── database.js     → Prisma client singleton, connect/disconnect helpers
│   ├── routes/
│   │   ├── index.js        → Mounts all route modules under /api/v1/*
│   │   ├── auth.routes.js
│   │   ├── posts.routes.js
│   │   ├── comments.routes.js
│   │   ├── likes.routes.js
│   │   ├── users.routes.js
│   │   ├── stories.routes.js
│   │   ├── messages.routes.js
│   │   ├── groups.routes.js
│   │   ├── notifications.routes.js
│   │   ├── system.routes.js    → /health and /status endpoints (no /api prefix)
│   │   └── apiDocs.routes.js   → Swagger UI at /api/api-docs
│   ├── controllers/        → Parse requests, delegate to services, send responses
│   ├── services/           → Business logic and orchestration layer
│   ├── repositories/       → Database queries via Prisma (data access layer)
│   ├── middlewares/
│   │   ├── auth.js         → JWT verification, user caching (14-min TTL)
│   │   ├── errorHandler.js → Global error handler + custom error classes
│   │   ├── responseFormatter.js → Adds res.sendSuccess / res.sendError helpers
│   │   ├── upload.js       → Multer file upload configuration
│   │   └── validation.js   → express-validator integration
│   ├── validators/         → Joi schemas for each feature domain
│   ├── utils/
│   │   ├── jwt.js          → Token generation and verification helpers
│   │   ├── cache.js        → Simple in-memory TTL cache
│   │   ├── logger.js       → Winston multi-transport logger
│   │   ├── apiResponse.js  → Standard response shape helpers
│   │   ├── notificationHelper.js → Creates DB notifications + emits socket events
│   │   └── socketEmit.js   → Helper to emit to specific user rooms
│   └── socket/
│       └── index.js        → Socket.IO server with JWT auth, typing indicators, DM/notification events
├── prisma/
│   ├── schema.prisma       → Full database schema (16 models)
│   ├── seed.js             → Database seeder
│   └── migrations/         → Prisma migration history
├── uploads/                → Multer file storage (user-uploaded images)
├── logs/                   → Winston log files
└── .env                    → Environment variables (not committed)
```

#### Backend Architecture Pattern

The backend strictly follows a **Layered Architecture**:

```
HTTP Request
    ↓
Routes          (define endpoints, attach middlewares)
    ↓
Controllers     (parse req, validate, delegate, send res)
    ↓
Services        (business logic, rule enforcement)
    ↓
Repositories    (Prisma DB queries only)
    ↓
PostgreSQL
```

This separation ensures services and repositories are independently testable and swappable.

---

### Frontend (`cli/`)

```
cli/
├── public/
│   ├── _redirects          → Netlify SPA routing config (/* → /index.html 200)
│   └── images/             → Static assets (logo, shapes, illustrations)
├── src/
│   ├── main.jsx            → React entry point (Redux Provider + RouterProvider)
│   ├── App.jsx             → Root component (RouterProvider + Toaster)
│   ├── routes/
│   │   ├── router.jsx      → All routes defined with createBrowserRouter
│   │   ├── PrivateGuard.jsx → Redirects unauthenticated users to /login
│   │   └── PublicGuard.jsx → Redirects authenticated users away from /login, /register
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginView.jsx
│   │   │   └── RegisterView.jsx
│   │   ├── private/
│   │   │   ├── FeedView.jsx
│   │   │   ├── ProfileView.jsx
│   │   │   └── FriendsView.jsx
│   │   └── error/
│   │       └── NotFoundView.jsx
│   ├── components/
│   │   ├── common/         → Button, Input, Modal, Skeleton, Spinner
│   │   ├── layout/
│   │   │   ├── feed/       → FeedLayout, Navbar, LeftSidebar, RightSidebar, BottomNav
│   │   │   ├── profile/    → ProfileLayout
│   │   │   └── setting/    → (placeholder, not implemented)
│   │   ├── posts/          → PostCard, PostList, CreatePost, Stories
│   │   ├── comments/       → CommentList, (comment sub-components)
│   │   ├── likes/          → LikesList
│   │   ├── profile/        → (profile sub-components)
│   │   ├── friends/        → (friends components)
│   │   └── ui/             → (base UI components)
│   ├── features/           → Redux slices + async thunks (one per domain)
│   │   ├── auth/           → authSlice.js, authAPI.js
│   │   ├── posts/          → postsSlice.js, postsAPI.js
│   │   ├── comments/       → commentsSlice.js, commentsAPI.js
│   │   ├── likes/          → likesSlice.js, likesAPI.js
│   │   ├── profile/        → profileSlice.js, profileAPI.js
│   │   ├── notifications/  → notificationsSlice.js, notificationsAPI.js
│   │   ├── messages/       → messagesSlice.js, messagesAPI.js
│   │   └── users/          → usersSlice.js, usersAPI.js
│   ├── services/
│   │   ├── axiosInstance.js → Axios with baseURL from VITE_API_URL env var
│   │   ├── httpMethods.js  → GET, POST, PUT, PATCH, DELETE wrappers
│   │   ├── httpEndpoint.js → All API endpoint constants
│   │   └── apiExecutor.js  → Centralized try/catch wrapper for Redux thunks
│   ├── hooks/
│   │   ├── useAuth.js      → Selector hook for auth state
│   │   └── usePosts.js     → Selector hook for posts state
│   ├── store/
│   │   └── store.js        → Redux store with all reducers
│   └── utils/
│       ├── constants.js    → ROUTES, TOKEN_KEY, PAGINATION_LIMIT, FILE_LIMITS
│       ├── cookies.js      → setCookie, getCookie, deleteCookie helpers
│       ├── helpers.js      → cn(), formatDateTime(), timeAgo(), sortByNewest()
│       └── validators.js   → emailPattern, passwordRules, validateImageFile
├── .env                    → VITE_API_URL=https://buddyscripts.mtscorporate.com/api/v1
├── netlify.toml            → Netlify SPA redirect + build config
├── vercel.json             → Vercel SPA rewrite config
├── render.yaml             → Render static site config
└── vite.config.js          → Vite + React + Tailwind plugins
```

---

## 4. Features Analysis

### ✅ Fully Implemented

| Feature                            | Frontend | Backend |
| ---------------------------------- | -------- | ------- |
| User Registration                  | ✅       | ✅      |
| User Login / Logout                | ✅       | ✅      |
| JWT Auth (access + refresh tokens) | ✅       | ✅      |
| Route Guards (Public/Private)      | ✅       | —       |
| Create Post (text + images)        | ✅       | ✅      |
| Edit / Delete Post                 | ✅       | ✅      |
| Public Feed (cursor pagination)    | ✅       | ✅      |
| User Post Feed                     | ✅       | ✅      |
| Multiple Image Upload per Post     | ✅       | ✅      |
| Like / Unlike Post (optimistic)    | ✅       | ✅      |
| View Post Likes List               | ✅       | ✅      |
| Post Comments                      | ✅       | ✅      |
| Nested Comment Replies             | ✅       | ✅      |
| Like / Unlike Comment              | ✅       | ✅      |
| Delete Comment                     | ✅       | ✅      |
| User Profile Page                  | ✅       | ✅      |
| Update Profile                     | ✅       | ✅      |
| Follow / Unfollow User             | ✅       | ✅      |
| View Followers/Following           | ✅       | ✅      |
| Friends / Social Graph             | ✅       | ✅      |
| In-app Notifications               | ✅       | ✅      |
| Mark Notification Read             | ✅       | ✅      |
| Mark All Notifications Read        | ✅       | ✅      |
| Direct Messages (DM)               | partial  | ✅      |
| Real-time DM (Socket.IO)           | —        | ✅      |
| Real-time Typing Indicators        | —        | ✅      |
| 24-hour Stories                    | partial  | ✅      |
| Groups / Communities               | —        | ✅      |
| Swagger API Docs                   | —        | ✅      |
| File Upload (Multer)               | ✅       | ✅      |
| Rate Limiting                      | —        | ✅      |
| Request Logging                    | —        | ✅      |
| Health / Status Endpoints          | —        | ✅      |
| SPA Routing Fix                    | ✅       | —       |
| 404 Page                           | ✅       | ✅      |

### ⚠️ Partially Implemented

| Feature             | Issue                                                                                                                                           |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Direct Messages     | API and Redux slice exist, but no DM UI screen/page is implemented. Messages can only be fetched as conversations, not viewed/sent from the UI. |
| Stories             | Backend fully ready with 24-hour expiry and emoji reactions. Frontend has a `Stories.jsx` component but it's not fully wired to the backend.    |
| Bookmarks           | Listed in the UI sidebar as a nav item, but there is no backend model, endpoint, or frontend implementation.                                    |
| Socket.IO real-time | Backend fully ready. Frontend has no Socket client integration — no real-time updates for DMs or notifications are received.                    |
| Google OAuth        | "Register with Google" button exists in the UI but has no implementation.                                                                       |
| Settings Page       | Layout folder `setting/` exists but contains no components.                                                                                     |

### ❌ Missing / Not Implemented

| Feature                 | Notes                                                                             |
| ----------------------- | --------------------------------------------------------------------------------- |
| Groups UI               | Backend fully ready, no frontend screens                                          |
| Story Creation UI       | No upload/create story form                                                       |
| Story Viewer UI         | No full-screen story viewer                                                       |
| DM Chat Screen          | No conversation view or message send UI                                           |
| Socket.IO client        | No socket connection in the React app                                             |
| Password Change         | Backend endpoint exists, no frontend form                                         |
| Forgot Password / Reset | Backend endpoint exists, no frontend flow                                         |
| Email Notifications     | Config placeholder exists, not wired                                              |
| Search Users            | Backend `GET /users/search` exists, no UI                                         |
| Post Visibility Filter  | Visibility enum (PUBLIC/PRIVATE/FRIENDS_ONLY) exists in DB but not surfaced in UI |
| Admin Dashboard         | Not present at all                                                                |
| Infinite Scroll         | Feed has cursor pagination data but no automatic load-on-scroll trigger           |
| Image Lightbox          | Post images open in a modal but no full-screen lightbox/gallery                   |

### 🐛 Bugs / Weak Logic

| Issue                           | Location                             | Description                                                                                                                                                                            |
| ------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `App.jsx` semicolon bug         | `cli/src/App.jsx`                    | `<RouterProvider router={router} />;` — extra semicolon inside JSX renders a stray text node in the DOM                                                                                |
| Auth error not extracted        | `apiExecutor.js`                     | `rejectWithValue(response?.data \|\| error.message)` passes the full response object; callers that do `toast.error(error)` will render `[object Object]` instead of the message string |
| No token refresh logic          | Frontend                             | Access token expires in 1h; there is no interceptor to use the refresh token and re-attempt the failed request                                                                         |
| Uncleaned `console.error` calls | `apiExecutor.js`                     | `console.error` calls leak internal error details to the browser console in production                                                                                                 |
| Empty settings layout           | `cli/src/components/layout/setting/` | Folder exists with no components, can cause import errors if referenced                                                                                                                |

---

## 5. API & Data Flow

### API Base URL

```
Production: https://buddyscripts.mtscorporate.com
All routes:  /api/v1/*
Health:      /health
Status:      /status
API Docs:    /api/api-docs
```

### Full API Endpoint Reference

#### Auth — `/api/v1/auth`

| Method | Endpoint                | Auth | Description                            |
| ------ | ----------------------- | ---- | -------------------------------------- |
| POST   | `/auth/register`        | ❌   | Register new user                      |
| POST   | `/auth/login`           | ❌   | Login, returns access + refresh tokens |
| POST   | `/auth/logout`          | ✅   | Invalidate session                     |
| GET    | `/auth/profile`         | ✅   | Get current user profile               |
| POST   | `/auth/refresh-token`   | ❌   | Get new access token                   |
| POST   | `/auth/forgot-password` | ❌   | Request password reset email           |
| POST   | `/auth/reset-password`  | ❌   | Reset password with token              |

#### Posts — `/api/v1/posts`

| Method | Endpoint              | Auth | Description                     |
| ------ | --------------------- | ---- | ------------------------------- |
| GET    | `/posts`              | ❌   | Public feed (cursor pagination) |
| GET    | `/posts/feed/me`      | ✅   | Authenticated user's feed       |
| GET    | `/posts/me`           | ✅   | Current user's own posts        |
| GET    | `/posts/user/:userId` | ❌   | Another user's posts            |
| POST   | `/posts`              | ✅   | Create new post (multipart)     |
| GET    | `/posts/:id`          | ❌   | Get single post                 |
| PUT    | `/posts/:id`          | ✅   | Update post                     |
| DELETE | `/posts/:id`          | ✅   | Delete post                     |

#### Comments — `/api/v1/posts/:postId/comments` and `/api/v1/comments`

| Method | Endpoint                       | Auth | Description         |
| ------ | ------------------------------ | ---- | ------------------- |
| GET    | `/posts/:postId/comments`      | ❌   | List comments       |
| POST   | `/posts/:postId/comments`      | ✅   | Add comment         |
| GET    | `/comments/:commentId`         | ❌   | Get single comment  |
| PUT    | `/comments/:commentId`         | ✅   | Update comment      |
| DELETE | `/comments/:commentId`         | ✅   | Delete comment      |
| GET    | `/comments/:commentId/replies` | ❌   | List replies        |
| POST   | `/comments/:commentId/replies` | ✅   | Add reply           |
| POST   | `/comments/:commentId/like`    | ✅   | Toggle comment like |

#### Likes — `/api/v1/likes`

| Method | Endpoint                            | Auth | Description          |
| ------ | ----------------------------------- | ---- | -------------------- |
| POST   | `/likes/posts/:postId/toggle`       | ✅   | Toggle post like     |
| POST   | `/likes/comments/:commentId/toggle` | ✅   | Toggle comment like  |
| GET    | `/likes/posts/:postId`              | ❌   | List post likers     |
| GET    | `/likes/comments/:commentId`        | ❌   | List comment likers  |
| GET    | `/likes/posts/:postId/stats`        | ❌   | Post like statistics |

#### Users — `/api/v1/users`

| Method | Endpoint               | Auth | Description            |
| ------ | ---------------------- | ---- | ---------------------- |
| GET    | `/users/me`            | ✅   | Get own profile        |
| PUT    | `/users/me`            | ✅   | Update own profile     |
| GET    | `/users/search`        | ✅   | Search users           |
| GET    | `/users/:id`           | ❌   | Get user by ID         |
| POST   | `/users/:id/follow`    | ✅   | Toggle follow/unfollow |
| GET    | `/users/:id/followers` | ❌   | List followers         |
| GET    | `/users/:id/following` | ❌   | List following         |

#### Messages — `/api/v1/messages`

| Method | Endpoint                          | Auth | Description             |
| ------ | --------------------------------- | ---- | ----------------------- |
| GET    | `/messages/conversations`         | ✅   | List all conversations  |
| GET    | `/messages/conversations/:userId` | ✅   | Get DM thread with user |
| POST   | `/messages/:receiverId`           | ✅   | Send a DM               |
| PATCH  | `/messages/:messageId/read`       | ✅   | Mark message as read    |

#### Notifications — `/api/v1/notifications`

| Method | Endpoint                  | Auth | Description            |
| ------ | ------------------------- | ---- | ---------------------- |
| GET    | `/notifications`          | ✅   | Get user notifications |
| PATCH  | `/notifications/:id/read` | ✅   | Mark one as read       |
| PATCH  | `/notifications/read-all` | ✅   | Mark all as read       |

#### Stories — `/api/v1/stories`

| Method | Endpoint             | Auth | Description        |
| ------ | -------------------- | ---- | ------------------ |
| GET    | `/stories`           | ✅   | Get active stories |
| POST   | `/stories`           | ✅   | Create a story     |
| DELETE | `/stories/:id`       | ✅   | Delete own story   |
| POST   | `/stories/:id/react` | ✅   | React to a story   |

#### Groups — `/api/v1/groups`

| Method | Endpoint            | Auth | Description                |
| ------ | ------------------- | ---- | -------------------------- |
| GET    | `/groups`           | ✅   | List groups                |
| POST   | `/groups`           | ✅   | Create group               |
| GET    | `/groups/:id`       | ✅   | Get group details          |
| PUT    | `/groups/:id`       | ✅   | Update group (OWNER/ADMIN) |
| DELETE | `/groups/:id`       | ✅   | Delete group (OWNER only)  |
| POST   | `/groups/:id/join`  | ✅   | Join group                 |
| POST   | `/groups/:id/leave` | ✅   | Leave group                |

### Data Flow Diagram

```
[User Browser]
     |
     | HTTPS
     ↓
[React SPA — localhost:5173 / Netlify]
     |
     | Redux Thunk (createAsyncThunk)
     |     → apiExecutor() → httpMethods.js → axiosInstance (Axios)
     |
     | HTTPS REST
     ↓
[Express API — buddyscripts.mtscorporate.com]
     |
     → Helmet, CORS, Rate Limiter, Body Parser, ResponseFormatter
     → Routes → Controllers → Services → Repositories
     → Prisma ORM
     |
     ↓
[PostgreSQL — 147.93.107.217:5436]

[Real-time]
[React SPA] ←──── Socket.IO ────→ [Express API Socket Server]
                    (not yet wired in frontend)
```

### Standard API Response Shape

All API responses follow a consistent envelope:

**Success:**

```json
{
  "success": true,
  "statusCode": 200,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2026-04-03T..."
}
```

**Error:**

```json
{
  "success": false,
  "statusCode": 400,
  "errors": [{ "field": "email", "message": "Email is required" }],
  "message": "Validation failed",
  "timestamp": "2026-04-03T..."
}
```

---

## 6. Authentication & Security

### Auth Flow

1. **Register:** `POST /api/v1/auth/register` with `firstName`, `lastName`, `email`, `password`
2. Backend hashes password with `bcrypt` (12 rounds), creates user, generates JWT pair
3. **Login:** `POST /api/v1/auth/login` → returns `accessToken` (1h) + `refreshToken` (7d)
4. Tokens are stored in **browser cookies** (secure, sameSite: Strict, 7-day expiry)
5. Every protected request sends `Authorization: Bearer <accessToken>` via Axios interceptor
6. Backend middleware verifies the JWT and caches the resolved user for 14 minutes to reduce DB queries
7. `PrivateGuard` checks for the cookie before rendering protected routes
8. `PublicGuard` redirects authenticated users away from `/login` and `/register`

### Security Strengths

| Measure          | Detail                                                         |
| ---------------- | -------------------------------------------------------------- |
| Helmet           | Sets 14 security headers (XSS, CSRF, clickjacking protections) |
| Rate Limiting    | 2000 requests per 30-minute window on all `/api/*` routes      |
| CORS             | Whitelist of allowed origins from `CORS_ORIGIN` env var        |
| Password Hashing | bcrypt with 12 rounds                                          |
| JWT Expiry       | Short-lived access tokens (1h), longer refresh tokens (7d)     |
| User Cache       | Auth middleware caches resolved users to reduce DB load        |
| Input Validation | Joi schemas on all write endpoints                             |
| SQL Injection    | Prevented by Prisma ORM (parameterized queries)                |
| File Uploads     | Multer with type/size restrictions                             |
| Audit Logging    | Winston logs key auth events (register, login)                 |

### Security Gaps

| Risk                                    | Severity   | Description                                                                                                                                              |
| --------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No token refresh in frontend            | **High**   | Access tokens expire after 1h with no silent refresh. Users get logged out without warning.                                                              |
| Cookies not HttpOnly                    | **High**   | Tokens stored in `document.cookie` are accessible to JavaScript, making them vulnerable to XSS attacks. Should use `HttpOnly` cookies set by the server. |
| No CSRF protection                      | **Medium** | Cookies with `sameSite: Strict` provide partial protection, but there is no CSRF token mechanism.                                                        |
| `console.error` in production           | **Low**    | Internal error details logged to browser console in `apiExecutor.js`.                                                                                    |
| No brute-force lockout                  | **Medium** | Rate limiter operates globally; no per-IP or per-account login attempt lockout.                                                                          |
| Refresh token not invalidated on logout | **Medium** | Logout deletes the cookie client-side but the refresh token on the backend may still be valid.                                                           |

---

## 7. State Management

### Architecture

The frontend uses **Redux Toolkit** with a single store and 8 domain slices:

| Slice           | State Shape                                                                | Key Actions                                                                                       |
| --------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `auth`          | `{ user, isAuthenticated, loading, error }`                                | login, register, logout, getProfile                                                               |
| `posts`         | `{ items[], nextCursor, hasMore, loading, creating, error }`               | fetchPosts, createPost, deletePost, togglePostLike, updatePost                                    |
| `comments`      | `{ byPostId{}, loadingByPostId{}, submitting, error }`                     | fetchCommentsByPost, addComment, addReply, deleteComment, toggleCommentLike                       |
| `likes`         | `{ likesByEntity{}, loading, error }`                                      | fetchLikesList, toggleLike                                                                        |
| `profile`       | `{ user, posts[], followers[], following[], loading, error, currentPage }` | fetchUserProfile, fetchUserPosts, fetchFollowers, fetchFollowing, toggleFollow, updateUserProfile |
| `notifications` | `{ items[], unreadCount, loading, error }`                                 | fetchNotifications, markNotificationRead, markAllNotificationsRead                                |
| `messages`      | `{ conversations[], loading, error }`                                      | fetchConversations                                                                                |
| `users`         | `{ items[], loading, error }`                                              | (user search)                                                                                     |

### Patterns Used

- **Optimistic Updates:** Post likes use `patchPostLikeOptimistic` to update the UI immediately and roll back on failure — providing a responsive feel without waiting for the server.
- **Data Normalization:** Post API responses are normalized by `normalizePost()` so the UI always works with a consistent `author.name` rather than raw `user.firstName` + `user.lastName`.
- **AbortController via `signal`:** All thunks accept an `AbortSignal` for request cancellation. This prevents race conditions and state corruption when components unmount (e.g., navigating away before a request completes).
- **Selector Hooks:** `useAuth()` and `usePosts()` are thin wrappers around `useSelector` for clean component code.

### Weaknesses

- **No server-state cache:** RTK is used purely as a client-side state store. There is no automatic re-fetch or stale-while-revalidate behavior. Data goes stale until the user refreshes the page.
- **No persistence:** Redux state is lost on page refresh. Only the auth token in the cookie survives.
- **messages slice is minimal:** Only `conversations[]` is stored — no active conversation, no message list per conversation.
- No RTK Query is used, meaning caching, deduplication, and polling must be managed manually.

---

## 8. Performance Analysis

### Current Strengths

| Optimization            | Detail                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| Cursor-based pagination | Public feed uses cursor pagination — efficient for large datasets, avoids OFFSET slowdowns |
| Database Indexes        | All foreign keys and frequently filtered fields are indexed in the Prisma schema           |
| Auth User Caching       | Resolved users cached for 14 minutes in-memory, reducing DB queries per request            |
| Optimistic UI           | Like toggling is instant in the UI with server-side correction applied after               |
| `memo` on PostCard      | `React.memo` used to prevent unnecessary PostCard re-renders                               |
| URL.createObjectURL     | Image previews use object URLs instead of base64 — much lower memory usage                 |
| URL.revokeObjectURL     | Object URLs are revoked on image removal and post submit — prevents memory leaks           |
| Vite Build              | Fast HMR in dev, tree-shaking and code splitting in production                             |

### Bottlenecks & Issues

| Issue                                           | Impact      | Fix                                                                                                                                                |
| ----------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| No infinite scroll trigger                      | UX          | Feed loads one page but doesn't auto-load when scrolling to the bottom. User must manually trigger "load more".                                    |
| No image lazy loading in feed                   | Performance | All post images in the feed load immediately. Add `loading="lazy"` to `<img>` tags.                                                                |
| `fetchLikesList` called on every PostCard mount | API spam    | Every rendered PostCard dispatches a likes fetch if `likesCount > 0`, causing N requests for N posts on mount.                                     |
| No debounce on inputs                           | Minor       | Search / comment inputs have no debounce, causing excessive state updates.                                                                         |
| No Redis for production                         | Scalability | The in-memory cache doesn't persist across server restarts or scale across multiple instances. Redis config is in `.env.example` but not wired up. |
| Bundle size ~484KB (JS)                         | Performance | No code splitting by route. Lazy loading pages via `React.lazy()` + `Suspense` would reduce initial load.                                          |
| No CDN for uploaded files                       | Latency     | Uploaded images served directly from the Express server at `/uploads/`. A CDN or object storage (S3) would improve speed and scalability.          |

---

## 9. UI/UX Review

### Strengths

| Aspect              | Detail                                                                                                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Responsive design   | Three-column layout (left sidebar, center feed, right sidebar) collapses correctly: right sidebar hides on `<xl`, left sidebar hides on `<md`, bottom nav appears on mobile |
| Bottom Navigation   | Mobile users get a bottom nav bar for key routes                                                                                                                            |
| Toast notifications | react-hot-toast provides clean, non-intrusive user feedback                                                                                                                 |
| Skeleton loading    | `Skeleton.jsx` component exists for loading states                                                                                                                          |
| Optimistic likes    | Instant visual feedback on like/unlike without waiting                                                                                                                      |
| Letter/icon avatar  | Consistent fallback avatar (User2 icon) when no profile photo                                                                                                               |
| Post image grid     | Multiple images displayed in a responsive 2x2 grid with "+N more" overflow indicator                                                                                        |
| Form validation     | Inline field error messages with real-time validation via React Hook Form                                                                                                   |

### Issues & Improvements

| Issue                       | Severity | Detail                                                                                                          |
| --------------------------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| No real-time UI updates     | High     | Notifications and messages don't update in real-time. Requires page refresh. Socket.IO client is not connected. |
| Settings page is empty      | High     | Users cannot change their password, notification preferences, or account settings.                              |
| No DM conversation UI       | High     | Messages exist in the backend, but users cannot view or send DMs from the app.                                  |
| `App.jsx` stray semicolon   | Medium   | `<RouterProvider router={router} />;` — the semicolon renders as a stray text character in the DOM.             |
| No loading state on profile | Medium   | Profile page has no skeleton/spinner while data loads.                                                          |
| No empty state messages     | Medium   | Feed shows nothing when there are no posts — no "Be the first to post!" prompt.                                 |
| Bookmarks item in sidebar   | Low      | Clicking "Bookmarks" in the left sidebar goes nowhere (feature not implemented).                                |
| Story component placeholder | Low      | Stories UI component exists but stories are not rendered from the API.                                          |
| No image lightbox           | Low      | Clicking a post image doesn't open a full-size view.                                                            |
| Accessibility               | Low      | Many interactive elements lack `aria-label` or proper ARIA roles.                                               |

---

## 10. Deployment & Environment

### Current Setup

| Layer    | Platform                        | URL                                                                       |
| -------- | ------------------------------- | ------------------------------------------------------------------------- |
| Frontend | Netlify / Vercel / Render (any) | Configured via `_redirects`, `netlify.toml`, `vercel.json`, `render.yaml` |
| Backend  | Remote Linux server             | `https://buddyscripts.mtscorporate.com`                                   |
| Database | Remote PostgreSQL               | `147.93.107.217:5436`                                                     |

### Frontend Build & Deploy

```bash
# Install dependencies
cd cli && npm install

# Development server
npm run dev     # → http://localhost:5173

# Production build
npm run build   # → dist/ folder

# Preview production build
npm run preview
```

The `dist/` folder contains:

- `index.html` — the SPA shell
- `assets/` — hashed JS and CSS bundles
- `_redirects` — copied from `public/` for Netlify SPA routing

### Backend Environment Variables (`api/.env`)

| Variable                  | Required | Default        | Description                       |
| ------------------------- | -------- | -------------- | --------------------------------- |
| `DATABASE_URL`            | ✅       | —              | PostgreSQL connection string      |
| `JWT_ACCESS_SECRET`       | ✅       | —              | Secret for signing access tokens  |
| `JWT_REFRESH_SECRET`      | ✅       | —              | Secret for signing refresh tokens |
| `JWT_ACCESS_EXPIRES_IN`   | —        | `1h`           | Access token lifetime             |
| `JWT_REFRESH_EXPIRES_IN`  | —        | `7d`           | Refresh token lifetime            |
| `PORT`                    | —        | `3000`         | Server port                       |
| `NODE_ENV`                | —        | `dev`          | Environment (`dev`/`production`)  |
| `API_VERSION`             | —        | `v1`           | API version prefix                |
| `CORS_ORIGIN`             | —        | ``             | Comma-separated allowed origins   |
| `BCRYPT_ROUNDS`           | —        | `12`           | Password hash rounds              |
| `RATE_LIMIT_WINDOW_MS`    | —        | `1800000`      | Rate limit window (30 min)        |
| `RATE_LIMIT_MAX_REQUESTS` | —        | `2000`         | Max requests per window           |
| `REDIS_HOST`              | —        | `localhost`    | Redis host (not yet wired)        |
| `LOG_LEVEL`               | —        | `info`         | Winston log level                 |
| `LOG_FILE_PATH`           | —        | `logs/app.log` | Winston log file path             |

### Frontend Environment Variables (`cli/.env`)

| Variable       | Description                  |
| -------------- | ---------------------------- |
| `VITE_API_URL` | Base URL for the backend API |

> **Note:** Vite requires the `VITE_` prefix. `REACT_APP_` variables are ignored.

### Backend Start Commands

```bash
cd api

# Production
npm start         # node src/server.js

# Development (auto-reload)
npm run dev       # nodemon src/server.js

# Database
npm run prisma:generate   # Generate Prisma client
npm run prisma:migrate    # Run migrations
npm run prisma:studio     # Open Prisma Studio GUI
npm run seed              # Seed the database
```

---

## 11. Code Quality

### Strengths

| Quality Aspect          | Detail                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------ |
| Consistent naming       | camelCase for variables/functions, PascalCase for components and classes, kebab-case for files         |
| Clear layer separation  | Backend strictly follows Routes → Controllers → Services → Repositories                                |
| Custom error classes    | `AuthenticationError`, `ConflictError`, `NotFoundError`, `ValidationError` all properly extend `Error` |
| Centralized config      | All env vars validated and exported from a single `config/index.js`                                    |
| Standardized responses  | `responseFormatter` middleware ensures every response follows the same JSON envelope                   |
| Reusable HTTP helpers   | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` wrappers + `apiExecutor` reduce boilerplate in Redux thunks    |
| Component decomposition | Pages are thin wrappers; logic is in Redux features; UI is in components                               |
| AbortSignal support     | All thunks pass `signal` for proper request cancellation                                               |
| Memory management       | `URL.createObjectURL` / `URL.revokeObjectURL` used correctly in CreatePost                             |

### Weaknesses

| Issue                                  | Detail                                                                                                                                                                                             |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Inconsistent error message extraction  | `apiExecutor.js` passes raw `response.data` as the rejected value. Callers receive an object, but many do `toast.error(error)` expecting a string — resulting in `[object Object]` toast messages. |
| No TypeScript                          | No type safety. As the codebase grows, type errors will become harder to catch.                                                                                                                    |
| No test coverage                       | No frontend unit or integration tests. The backend has Jest configured but no test files written.                                                                                                  |
| Business logic leaking into components | `LeftSidebar.jsx` directly calls `GET`/`POST` from `httpMethods.js` instead of going through Redux actions — bypassing state management.                                                           |
| Hooks are too thin                     | `useAuth()` and `usePosts()` are one-liners that add a file without adding value. These could just be `useSelector` calls at the call site.                                                        |
| `main.jsx` vs `App.jsx` duplication    | The `RouterProvider` is in `App.jsx`, but a commented-out `app.css` import suggests the root structure was not finalized.                                                                          |
| Stale `.env.example` credentials       | The `DATABASE_URL` in `.env.example` contains a real-looking connection string with what appears to be an actual password. This should be replaced with a placeholder.                             |
| No ESLint enforcement on backend       | Only the frontend has an `eslint.config.js`. No linting on the API codebase.                                                                                                                       |

---

## 12. Missing Parts / Improvement Plan

### Priority 1 — Critical (Breaks Core Usage)

1. **Fix token refresh flow**
   - Add an Axios response interceptor in `axiosInstance.js`
   - On 401, call `POST /auth/refresh-token` and retry the original request
   - On refresh failure, dispatch `logout` and redirect to `/login`

2. **Fix error message extraction in `apiExecutor.js`**
   - Extract the human-readable message: `response?.data?.message || error.message`
   - This fixes all toast messages showing `[object Object]`

3. **Fix stray semicolon in `App.jsx`**
   - Change `<RouterProvider router={router} />;` to `<RouterProvider router={router} />`

4. **Use HttpOnly cookies for tokens**
   - Move token storage from `document.cookie` to server-set `HttpOnly` cookies
   - This requires a `POST /auth/login` endpoint to set the cookie on the server side

---

### Priority 2 — High (Major Missing Features)

5. **Connect Socket.IO in the frontend**
   - Install `socket.io-client`
   - Create a `services/socket.js` that connects with the JWT token
   - Integrate into notifications and messages features for real-time updates

6. **Build the DM (Direct Messages) UI**
   - Create `/messages` route and page
   - Conversation list sidebar
   - Chat view with send/receive messages and read receipts

7. **Build the Settings page**
   - Change password form (using existing `POST /auth/change-password`)
   - Avatar/cover photo update
   - Account deactivation option

8. **Implement infinite scroll on the feed**
   - Add an `IntersectionObserver` to the last post in `PostList.jsx`
   - Dispatch `fetchPosts({ cursor: nextCursor })` when visible

---

### Priority 3 — Medium (Quality & UX)

9. **Stories UI**
   - Create story component using Stories.jsx skeleton
   - Wire to `GET /api/v1/stories` and `POST /api/v1/stories`
   - Add story creation modal and full-screen viewer

10. **Groups UI**
    - Group discovery page at `/groups`
    - Group detail page with posts, members, and join/leave actions

11. **User Search UI**
    - Search bar in the Navbar
    - Results dropdown or `/search` page using `GET /users/search`

12. **Fix `fetchLikesList` spam**
    - Remove the `useEffect` in `PostCard.jsx` that fires on every mount
    - Only fetch likes when the user opens the likes modal

13. **Add route-level code splitting**
    - Use `React.lazy()` + `Suspense` for all page-level components
    - Reduces initial bundle from ~484KB to ~150KB

14. **Add Google OAuth**
    - Implement the "Register/Login with Google" button using the OAuth2 flow

---

### Priority 4 — Low (Polish & Scale)

15. **Add TypeScript** — Convert the frontend to TypeScript for type safety and better developer experience

16. **Redis caching** — Wire up the Redis config in `api/.env` for production-grade caching that survives server restarts

17. **CDN for uploaded files** — Move file storage from local `uploads/` to AWS S3 or Cloudflare R2

18. **Write tests** — Add Jest unit tests for services and repositories in the backend; add Vitest + Testing Library tests for components in the frontend

19. **Image lazy loading** — Add `loading="lazy"` to all `<img>` tags in the feed

20. **Accessibility audit** — Add `aria-label`, keyboard navigation, and focus management to interactive components

---

_This document was auto-generated by analyzing the complete BuddyScripts codebase as of April 2026. It covers both the `api/` backend and `cli/` frontend in full._
