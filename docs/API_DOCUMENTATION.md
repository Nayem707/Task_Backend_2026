# Social Feed API - Complete Endpoint Documentation

## Base URL
```
http://localhost:PORT/api/v1
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Authentication Endpoints

### 1. User Registration
**POST** `/auth/register`
- **Public** - No authentication required
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePass123!",
    "username": "username",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```
- **Response:** User object with access and refresh tokens

### 2. User Login
**POST** `/auth/login`
- **Public** - No authentication required
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePass123!"
  }
  ```
- **Response:** User object with tokens

### 3. Get User Profile
**GET** `/auth/me`
- **Protected** - Requires authentication
- **Response:** Current user profile

### 4. Refresh Token
**POST** `/auth/refresh-token`
- **Public**
- **Request Body:**
  ```json
  {
    "refreshToken": "refresh_token_here"
  }
  ```
- **Response:** New access and refresh tokens

### 5. Logout
**POST** `/auth/logout`
- **Protected** - Requires authentication
- **Response:** Logout success message

---

## Posts Endpoints

### 1. Create a Post
**POST** `/posts`
- **Protected** - Requires authentication
- **Request Body:**
  ```json
  {
    "content": "This is my new post",
    "imageUrl": "https://example.com/image.jpg",
    "visibility": "PUBLIC"
  }
  ```
- **Response:** Created post object

### 2. Get All Posts (Public Feed)
**GET** `/posts`
- **Public** - Optional authentication
- **Query Parameters:**
  - `page` (default: 1)
  - `limit` (default: 10)
  - `sortBy` (default: "createdAt")
  - `sortOrder` (default: "desc")
- **Response:** Array of posts with pagination

### 3. Get My Feed
**GET** `/posts/feed/me`
- **Protected** - Requires authentication
- **Query Parameters:**
  - `page` (default: 1)
  - `limit` (default: 10)
- **Response:** User's personalized feed

### 4. Get User's Posts
**GET** `/posts/user/:userId`
- **Public**
- **Query Parameters:**
  - `page` (default: 1)
  - `limit` (default: 10)
- **Response:** User's posts with pagination

### 5. Get Single Post
**GET** `/posts/:id`
- **Public**
- **Response:** Detailed post object including comments

### 6. Update Post
**PUT** `/posts/:id`
- **Protected** - Requires authentication (must be post owner)
- **Request Body:**
  ```json
  {
    "content": "Updated post content",
    "imageUrl": "https://example.com/new-image.jpg",
    "visibility": "PRIVATE"
  }
  ```
- **Response:** Updated post object

### 7. Delete Post
**DELETE** `/posts/:id`
- **Protected** - Requires authentication (must be post owner)
- **Response:** Success message

---

## Comments Endpoints

### 1. Create Comment on Post
**POST** `/posts/:postId/comments`
- **Protected** - Requires authentication
- **Request Body:**
  ```json
  {
    "content": "This is a great post!"
  }
  ```
- **Response:** Created comment object

### 2. Get Post Comments
**GET** `/posts/:postId/comments`
- **Public**
- **Query Parameters:**
  - `page` (default: 1)
  - `limit` (default: 10)
  - `sortBy` (default: "createdAt")
  - `sortOrder` (default: "desc")
- **Response:** Array of comments with replies (limited to 3 per comment)

### 3. Create Reply to Comment
**POST** `/comments/:commentId/replies`
- **Protected** - Requires authentication
- **Request Body:**
  ```json
  {
    "content": "Thanks for the comment!"
  }
  ```
- **Query Parameters:**
  - `postId` (required)
- **Response:** Created reply object

### 4. Get Comment Replies
**GET** `/comments/:commentId/replies`
- **Public**
- **Query Parameters:**
  - `page` (default: 1)
  - `limit` (default: 10)
  - `sortBy` (default: "createdAt")
  - `sortOrder` (default: "desc")
- **Response:** Array of replies with pagination

### 5. Get Single Comment
**GET** `/comments/:commentId`
- **Public**
- **Response:** Comment object with details

### 6. Update Comment
**PUT** `/comments/:commentId`
- **Protected** - Requires authentication (must be comment owner)
- **Request Body:**
  ```json
  {
    "content": "Updated comment text"
  }
  ```
- **Response:** Updated comment object

### 7. Delete Comment
**DELETE** `/comments/:commentId`
- **Protected** - Requires authentication (must be comment owner)
- **Response:** Success message

---

## Likes Endpoints

### 1. Toggle Like on Post
**POST** `/likes/posts/:postId/toggle`
- **Protected** - Requires authentication
- **Response:**
  ```json
  {
    "action": "liked",
    "liked": true
  }
  ```

### 2. Get Post Likes
**GET** `/likes/posts/:postId`
- **Public**
- **Query Parameters:**
  - `page` (default: 1)
  - `limit` (default: 10)
- **Response:** Array of users who liked the post

### 3. Get Post Like Statistics
**GET** `/likes/posts/:postId/stats`
- **Public**
- **Response:**
  ```json
  {
    "postId": "post_id",
    "likeCount": 42
  }
  ```

### 4. Toggle Like on Comment
**POST** `/likes/comments/:commentId/toggle`
- **Protected** - Requires authentication
- **Response:**
  ```json
  {
    "action": "liked",
    "liked": true
  }
  ```

### 5. Get Comment Likes
**GET** `/likes/comments/:commentId`
- **Public**
- **Query Parameters:**
  - `page` (default: 1)
  - `limit` (default: 10)
- **Response:** Array of users who liked the comment

### 6. Get Comment Like Statistics
**GET** `/likes/comments/:commentId/stats`
- **Public**
- **Response:**
  ```json
  {
    "commentId": "comment_id",
    "likeCount": 15
  }
  ```

---

## Health Check

### Service Health
**GET** `/health`
- **Public**
- **Response:**
  ```json
  {
    "status": "healthy",
    "timestamp": "2024-04-02T10:30:00Z",
    "version": "1.0.0",
    "environment": "development"
  }
  ```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "statusCode": 200,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "statusCode": 400,
  "data": null,
  "message": "Error description",
  "errors": [ ... ]
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Unprocessable Entity |
| 500 | Internal Server Error |

---

## Pagination

All list endpoints support pagination with:
- `page`: Page number (starting from 1)
- `limit`: Number of items per page
- `sortBy`: Field to sort by
- `sortOrder`: "asc" or "desc"

Response includes:
```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "pages": 5
  }
}
```

---

## Authentication JWT Token Claims

Access Token:
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "role": "USER",
  "iat": 1234567890,
  "exp": 1234571490
}
```

