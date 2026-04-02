# Social Feed Backend API

A production-ready Node.js Express backend for a social feed application with user authentication, posts, comments, replies, and likes functionality.

## Features

✅ **User Authentication**
- JWT-based authentication
- Secure password hashing with bcryptjs
- Token refresh mechanism
- Session management

✅ **Posts Management**
- Create, read, update, delete posts
- Post visibility (PUBLIC/PRIVATE)
- Image support via URLs
- Pagination and sorting

✅ **Comments & Replies**
- Multi-level comments (comments and replies)
- Comment threads
- Edit and delete capabilities
- Pagination support

✅ **Likes System**
- Like/unlike posts and comments
- Like counts and statistics
- User like lists

✅ **Security & Best Practices**
- Helmet.js for secure HTTP headers
- CORS configuration
- Rate limiting
- Request validation with Joi
- SQL injection protection via Prisma ORM
- Winston logging
- Error handling middleware

✅ **Database**
- PostgreSQL with Prisma ORM
- Optimized indexes for performance
- Relationship management
- Transaction support

✅ **Caching**
- Redis integration for authentication caching
- Improved response times

---

## Tech Stack

- **Runtime:** Node.js 16+
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT
- **Validation:** Joi
- **Logging:** Winston
- **Password Hashing:** bcryptjs
- **Security:** Helmet, CORS, Rate Limiting
- **Cache:** Redis

---

## Installation

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- Redis (optional but recommended)
- npm or yarn

### Setup Steps

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd api
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Create .env file
   cp .env.example .env
   
   # Update .env with your configuration
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma Client
   npm run prisma:generate
   
   # Run migrations
   npm run prisma:migrate
   
   # Seed database (optional)
   npm run seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   Server runs on `http://localhost:3000` (or your configured PORT)

---

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/social_feed

# JWT
JWT_ACCESS_TOKEN_SECRET=your_access_token_secret_here
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
JWT_REFRESH_TOKEN_EXPIRY=7d

# Security
BCRYPT_ROUNDS=10
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Redis
REDIS_URL=redis://localhost:6379
REDIS_DB=0

# Logging
LOG_LEVEL=info
LOG_DIR=./logs

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_UPLOAD_TYPES=image/jpeg,image/png,image/gif,image/webp
```

---

## Available Scripts

```bash
# Development
npm run dev              # Start dev server with nodemon

# Production
npm start               # Start production server

# Database
npm run prisma:generate # Generate Prisma Client
npm run prisma:migrate  # Run pending migrations
npm run prisma:deploy   # Deploy migrations (production)
npm run prisma:studio   # Open Prisma Studio UI
npm run seed           # Seed database with sample data

# Testing
npm test               # Run tests
npm run test:watch     # Run tests in watch mode

# Linting & Formatting
npm run lint           # Run ESLint
npm run format         # Format code with Prettier
```

---

## Project Structure

```
api/
├── src/
│   ├── app.js                          # Express app setup
│   ├── server.js                       # Server entry point
│   ├── config/                         # Configuration
│   │   ├── index.js                    # Config loader
│   │   └── database.js                 # Database connection
│   ├── controllers/                    # Request handlers
│   │   ├── auth.controller.js
│   │   ├── posts.controller.js
│   │   ├── comments.controller.js
│   │   └── likes.controller.js
│   ├── services/                       # Business logic
│   │   ├── auth.service.js
│   │   ├── posts.service.js
│   │   ├── comments.service.js
│   │   └── likes.service.js
│   ├── repositories/                   # Database queries
│   │   ├── auth.repository.js
│   │   ├── posts.repository.js
│   │   ├── comments.repository.js
│   │   └── likes.repository.js
│   ├── routes/                         # API routes
│   │   ├── index.js                    # Main router
│   │   ├── auth.routes.js
│   │   ├── posts.routes.js
│   │   ├── comments.routes.js
│   │   └── likes.routes.js
│   ├── middlewares/                    # Express middlewares
│   │   ├── auth.js                     # Authentication
│   │   ├── errorHandler.js             # Error handling
│   │   ├── validation.js               # Request validation
│   │   ├── responseFormatter.js        # Response formatting
│   │   └── upload.js                   # File uploads (optional)
│   ├── validators/                     # Joi validation schemas
│   │   ├── auth.validator.js
│   │   ├── posts.validator.js
│   │   ├── comments.validator.js
│   │   └── likes.validator.js
│   ├── utils/                          # Utilities
│   │   ├── logger.js                   # Winston logging
│   │   ├── jwt.js                      # JWT utilities
│   │   ├── cache.js                    # Caching utilities
│   │   ├── apiResponse.js              # Response formatting
│   │   └── stringHelpers.js            # String utilities
│   └── uploads/                        # User uploads directory
├── prisma/
│   ├── schema.prisma                   # Database schema
│   ├── seed.js                         # Database seeding
│   └── migrations/                     # Migration files
├── logs/                               # Application logs
├── .env.example                        # Environment template
├── .gitignore
├── package.json
└── API_DOCUMENTATION.md                # API docs
```

---

## API Endpoints Overview

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user profile
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/refresh-token` - Refresh access token

