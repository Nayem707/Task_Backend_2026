# Quick Start Guide - Social Feed Backend

Get the backend up and running in 5 minutes!

## Prerequisites

- Node.js 16+
- PostgreSQL 12+
- npm or yarn
- Git

## Quick Setup

### 1. Clone & Install (2 minutes)
```bash
cd api
npm install
```

### 2. Configure Database (1 minute)
Create `.env` file:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/social_feed
JWT_ACCESS_TOKEN_SECRET=dev-secret-key-change-in-production
JWT_REFRESH_TOKEN_SECRET=dev-refresh-key-change-in-production
PORT=3000
NODE_ENV=development
```

### 3. Setup Prisma (1 minute)
```bash
npm run prisma:generate
npm run prisma:migrate
npm run seed  # optional - adds sample data
```

### 4. Start Server (1 minute)
```bash
npm run dev
```

Server running at: `http://localhost:3000`

---

## Quick Test

### Register a User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

Save the `accessToken` from the response.

### Create a Post
```bash
curl -X POST http://localhost:3000/api/v1/posts \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello world!"
  }'
```

### Get All Posts
```bash
curl -X GET http://localhost:3000/api/v1/posts
```

---

## Available Commands

```bash
npm run dev           # Start dev server (auto-reload)
npm start             # Start production server
npm run prisma:studio # Open database GUI
npm run seed          # Add sample data
npm test              # Run tests
npm run lint          # Check code style
```

---

## Project Structure

```
api/
├── src/
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic
│   ├── repositories/     # Database queries
│   ├── routes/           # API endpoints
│   ├── middlewares/      # Middleware functions
│   ├── validators/       # Input validation
│   ├── utils/            # Utilities
│   ├── config/           # Configuration
│   ├── app.js            # Express app
│   └── server.js         # Entry point
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
├── logs/                 # Application logs
├── .env.example          # Environment template
├── API_DOCUMENTATION.md  # API docs
└── BACKEND_README.md     # Full guide
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/auth/register` | ❌ |
| POST | `/auth/login` | ❌ |
| GET | `/auth/me` | ✅ |
| POST | `/auth/logout` | ✅ |

### Posts
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/posts` | ❌ |
| POST | `/posts` | ✅ |
| GET | `/posts/:id` | ❌ |
| PUT | `/posts/:id` | ✅ |
| DELETE | `/posts/:id` | ✅ |

### Comments
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/posts/:postId/comments` | ❌ |
| POST | `/posts/:postId/comments` | ✅ |
| GET | `/comments/:commentId/replies` | ❌ |
| POST | `/comments/:commentId/replies` | ✅ |

### Likes
| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/likes/posts/:postId/toggle` | ✅ |
| GET | `/likes/posts/:postId` | ❌ |
| POST | `/likes/comments/:commentId/toggle` | ✅ |
| GET | `/likes/comments/:commentId` | ❌ |

✅ = Requires authentication
❌ = Public

---

## Common Issues

### Database Connection Error
```
Error: connect ECONNREFUSED

Fix: Make sure PostgreSQL is running
```

### Port Already in Use
```
Error: listen EADDRINUSE :::3000

Fix: Change PORT in .env or kill process
```

### Module Not Found
```
Error: require("../routes/posts.routes")

Fix: Run npm install
```

---

## Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@localhost/db` |
| `JWT_ACCESS_TOKEN_SECRET` | JWT secret | `your-secret-key` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `CORS_ORIGIN` | CORS allowed origins | `http://localhost:5173` |

---

## Next Steps

1. ✅ Backend is running
2. 📱 **Connect Frontend:** Update API URL in frontend
3. 🧪 **Test APIs:** Use Postman or cURL
4. 📚 **Read Docs:** Check `API_DOCUMENTATION.md`
5. 🚀 **Deploy:** Follow production checklist in `BACKEND_README.md`

---

## Support

| Need | Reference |
|------|-----------|
| API endpoints | `API_DOCUMENTATION.md` |
| Setup help | `BACKEND_README.md` |
| Database schema | `prisma/schema.prisma` |
| Implementation | `IMPLEMENTATION_SUMMARY.md` |

---

## Database Schema

**User** → Posts, Comments, Likes
**Post** → Comments, Likes  
**Comment** → Replies (self-referential), Likes
**Like** → Post or Comment (polymorphic)

---

Happy coding! 🚀
