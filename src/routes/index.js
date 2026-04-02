/**
 * Main API routes configuration
 */

const express = require("express");
const config = require("../config");

const authRoutes = require("./auth.routes");
const postsRoutes = require("./posts.routes");
const commentsRoutes = require("./comments.routes");
const likesRoutes = require("./likes.routes");
const usersRoutes = require("./users.routes");
const storiesRoutes = require("./stories.routes");
const messagesRoutes = require("./messages.routes");
const groupsRoutes = require("./groups.routes");
const notificationsRoutes = require("./notifications.routes");
const apiDocsRoutes = require("./apiDocs.routes");
const systemRoutes = require("./system.routes");

const router = express.Router();
const API_PREFIX = `/api/${config.API_VERSION}`;

router.use(`${API_PREFIX}/auth`, authRoutes);
router.use(`${API_PREFIX}/users`, usersRoutes);
router.use(`${API_PREFIX}/posts`, postsRoutes);
router.use(`${API_PREFIX}/posts/:postId/comments`, commentsRoutes);
router.use(`${API_PREFIX}/comments`, commentsRoutes);
router.use(`${API_PREFIX}/likes`, likesRoutes);
router.use(`${API_PREFIX}/stories`, storiesRoutes);
router.use(`${API_PREFIX}/messages`, messagesRoutes);
router.use(`${API_PREFIX}/groups`, groupsRoutes);
router.use(`${API_PREFIX}/notifications`, notificationsRoutes);

router.use(systemRoutes);
router.use("/api", apiDocsRoutes);

module.exports = router;