### Posts
- `GET /api/v1/posts` - Get all public posts
- `POST /api/v1/posts` - Create post
- `GET /api/v1/posts/:id` - Get single post
- `PUT /api/v1/posts/:id` - Update post
- `DELETE /api/v1/posts/:id` - Delete post
- `GET /api/v1/posts/user/:userId` - Get user's posts
- `GET /api/v1/posts/feed/me` - Get user's feed

### Comments
- `GET /api/v1/posts/:postId/comments` - Get post comments
- `POST /api/v1/posts/:postId/comments` - Create comment
- `GET /api/v1/comments/:commentId` - Get single comment
- `PUT /api/v1/comments/:commentId` - Update comment
- `DELETE /api/v1/comments/:commentId` - Delete comment
- `POST /api/v1/comments/:commentId/replies` - Create reply
- `GET /api/v1/comments/:commentId/replies` - Get replies

### Likes
- `POST /api/v1/likes/posts/:postId/toggle` - Toggle like on post
- `GET /api/v1/likes/posts/:postId` - Get post likes
- `GET /api/v1/likes/posts/:postId/stats` - Get post like statistics
- `POST /api/v1/likes/comments/:commentId/toggle` - Toggle like on comment
- `GET /api/v1/likes/comments/:commentId` - Get comment likes
- `GET /api/v1/likes/comments/:commentId/stats` - Get comment like statistics

---

## Testing the API

### Using cURL

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'

# Create Post (replace token with actual token)
curl -X POST http://localhost:3000/api/v1/posts \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello, world!",
    "visibility": "PUBLIC"
  }'
```

### Using Postman

1. Import the API collection (see API_DOCUMENTATION.md)
2. Set up environment variables for tokens
3. Execute requests from the collection

---

## Database Migrations

### Create a Migration

```bash
npm run prisma:migrate
# Enter migration name when prompted
```

### View Migration Status

```bash
prisma migrate status
```

### Reset Database (development only)

```bash
npx prisma migrate reset
```

---

## Logging

Logs are stored in the `/logs` directory with different levels:
- `error.log` - Error logs only
- `combined.log` - All logs
- Console output in development mode

---

## Performance Optimization

The backend includes several optimizations:

1. **Database Indexing** - Optimized indexes for common queries
2. **Caching** - Redis integration for session/auth caching
3. **Pagination** - All list endpoints support pagination
4. **Query Optimization** - Selectfields and eagerly loaded relations
5. **Rate Limiting** - Prevents abuse
6. **Compression** - Response compression enabled

---

## Security Considerations

✅ **Implemented:**
- JWT with expiring tokens
- Password hashing (bcryptjs)
- CORS protection
- Rate limiting
- Helmet security headers
- Input validation & sanitization
- SQL injection protection (Prisma ORM)
- XSS protection
- Error message sanitization

⚠️ **For Production:**
- Use strong JWT secrets
- Enable HTTPS
- Configure environment variables securely
- Set up comprehensive logging
- Use Redis for distributed sessions
- Implement monitoring and alerting
- Regular security audits
- Database backups

---

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432

Solution: Ensure PostgreSQL is running
```

### JWT Token Errors
```
Error: Invalid token

Solution: Check token expiry and refresh if needed
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000

Solution: Kill process on port 3000 or use different PORT
```

---

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

---

## License

MIT License - see LICENSE file for details

---

## Support

For issues and questions:
- Check API_DOCUMENTATION.md for detailed endpoint documentation
- Review error logs in `/logs` directory
- Open an issue in the repository

---

## Changelog

### Version 1.0.0 (Initial Release)
- User authentication with JWT
- Posts management (CRUD)
- Comments and replies system
- Likes functionality
- Comprehensive error handling
- Request validation
- Rate limiting
- Winston logging
- PostgreSQL with Prisma

---

## Future Enhancements

- [ ] File upload system for post images
- [ ] User follows/followers functionality
- [ ] Direct messaging
- [ ] Post search and filtering
- [ ] Notifications system
- [ ] User profiles with custom fields
- [ ] Hashtag support
- [ ] Search functionality
- [ ] Admin dashboard
- [ ] Content moderation

---
