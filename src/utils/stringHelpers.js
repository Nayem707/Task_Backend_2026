/**
 * String Helper Utilities
 * Contains helper functions for string manipulation
 */

/**
 * Normalize a string for search purposes by removing accents and apostrophes
 * @param {string} str - String to normalize
 * @returns {string} Normalized string
 *
 * Examples:
 * - "Day'Ron" -> "Dayron"
 * - "José" -> "Jose"
 * - "O'Neal" -> "Oneal"
 */
function normalizeSearchString(str) {
  if (!str || typeof str !== "string") return "";

  return (
    str
      // Remove accents by normalizing to NFD and removing diacritics
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      // Remove apostrophes and similar characters
      .replace(/['''`]/g, "")
      // Remove hyphens and other special characters
      .replace(/[-]/g, "")
      // Convert to lowercase for case-insensitive comparison
      .toLowerCase()
      // Trim whitespace
      .trim()
  );
}

/**
 * Check if a player name matches a search query (normalized comparison)
 * @param {string} firstName - Player's first name
 * @param {string} lastName - Player's last name
 * @param {string} searchTerm - Search query
 * @returns {boolean} True if the name matches the search
 */
function matchesNormalizedSearch(firstName, lastName, searchTerm) {
  const normalizedSearch = normalizeSearchString(searchTerm);
  const normalizedFirstName = normalizeSearchString(firstName);
  const normalizedLastName = normalizeSearchString(lastName);
  const normalizedFullName = `${normalizedFirstName} ${normalizedLastName}`;

  return (
    normalizedFirstName.includes(normalizedSearch) ||
    normalizedLastName.includes(normalizedSearch) ||
    normalizedFullName.includes(normalizedSearch)
  );
}

module.exports = {
  normalizeSearchString,
  matchesNormalizedSearch,
};
