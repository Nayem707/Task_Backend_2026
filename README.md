# Social Feed API

A full-featured social media backend REST API built with Node.js, Express, Prisma ORM, PostgreSQL, and Socket.IO. Supports posts, comments, likes, stories, direct messaging, groups, notifications, and real-time events.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Models](#database-models)
- [API Endpoints](#api-endpoints)
- [Real-Time Events (Socket.IO)](#real-time-events-socketio)
- [Authentication](#authentication)
- [File Uploads](#file-uploads)
- [Caching](#caching)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Project Structure](#project-structure)

---

## Overview

This API powers a social networking platform with the following core capabilities:

- User registration, login, and profile management
- Social graph (follow / unfollow)
- Global post feed (cursor-based pagination)
- Nested comments and threaded replies
- Polymorphic likes on posts and comments
- 24-hour expiring stories with emoji reactions
- Direct messaging with delivery/read receipts
- Groups and communities (with OWNER / ADMIN / MEMBER roles)
- Push-style notifications for social interactions
- Real-time updates via WebSocket (Socket.IO)
- Swagger / OpenAPI interactive documentation

---

## Tech Stack

| Layer        | Technology                       |
| ------------ | -------------------------------- |
| Runtime      | Node.js ≥ 16                     |
| Framework    | Express 4                        |
| ORM          | Prisma 5                         |
| Database     | PostgreSQL                       |
| Real-time    | Socket.IO 4                      |
| Auth         | JWT (access + refresh tokens)    |
| Validation   | express-validator / Joi          |
| File uploads | Multer (disk storage)            |
| Caching      | In-memory TTL cache              |
| Logging      | Winston                          |
| Security     | Helmet, CORS, express-rate-limit |
| API Docs     | Swagger UI (swagger-jsdoc)       |
| Testing      | Jest + Supertest                 |

---

## Architecture

The project follows a layered architecture pattern:

```
HTTP Request
    │
    ▼
Routes          — define endpoints, attach middleware
    │
    ▼
Controllers     — parse request, call service, send response
    │
    ▼
Services        — business logic, orchestration
    │
    ▼
Repositories    — database queries (Prisma)
    │
    ▼
PostgreSQL (via Prisma)
```

**Middleware pipeline** (applied in order):

1. `helmet` — security headers
2. `cors` — cross-origin policy
3. `express-rate-limit` — rate limiting on `/api/*`
4. `express.json` / `express.urlencoded` — body parsing
5. `responseFormatter` — wraps all responses in a standard envelope
6. Request logger (`winston`)

---

## Database Models

All models are defined in `prisma/schema.prisma`.

| Model           | Description                                                                                               |
| --------------- | --------------------------------------------------------------------------------------------------------- |
| `User`          | Core user account with profile fields, avatar, cover photo                                                |
| `Post`          | User posts with optional image; supports PUBLIC / PRIVATE / FRIENDS_ONLY visibility                       |
| `Comment`       | Nested comments on posts; supports unlimited depth via `parentId`                                         |
| `Like`          | Polymorphic — can target a `Post` or a `Comment`                                                          |
| `Follow`        | Self-referential many-to-many (follower → following)                                                      |
| `Story`         | 24-hour expiring media (image/video) with `expiresAt` field                                               |
| `StoryReaction` | Emoji reactions on stories; one reaction per user per story                                               |
| `Message`       | Direct messages between two users; status: SENT / DELIVERED / READ                                        |
| `Notification`  | Activity feed notifications; types: LIKE, COMMENT, FOLLOW, MESSAGE, MENTION, GROUP_INVITE, STORY_REACTION |
| `Group`         | Community/group with avatar, cover, visibility                                                            |
| `GroupMember`   | Group membership with roles: OWNER / ADMIN / MEMBER                                                       |
| `GroupPost`     | Posts scoped to a group                                                                                   |
| `GroupComment`  | Nested comments on group posts                                                                            |
| `GroupLike`     | Likes on group posts and group comments                                                                   |

---

## API Endpoints

Base URL: `/api/v1`

### Authentication

| Method | Path                    | Auth | Description                                 |
| ------ | ----------------------- | ---- | ------------------------------------------- |
| POST   | `/auth/register`        | —    | Register a new user                         |
| POST   | `/auth/login`           | —    | Login and receive access + refresh tokens   |
| POST   | `/auth/logout`          | ✓    | Invalidate current session                  |
| POST   | `/auth/refresh-token`   | —    | Exchange refresh token for new access token |
| GET    | `/auth/profile`         | ✓    | Get current user's profile                  |
| POST   | `/auth/forgot-password` | —    | Request a password reset link               |
| POST   | `/auth/reset-password`  | —    | Reset password using token                  |

### Users

| Method | Path                   | Auth     | Description                             |
| ------ | ---------------------- | -------- | --------------------------------------- |
| GET    | `/users/me`            | ✓        | Get authenticated user's own profile    |
| PATCH  | `/users/me`            | ✓        | Update profile (supports avatar upload) |
| GET    | `/users/search`        | optional | Search users by name/email              |
| GET    | `/users/:id`           | optional | Get a user's public profile             |
| POST   | `/users/:id/follow`    | ✓        | Toggle follow/unfollow                  |
| GET    | `/users/:id/followers` | optional | List followers                          |
| GET    | `/users/:id/following` | optional | List followed accounts                  |

### Posts

| Method | Path                  | Auth     | Description                           |
| ------ | --------------------- | -------- | ------------------------------------- |
| GET    | `/posts`              | optional | Global feed (cursor-based pagination) |
| POST   | `/posts`              | ✓        | Create a post (supports image upload) |
| GET    | `/posts/:id`          | optional | Get a single post                     |
| DELETE | `/posts/:id`          | ✓        | Delete a post                         |
| POST   | `/posts/:id/like`     | ✓        | Toggle like on a post                 |
| GET    | `/posts/:id/likes`    | optional | List likers of a post                 |
| GET    | `/posts/:id/comments` | optional | List comments on a post               |

### Comments

| Method | Path                      | Auth | Description             |
| ------ | ------------------------- | ---- | ----------------------- |
| POST   | `/posts/:postId/comments` | ✓    | Add a top-level comment |
| POST   | `/comments/:id/replies`   | ✓    | Reply to a comment      |
| DELETE | `/comments/:id`           | ✓    | Delete a comment        |

### Likes

| Method | Path                                | Auth | Description                  |
| ------ | ----------------------------------- | ---- | ---------------------------- |
| POST   | `/likes/posts/:postId/toggle`       | ✓    | Toggle like on a post        |
| GET    | `/likes/posts/:postId`              | —    | Get likes for a post         |
| GET    | `/likes/posts/:postId/stats`        | —    | Get like count for a post    |
| POST   | `/likes/comments/:commentId/toggle` | ✓    | Toggle like on a comment     |
| GET    | `/likes/comments/:commentId`        | —    | Get likes for a comment      |
| GET    | `/likes/comments/:commentId/stats`  | —    | Get like count for a comment |

### Stories

| Method | Path                     | Auth | Description                                    |
| ------ | ------------------------ | ---- | ---------------------------------------------- |
| GET    | `/stories`               | ✓    | Get active stories from followed users         |
| POST   | `/stories`               | ✓    | Create a 24-hour story (supports media upload) |
| DELETE | `/stories/:id`           | ✓    | Delete a story                                 |
| POST   | `/stories/:id/reaction`  | ✓    | React to a story with an emoji                 |
| GET    | `/stories/:id/reactions` | ✓    | Get reactions for a story                      |

### Messages

| Method | Path                      | Auth | Description                     |
| ------ | ------------------------- | ---- | ------------------------------- |
| GET    | `/messages/conversations` | ✓    | List all conversations          |
| GET    | `/messages/:userId`       | ✓    | Get message history with a user |
| POST   | `/messages/:userId`       | ✓    | Send a message to a user        |
| PATCH  | `/messages/:id/read`      | ✓    | Mark a message as read          |

### Groups

| Method | Path                                  | Auth     | Description                             |
| ------ | ------------------------------------- | -------- | --------------------------------------- |
| GET    | `/groups`                             | optional | List all public groups                  |
| POST   | `/groups`                             | ✓        | Create a group                          |
| GET    | `/groups/:id`                         | optional | Get group details                       |
| PATCH  | `/groups/:id`                         | ✓        | Update group info                       |
| DELETE | `/groups/:id`                         | ✓        | Delete a group (owner only)             |
| POST   | `/groups/:id/join`                    | ✓        | Toggle join/leave group                 |
| GET    | `/groups/:id/members`                 | ✓        | List group members                      |
| PATCH  | `/groups/:id/members/:userId`         | ✓        | Update a member's role                  |
| GET    | `/groups/:id/posts`                   | ✓        | Get group feed                          |
| POST   | `/groups/:id/posts`                   | ✓        | Post to a group (supports image upload) |
| DELETE | `/groups/posts/:postId`               | ✓        | Delete a group post                     |
| POST   | `/groups/posts/:postId/like`          | ✓        | Like a group post                       |
| GET    | `/groups/posts/:postId/comments`      | ✓        | Get comments on a group post            |
| POST   | `/groups/posts/:postId/comments`      | ✓        | Comment on a group post                 |
| POST   | `/groups/comments/:commentId/replies` | ✓        | Reply to a group comment                |
| DELETE | `/groups/comments/:commentId`         | ✓        | Delete a group comment                  |
| POST   | `/groups/comments/:commentId/like`    | ✓        | Like a group comment                    |

### Notifications

| Method | Path                      | Auth | Description                        |
| ------ | ------------------------- | ---- | ---------------------------------- |
| GET    | `/notifications`          | ✓    | Get notifications for current user |
| PATCH  | `/notifications/read-all` | ✓    | Mark all notifications as read     |
| PATCH  | `/notifications/:id/read` | ✓    | Mark a single notification as read |

### System

| Method | Path      | Auth | Description                   |
| ------ | --------- | ---- | ----------------------------- |
| GET    | `/health` | —    | Health check / liveness probe |

### API Documentation

Interactive Swagger UI is available at `/api/docs`.

---

## Real-Time Events (Socket.IO)

Socket.IO runs on the same HTTP server. Connect with a valid JWT in the `auth.token` handshake field or `Authorization: Bearer <token>` header.

Each authenticated user is automatically placed in a private room identified by their `userId`.

### Events emitted **to** clients

| Event              | Payload            | When                            |
| ------------------ | ------------------ | ------------------------------- |
| `new_message`      | `{ message }`      | A direct message is received    |
| `new_notification` | `{ notification }` | A new notification is triggered |
| `typing`           | `{ fromUserId }`   | Another user is typing to you   |
| `stop_typing`      | `{ fromUserId }`   | Another user stopped typing     |

### Events emitted **by** clients

| Event         | Payload        | Purpose                                    |
| ------------- | -------------- | ------------------------------------------ |
| `join`        | —              | Called on connect; auto-joins private room |
| `typing`      | `{ toUserId }` | Signal typing to a specific user           |
| `stop_typing` | `{ toUserId }` | Signal stopped typing                      |

---

## Authentication

The API uses a dual-token strategy:

- **Access token** — short-lived (default: 15 minutes), sent as `Authorization: Bearer <token>` on every protected request.
- **Refresh token** — long-lived (default: 7 days), used only to obtain a new access token via `POST /auth/refresh-token`.

Passwords are hashed with **bcryptjs** (default 12 rounds).

User resolution on authenticated routes uses an **in-memory cache** (14-minute TTL) keyed on the last 32 characters of the access token to reduce database round-trips on hot paths.

---

## File Uploads

Handled by **Multer** with disk storage. Uploaded files are saved to `uploads/` at the project root with UUID-based filenames to prevent collisions.

- Accepted MIME types: `image/jpeg`, `image/jpg`, `image/png`, `image/gif`, `image/webp`
- Maximum file size: **2 MB**
- Endpoints that support uploads: `POST /posts`, `PATCH /users/me`, `POST /stories`, `POST /groups`, `POST /groups/:id/posts`

---

## Caching

An in-memory TTL cache module (`src/utils/cache.js`) reduces repeated database queries. It supports `get`, `set` (with TTL in ms), `del`, `delByPrefix`, and `flush`.

Current usage:

- Authenticated user data: 14-minute TTL per access token

> Redis is listed as a dependency and configured via `REDIS_HOST` / `REDIS_PORT` environment variables but is available for future use (e.g. session storage, distributed rate limiting).

---

## Getting Started

### Prerequisites

- Node.js ≥ 16
- PostgreSQL database
- (Optional) Redis instance

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL, JWT secrets, etc.

# Run database migrations and seed
npm run beed
# (equivalent to: prisma generate + prisma migrate dev + seed)

# Start development server
npm run dev
```

### Production

```bash
npm run prisma:deploy   # apply migrations without prompting
npm start
```

---

## Environment Variables

| Variable                  | Default                 | Description                        |
| ------------------------- | ----------------------- | ---------------------------------- |
| `DATABASE_URL`            | **required**            | PostgreSQL connection string       |
| `JWT_ACCESS_SECRET`       | **required**            | Secret for signing access tokens   |
| `JWT_REFRESH_SECRET`      | **required**            | Secret for signing refresh tokens  |
| `PORT`                    | `3000`                  | HTTP server port                   |
| `NODE_ENV`                | `dev`                   | Environment (`dev` / `production`) |
| `API_VERSION`             | `v1`                    | API version prefix                 |
| `JWT_ACCESS_EXPIRES_IN`   | `15m`                   | Access token lifetime              |
| `JWT_REFRESH_EXPIRES_IN`  | `7d`                    | Refresh token lifetime             |
| `BCRYPT_ROUNDS`           | `12`                    | bcrypt hashing cost factor         |
| `CORS_ORIGIN`             | `http://localhost:5173` | Comma-separated allowed origins    |
| `RATE_LIMIT_WINDOW_MS`    | `1800000`               | Rate limit window (ms) — 30 min    |
| `RATE_LIMIT_MAX_REQUESTS` | `2000`                  | Max requests per window            |
| `REDIS_HOST`              | `localhost`             | Redis host                         |
| `REDIS_PORT`              | `6379`                  | Redis port                         |
| `REDIS_PASSWORD`          | `""`                    | Redis password                     |
| `LOG_LEVEL`               | `info`                  | Winston log level                  |
| `LOG_FILE_PATH`           | `logs/app.log`          | Log file location                  |
| `ANALYTICS_CRON_SCHEDULE` | `0 0 * * *`             | Analytics cron (daily midnight)    |

---

## Scripts

| Script                    | Description                               |
| ------------------------- | ----------------------------------------- |
| `npm start`               | Start production server                   |
| `npm run dev`             | Start development server with nodemon     |
| `npm test`                | Run Jest test suite                       |
| `npm run test:watch`      | Run tests in watch mode                   |
| `npm run prisma:generate` | Regenerate Prisma client                  |
| `npm run prisma:migrate`  | Create and apply a new migration          |
| `npm run prisma:deploy`   | Apply pending migrations (production)     |
| `npm run prisma:studio`   | Open Prisma Studio GUI                    |
| `npm run seed`            | Run database seed script                  |
| `npm run beed`            | Generate + migrate + seed (full DB setup) |

---

## Project Structure

```
api/
├── prisma/
│   ├── schema.prisma        # Database schema (all models and enums)
│   ├── seed.js              # Database seeder
│   └── migrations/          # Prisma migration history
├── src/
│   ├── server.js            # Entry point — starts HTTP server
│   ├── app.js               # Express app class — middleware + routes
│   ├── config/
│   │   ├── index.js         # Centralised config from env variables
│   │   └── database.js      # Prisma client singleton
│   ├── routes/              # Route definitions (one file per domain)
│   ├── controllers/         # Request handling and response shaping
│   ├── services/            # Business logic and orchestration
│   ├── repositories/        # Database access layer (Prisma queries)
│   ├── middlewares/
│   │   ├── auth.js          # JWT verification, optionalAuthenticate
│   │   ├── errorHandler.js  # Global error handler + custom error classes
│   │   ├── responseFormatter.js  # Standard response envelope
│   │   ├── upload.js        # Multer configuration
│   │   └── validation.js    # Request validation helpers
│   ├── socket/
│   │   └── index.js         # Socket.IO server setup and event handlers
│   └── utils/
│       ├── apiResponse.js   # Response builder helpers
│       ├── cache.js         # In-memory TTL cache
│       ├── jwt.js           # Token sign / verify helpers
│       ├── logger.js        # Winston logger
│       ├── notificationHelper.js  # Notification creation helpers
│       ├── socketEmit.js    # Helpers to emit socket events from services
│       └── stringHelpers.js # General string utilities
├── uploads/                 # Uploaded files (git-ignored)
├── logs/                    # Log files (git-ignored)
└── docs/                    # Extended documentation and Postman collection
```

---

## License

MIT
