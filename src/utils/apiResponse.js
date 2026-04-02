/**
 * Standardized API response utilities
 * Provides consistent response structure across all endpoints
 */

/**
 * Success response structure
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
const successResponse = (
  data = null,
  message = "Operation successful",
  statusCode = 200,
) => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
    statusCode,
  };
};

/**
 * Error response structure
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {*} errors - Detailed error information
 */
const errorResponse = (
  message = "Operation failed",
  statusCode = 500,
  errors = null,
) => {
  return {
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString(),
    statusCode,
  };
};

/**
 * Validation error response
 * @param {Array} validationErrors - Array of validation errors
 */
const validationErrorResponse = (validationErrors) => {
  return errorResponse(
    "Validation failed",
    400,
    validationErrors.map((error) => ({
      field: error.path || error.field,
      message: error.message,
      value: error.value,
    })),
  );
};

/**
 * Pagination response wrapper
 * @param {Array} data - Array of items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 */
const paginationResponse = (data, page, limit, total) => {
  const totalPages = Math.ceil(total / limit);

  return successResponse({
    items: data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
    },
  });
};

/**
 * Game result response structure
 * @param {Object} gameData - Game result data
 */
const gameResultResponse = (gameData) => {
  return successResponse(
    {
      gameId: gameData.id,
      finalScore: gameData.finalScore,
      correctGuesses: gameData.correctGuesses,
      efficiency: gameData.efficiency,
      tier: gameData.tier,
      duration: gameData.duration,
      totalRounds: gameData.totalRounds,
      completedAt: gameData.completedAt,
      rounds: gameData.rounds?.map((round) => ({
        roundNumber: round.roundNumber,
        playerId: round.playerId,
        userGuess: round.userGuess,
        isCorrect: round.isCorrect,
        pointsEarned: round.pointsEarned,
        timeSpent: round.timeSpent,
      })),
    },
    "Game completed successfully",
  );
};

/**
 * Leaderboard response structure
 * @param {Array} leaderboardData - Leaderboard entries
 * @param {string} type - Leaderboard type (GLOBAL, DAILY, etc.)
 */
const leaderboardResponse = (leaderboardData, type) => {
  return successResponse(
    {
      type,
      entries: leaderboardData.map((entry, index) => ({
        rank: index + 1,
        userId: entry.userId,
        username: entry.user?.username || "Anonymous",
        score: entry.score,
        efficiency: entry.efficiency,
        tier: entry.tier,
        gamesPlayed: entry.gamesPlayed,
        createdAt: entry.createdAt,
      })),
      generatedAt: new Date().toISOString(),
    },
    `${type.toLowerCase()} leaderboard retrieved successfully`,
  );
};

/**
 * Authentication response structure
 * @param {Object} user - User data
 * @param {string} accessToken - JWT access token
 * @param {string} refreshToken - JWT refresh token
 * @param {string} message - Custom message (optional)
 */
const authResponse = (
  user,
  accessToken,
  refreshToken,
  message = "Authentication successful",
  statusCode = 200,
) => {
  return successResponse(
    {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl || null,
        createdAt: user.createdAt,
      },
      tokens: {
        accessToken,
        refreshToken,
        tokenType: "Bearer",
        expiresIn: "1h",
      },
    },
    message,
    statusCode,
  );
};

/**
 * Player data response structure
 * @param {Object} player - Player data
 */
const playerResponse = (player) => {
  return {
    id: player.id,
    firstName: player.firstName,
    lastName: player.lastName,
    fullName: `${player.firstName} ${player.lastName}`,
    team: player.team,
    era: player.era,
    position: player.position,
    image: player.image,
    height: player.height,
    weight: player.weight,
    nationality: player.nationality,
    yearsActive: player.yearsActive,
    championships: player.championships,
    biography: player.biography,
    difficulty: player.difficulty,
    avgPoints: player.avgPoints,
    avgRebounds: player.avgRebounds,
    avgAssists: player.avgAssists,
    isActive: player.isActive,
    createdAt: player.createdAt,
  };
};

/**
 * Analytics response structure
 * @param {Object} analyticsData - Analytics data
 */
const analyticsResponse = (analyticsData) => {
  return successResponse(
    {
      overview: {
        totalUsers: analyticsData.totalUsers,
        activeUsers: analyticsData.activeUsers,
        totalGames: analyticsData.totalGames,
        completedGames: analyticsData.completedGames,
        avgCompletionTime: analyticsData.avgCompletionTime,
      },
      trends: analyticsData.trends,
      demographics: analyticsData.demographics,
      gameStats: analyticsData.gameStats,
      generatedAt: new Date().toISOString(),
    },
    "Analytics data retrieved successfully",
  );
};

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse,
  paginationResponse,
  gameResultResponse,
  leaderboardResponse,
  authResponse,
  playerResponse,
  analyticsResponse,
  // Aliases for convenience
  success: successResponse,
  error: errorResponse,
};