Refresh Token: Used to get new access tokens

---

## Rate Limiting

- Standard endpoints: 100 requests per 15 minutes per IP
- Authentication endpoints: 5 requests per 15 minutes per IP
- Create/Update/Delete: 30 requests per 15 minutes per user

---

## Validation Rules

### Post Content
- Minimum: 1 character
- Maximum: 5000 characters
- Required: Yes

### Comment Content
- Minimum: 1 character
- Maximum: 2000 characters
- Required: Yes

### User Password
- Minimum: 8 characters
- Must contain: Uppercase, lowercase, number, special character

### User Email
- Must be valid email format
- Must be unique

### Username
- Alphanumeric only
- 3-30 characters
- Optional but unique if provided

---

## Examples

### Example: Create a Post
```bash
curl -X POST http://localhost:3000/api/v1/posts \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Check out this amazing feature!",
    "visibility": "PUBLIC"
  }'
```

### Example: Toggle Like on Post
```bash
curl -X POST http://localhost:3000/api/v1/likes/posts/post_id/toggle \
  -H "Authorization: Bearer <access_token>"
```

### Example: Get Posts with Pagination
```bash
curl -X GET "http://localhost:3000/api/v1/posts?page=1&limit=10&sortOrder=desc" \
  -H "Content-Type: application/json"
```

---
