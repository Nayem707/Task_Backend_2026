/**
 * API Documentation Routes
 * GET /api/docs      - Interactive Swagger UI
 * GET /api/endpoints - JSON endpoint listing
 * GET /api/spec      - Raw OpenAPI JSON spec
 */

const express = require("express");
const router = express.Router();
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Social Feed API",
      version: "1.0.0",
      description:
        "Production-ready social feed backend — authentication, posts, comments, and likes.",
      contact: {
        name: "Nayem Islam",
        email: "inaeem707@gmail.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

/** GET /api/docs — Swagger UI */
router.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Social Feed API Documentation",
  }),
);

/** GET /api/endpoints — JSON endpoint catalogue */
router.get("/endpoints", (req, res) => {
  const catalogue = {
    success: true,
    message: "Social Feed API v1",
    version: "1.0.0",
    author: {
      name: "Nayem Islam",
      email: "inaeem707@gmail.com",
      title: "Backend Developer",
      image: "https://avatars.githubusercontent.com/u/94972992?v=4",
    },
    API_ENDPOINTS: {
      SYSTEM: {
        description: "Health and status monitoring",
        endpoints: [
          {
            method: "GET",
            path: "/health",
            auth: false,
            description: "Service health check",
          },
          {
            method: "GET",
            path: "/status",
            auth: false,
            description: "API running status",
          },
        ],
      },
      AUTH: {
        description:
          "User authentication — register, login, token refresh, profile, password reset",
        endpoints: [
          {
            method: "POST",
            path: "/api/v1/auth/register",
            auth: false,
            body: {
              email: "string (required)",
              password: "string (required, min 8 chars)",
              firstName: "string (required)",
              lastName: "string (required)",
            },
            description: "Register a new user account",
          },
          {
            method: "POST",
            path: "/api/v1/auth/login",
            auth: false,
            body: { email: "string (required)", password: "string (required)" },
            description: "Login and receive JWT token pair",
          },
          {
            method: "POST",
            path: "/api/v1/auth/refresh-token",
            auth: false,
            body: { refreshToken: "string (required)" },
            description: "Obtain a new access token via refresh token",
          },
          {
            method: "POST",
            path: "/api/v1/auth/logout",
            auth: true,
            description: "Logout (stateless — discard tokens client-side)",
          },
          {
            method: "GET",
            path: "/api/v1/auth/profile",
            auth: true,
            description: "Get the authenticated user's profile",
          },
          {
            method: "POST",
            path: "/api/v1/auth/forgot-password",
            auth: false,
            body: { email: "string (required)" },
            description: "Request a password-reset email",
          },
          {
            method: "POST",
            path: "/api/v1/auth/reset-password",
            auth: false,
            body: {
              token: "string (required)",
              newPassword: "string (required)",
            },
            description: "Reset password using the emailed token",
          },
        ],
      },
      USERS: {
        description: "User profiles, follow system, and search",
        endpoints: [
          {
            method: "GET",
            path: "/api/v1/users/me",
            auth: true,
            description: "Get authenticated user profile with follow stats",
          },
          {
            method: "PATCH",
            path: "/api/v1/users/me",
            auth: true,
            body: {
              firstName: "string (optional)",
              lastName: "string (optional)",
              bio: "string (optional)",
              avatar: "file upload (optional, multipart/form-data)",
            },
            description: "Update profile fields and/or avatar",
          },
          {
            method: "GET",
            path: "/api/v1/users/search",
            auth: false,
            query: "?q=&limit=20",
            description: "Search users by name or email",
          },
          {
            method: "GET",
            path: "/api/v1/users/:id",
            auth: false,
            description: "Get a public user profile by ID",
          },
          {
            method: "POST",
            path: "/api/v1/users/:id/follow",
            auth: true,
            description:
              "Toggle follow — follows if not following, unfollows if following",
          },
          {
            method: "GET",
            path: "/api/v1/users/:id/followers",
            auth: false,
            query: "?page=1&limit=20",
            description: "Get users who follow the given user",
          },
          {
            method: "GET",
            path: "/api/v1/users/:id/following",
            auth: false,
            query: "?page=1&limit=20",
            description: "Get users that the given user follows",
          },
        ],
      },
      POSTS: {
        description: "Global feed posts with cursor-based pagination",
        endpoints: [
          {
            method: "GET",
            path: "/api/v1/posts",
            auth: false,
            query: "?limit=10&cursor=",
            description: "Cursor-based global public feed. Auth optional.",
          },
          {
            method: "POST",
            path: "/api/v1/posts",
            auth: true,
            body: {
              content: "string (required)",
              visibility: "PUBLIC | PRIVATE (default PUBLIC)",
              image: "file upload (optional, multipart/form-data)",
            },
            description:
              "Create a new post. Send as JSON or multipart/form-data for image upload.",
          },
          {
            method: "GET",
            path: "/api/v1/posts/:id",
            auth: false,
            description: "Get a single post by ID",
          },
          {
            method: "DELETE",
            path: "/api/v1/posts/:id",
            auth: true,
            description: "Delete a post (owner only)",
          },
          {
            method: "POST",
            path: "/api/v1/posts/:id/like",
            auth: true,
            description: "Toggle like on a post",
          },
          {
            method: "GET",
            path: "/api/v1/posts/:id/likes",
            auth: false,
            description: "Get users who liked a post",
          },
        ],
      },
      COMMENTS: {
        description: "Post comments and nested replies",
        endpoints: [
          {
            method: "GET",
            path: "/api/v1/posts/:postId/comments",
            auth: false,
            query: "?page=1&limit=10",
            description: "Get top-level comments for a post",
          },
          {
            method: "POST",
            path: "/api/v1/posts/:postId/comments",
            auth: true,
            body: { content: "string (required)" },
            description: "Create a comment on a post",
          },
          {
            method: "GET",
            path: "/api/v1/comments/:commentId",
            auth: false,
            description: "Get a single comment by ID",
          },
          {
            method: "PUT",
            path: "/api/v1/comments/:commentId",
            auth: true,
            body: { content: "string (required)" },
            description: "Update a comment (owner only)",
          },
          {
            method: "DELETE",
            path: "/api/v1/comments/:commentId",
            auth: true,
            description: "Delete a comment (owner only)",
          },
          {
            method: "GET",
            path: "/api/v1/comments/:commentId/replies",
            auth: false,
            query: "?page=1&limit=10",
            description: "Get replies to a comment",
          },
          {
            method: "POST",
            path: "/api/v1/comments/:commentId/replies",
            auth: true,
            body: { content: "string (required)" },
            description: "Reply to a comment",
          },
          {
            method: "POST",
            path: "/api/v1/comments/:commentId/like",
            auth: true,
            description: "Toggle like on a comment",
          },
          {
            method: "GET",
            path: "/api/v1/comments/:commentId/likes",
            auth: false,
            description: "Get users who liked a comment",
          },
        ],
      },
      LIKES: {
        description: "Dedicated like/unlike endpoints for posts and comments",
        endpoints: [
          {
            method: "POST",
            path: "/api/v1/likes/posts/:postId/toggle",
            auth: true,
            description: "Toggle like on a post",
          },
          {
            method: "GET",
            path: "/api/v1/likes/posts/:postId",
            auth: false,
            description: "Get all users who liked a post",
          },
          {
            method: "GET",
            path: "/api/v1/likes/posts/:postId/stats",
            auth: false,
            description: "Get like count statistics for a post",
          },
          {
            method: "POST",
            path: "/api/v1/likes/comments/:commentId/toggle",
            auth: true,
            description: "Toggle like on a comment",
          },
          {
            method: "GET",
            path: "/api/v1/likes/comments/:commentId",
            auth: false,
            description: "Get all users who liked a comment",
          },
          {
            method: "GET",
            path: "/api/v1/likes/comments/:commentId/stats",
            auth: false,
            description: "Get like count statistics for a comment",
          },
        ],
      },
      STORIES: {
        description:
          "24-hour ephemeral stories with media upload and reactions",
        endpoints: [
          {
            method: "GET",
            path: "/api/v1/stories",
            auth: true,
            description: "Get active stories from followed users",
          },
          {
            method: "POST",
            path: "/api/v1/stories",
            auth: true,
            body: {
              media:
                "file upload (required, image or video, max 50 MB, multipart/form-data)",
            },
            description: "Upload a story. Expires after 24 hours.",
          },
          {
            method: "DELETE",
            path: "/api/v1/stories/:id",
            auth: true,
            description: "Delete a story (owner only)",
          },
          {
            method: "POST",
            path: "/api/v1/stories/:id/reaction",
            auth: true,
            body: { reaction: "string emoji (required)" },
            description:
              "React to a story. Upserts — replaces any previous reaction.",
          },
          {
            method: "GET",
            path: "/api/v1/stories/:id/reactions",
            auth: true,
            description: "Get all reactions for a story (owner only)",
          },
        ],
      },
      MESSAGES: {
        description:
          "Direct messages between users with cursor-based pagination",
        endpoints: [
          {
            method: "GET",
            path: "/api/v1/messages/conversations",
            auth: true,
            description:
              "Get recent conversations, deduplicated, most recent first",
          },
          {
            method: "GET",
            path: "/api/v1/messages/:userId",
            auth: true,
            query: "?limit=20&cursor=",
            description:
              "Cursor-paginated message history with a specific user",
          },
          {
            method: "POST",
            path: "/api/v1/messages/:userId",
            auth: true,
            body: { content: "string (required)" },
            description: "Send a direct message to a user",
          },
          {
            method: "PATCH",
            path: "/api/v1/messages/:id/read",
            auth: true,
            description: "Mark a message as read",
          },
        ],
      },
      GROUPS: {
        description:
          "Communities with members, roles, posts, comments, and likes",
        endpoints: [
          {
            method: "GET",
            path: "/api/v1/groups",
            auth: false,
            query: "?page=1&limit=20",
            description: "List public groups",
          },

          {
            method: "GET",
            path: "/api/v1/posts/feed/me",
            auth: true,
            query: "?page=1&limit=10",
            description:
              "Get authenticated user's timeline feed (self + followers + following)",
          },
          {
            method: "GET",
            path: "/api/v1/posts/timeline",
            auth: true,
            query: "?page=1&limit=10",
            description: "Alias of /posts/feed/me for timeline view",
          },
          {
            method: "GET",
            path: "/api/v1/posts/me",
            auth: true,
            query: "?page=1&limit=10",
            description: "Get only authenticated user's own posts",
          },
          {
            method: "GET",
            path: "/api/v1/posts/user/:userId",
            auth: false,
            query: "?page=1&limit=10",
            description: "Get posts by specific user",
          },
          {
            method: "POST",
            path: "/api/v1/groups",
            auth: true,
            body: {
              name: "string (required)",
              description: "string (optional)",
              visibility: "PUBLIC | PRIVATE (default PUBLIC)",
            },
            description: "Create a group. Creator is auto-assigned OWNER role.",
          },
          {
            method: "GET",
            path: "/api/v1/groups/:id",
            auth: false,
            description: "Get group details and member count",
          },
          {
            method: "PATCH",
            path: "/api/v1/groups/:id",
            auth: true,
            body: {
              name: "string (optional)",
              description: "string (optional)",
              visibility: "PUBLIC | PRIVATE (optional)",
            },
            description: "Update group info (Owner/Admin only)",
          },
          {
            method: "DELETE",
            path: "/api/v1/groups/:id",
            auth: true,
            description: "Delete a group (Owner only)",
          },
          {
            method: "POST",
            path: "/api/v1/groups/:id/join",
            auth: true,
            description:
              "Toggle membership. Private groups cannot be joined directly.",
          },
          {
            method: "GET",
            path: "/api/v1/groups/:id/members",
            auth: true,
            description: "Get all members with roles",
          },
          {
            method: "PATCH",
            path: "/api/v1/groups/:id/members/:userId",
            auth: true,
            body: { role: "MEMBER | ADMIN" },
            description: "Promote or demote a member (Owner only)",
          },
          {
            method: "GET",
            path: "/api/v1/groups/:id/posts",
            auth: true,
            query: "?page=1&limit=10",
            description: "Get paginated posts in a group",
          },
          {
            method: "POST",
            path: "/api/v1/groups/:id/posts",
            auth: true,
            body: {
              content: "string (required)",
              image: "file upload (optional)",
            },
            description: "Post to a group",
          },
          {
            method: "DELETE",
            path: "/api/v1/groups/posts/:postId",
            auth: true,
            description: "Delete a group post (Owner/Admin only)",
          },
          {
            method: "POST",
            path: "/api/v1/groups/posts/:postId/like",
            auth: true,
            description: "Toggle like on a group post",
          },
          {
            method: "GET",
            path: "/api/v1/groups/posts/:postId/comments",
            auth: true,
            description: "Get comments on a group post",
          },
          {
            method: "POST",
            path: "/api/v1/groups/posts/:postId/comments",
            auth: true,
            body: { content: "string (required)" },
            description: "Comment on a group post",
          },
          {
            method: "POST",
            path: "/api/v1/groups/comments/:commentId/replies",
            auth: true,
            body: { content: "string (required)" },
            description: "Reply to a group comment",
          },
          {
            method: "DELETE",
            path: "/api/v1/groups/comments/:commentId",
            auth: true,
            description: "Delete a group comment (Owner/Admin only)",
          },
          {
            method: "POST",
            path: "/api/v1/groups/comments/:commentId/like",
            auth: true,
            description: "Toggle like on a group comment",
          },
        ],
      },
      NOTIFICATIONS: {
        description:
          "In-app notifications for likes, comments, follows, and story reactions",
        endpoints: [
          {
            method: "GET",
            path: "/api/v1/notifications",
            auth: true,
            query: "?page=1&limit=20",
            description:
              "Get paginated notifications for the authenticated user",
          },
          {
            method: "PATCH",
            path: "/api/v1/notifications/:id/read",
            auth: true,
            description: "Mark a single notification as read",
          },
          {
            method: "PATCH",
            path: "/api/v1/notifications/read-all",
            auth: true,
            description: "Mark all unread notifications as read",
          },
        ],
      },
    },
  };

  res.sendSuccess(catalogue);
});

/** GET /api/spec — raw OpenAPI JSON */
router.get("/spec", (req, res) => {
  res.json(swaggerSpec);
});

module.exports = router;
