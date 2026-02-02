/**
 * Structure Agent Confidence Scoring Constants
 *
 * These values determine how confidence scores are calculated
 * based on available input data and reference scenarios.
 */

export const CONFIDENCE_SCORING = {
  /**
   * Base confidence score when only basic input is provided
   */
  BASE_CONFIDENCE: 0.6,

  /**
   * Confidence boost when ACSS JS dump is provided
   */
  ACSS_JS_DUMP_BOOST: 0.1,

  /**
   * Confidence boost when container grid code is provided
   */
  CONTAINER_GRID_BOOST: 0.1,

  /**
   * Confidence boost when reference scenarios are available
   */
  REFERENCE_SCENARIOS_BOOST: 0.2,

  /**
   * Minimum confidence threshold for automatic review approval
   */
  AUTO_REVIEW_THRESHOLD: 0.7,

  /**
   * Maximum confidence score (capped at 1.0)
   */
  MAX_CONFIDENCE: 1.0,
} as const;

/**
 * Agent execution limits and timeouts
 */
export const AGENT_LIMITS = {
  /**
   * Maximum execution time in milliseconds
   */
  MAX_EXECUTION_TIME: 30000, // 30 seconds

  /**
   * Maximum number of elements in generated structure
   */
  MAX_ELEMENTS: 1000,

  /**
   * Maximum depth of nested elements
   */
  MAX_NESTING_DEPTH: 10,
} as const;
