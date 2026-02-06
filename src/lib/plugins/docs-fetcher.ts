/**
 * Context7 Documentation Fetcher
 *
 * Fetches and caches documentation from external sources (Bricks Builder, ACSS)
 * to enhance agent knowledge and teaching scenarios.
 *
 * Based on context7-docs-fetcher plugin pattern.
 */

import { z } from "zod";
import * as cheerio from "cheerio";

/**
 * Custom error class that preserves HTTP status code
 */
class FetchError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isTimeout: boolean = false
  ) {
    super(message);
    this.name = "FetchError";
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Documentation source configuration
 */
export interface DocSource {
  id: string;
  name: string;
  baseUrl: string;
  type: "html" | "markdown" | "json";
  cacheTTL?: number; // Cache time-to-live in milliseconds
}

/**
 * Built-in documentation sources for Bricks Builder ecosystem
 */
export const DOC_SOURCES: Record<string, DocSource> = {
  bricks: {
    id: "bricks",
    name: "Bricks Builder",
    baseUrl: "https://academy.bricksbuilder.io",
    type: "html",
    cacheTTL: 86400000, // 24 hours
  },
  acss: {
    id: "acss",
    name: "Automatic CSS",
    baseUrl: "https://docs.automaticcss.com",
    type: "html",
    cacheTTL: 86400000, // 24 hours
  },
  frames: {
    id: "frames",
    name: "Frames Library",
    baseUrl: "https://frames.bricksbuilder.io",
    type: "html",
    cacheTTL: 86400000, // 24 hours
  },
} as const;

/**
 * Fetched documentation result
 */
export interface DocResult {
  source: string;
  url: string;
  title: string;
  content: string;
  fetchedAt: number;
  cached: boolean;
}

/**
 * Documentation fetch options
 */
export interface FetchOptions {
  source: string;
  path?: string;
  query?: string;
  useCache?: boolean;
  timeout?: number;
}

/**
 * Input validation schema
 */
const fetchOptionsSchema = z.object({
  source: z.string().min(1),
  path: z.string().optional(),
  query: z.string().optional(),
  useCache: z.boolean().default(true),
  timeout: z.number().positive().max(30000).default(10000),
});

/**
 * Simple in-memory cache for documentation
 * In production, consider using Redis or similar
 */
class DocCache {
  private cache = new Map<
    string,
    { result: DocResult; expiresAt: number }
  >();

  set(key: string, result: DocResult, ttl: number): void {
    this.cache.set(key, {
      result,
      expiresAt: Date.now() + ttl,
    });
  }

  get(key: string): DocResult | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return { ...entry.result, cached: true };
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

const cache = new DocCache();

/**
 * Retry configuration for network requests
 */
interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // Base delay in milliseconds
  maxDelay: number; // Maximum delay in milliseconds
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
};

/**
 * Execute a function with exponential backoff retry logic
 *
 * @param fn - Async function to execute
 * @param config - Retry configuration
 * @returns Result of the function
 * @throws {Error} When all retries are exhausted
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error("Unknown error");

      // Don't retry on last attempt
      if (attempt === config.maxRetries) {
        break;
      }

      // Don't retry on client errors (4xx) or timeout errors
      if (error instanceof FetchError) {
        // Don't retry on 4xx client errors (bad request, auth, not found, etc.)
        if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
          throw error;
        }
        // Don't retry on timeout (let caller handle)
        if (error.isTimeout) {
          throw error;
        }
      }

      // Don't retry on validation errors
      if (error instanceof z.ZodError) {
        throw error;
      }

      // Calculate exponential backoff delay for retryable errors (5xx, network issues)
      const delay = Math.min(
        config.baseDelay * Math.pow(2, attempt),
        config.maxDelay
      );

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error(
    `Failed after ${config.maxRetries} retries: ${lastError?.message}`
  );
}

/**
 * Fetch documentation from a configured source
 *
 * @param options - Fetch options including source, path, and caching preferences
 * @returns Documentation result with content and metadata
 * @throws {Error} When source is invalid or fetch fails
 *
 * @example
 * ```typescript
 * const docs = await fetchDocs({
 *   source: "acss",
 *   path: "/variables",
 *   useCache: true,
 * });
 * console.log(docs.title, docs.content);
 * ```
 */
export async function fetchDocs(
  options: FetchOptions
): Promise<DocResult> {
  // Validate input
  const validated = fetchOptionsSchema.parse(options);
  const { source: sourceId, path, query, useCache, timeout } = validated;

  // Get source configuration
  const source = DOC_SOURCES[sourceId];
  if (!source) {
    throw new FetchError(
      `Unknown documentation source: ${sourceId}. Available sources: ${Object.keys(DOC_SOURCES).join(", ")}`,
      400
    );
  }

  // Build cache key
  const cacheKey = `${sourceId}:${path || ""}:${query || ""}`;

  // Check cache if enabled
  if (useCache) {
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }
  }

  // Build URL
  const url = path
    ? `${source.baseUrl}${path.startsWith("/") ? path : `/${path}`}`
    : source.baseUrl;

  // Fetch documentation with timeout and retry logic
  const result = await withRetry(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "BricksCC-DocsFetcher/1.0",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new FetchError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      }

      // Extract content based on type
      let content: string;
      let title = source.name;

      if (source.type === "json") {
        const json = await response.json();
        content = JSON.stringify(json, null, 2);
        title = json.title || title;
      } else {
        const html = await response.text();

        // Use cheerio for robust HTML parsing
        const $ = cheerio.load(html);

        // Extract title
        const pageTitle = $("title").first().text().trim();
        if (pageTitle) {
          title = pageTitle;
        }

        // Remove script, style, and nav elements
        $("script, style, nav, header, footer").remove();

        // Extract text content from main content area (or body if no main)
        const mainContent = $("main, article, .content, #content").first();
        content = (mainContent.length > 0 ? mainContent : $("body"))
          .text()
          .replace(/\s+/g, " ")
          .trim();

        // Limit content length (keep first 50KB)
        if (content.length > 50000) {
          content = content.substring(0, 50000) + "... (truncated)";
        }
      }

      // If query provided, filter content
      if (query) {
        const queryLower = query.toLowerCase();
        const sentences = content.split(/[.!?]+/);
        const relevant = sentences.filter((s) =>
          s.toLowerCase().includes(queryLower)
        );

        if (relevant.length > 0) {
          content = relevant.join(". ").trim() + ".";
        }
      }

      return {
        source: source.name,
        url,
        title,
        content,
        fetchedAt: Date.now(),
        cached: false,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      // Re-throw FetchError as-is to preserve status code
      if (error instanceof FetchError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new FetchError(
            `Request timeout after ${timeout}ms`,
            undefined,
            true
          );
        }
        throw new FetchError(`Failed to fetch docs: ${error.message}`);
      }
      throw new FetchError("Failed to fetch documentation");
    }
  });

  // Cache result
  if (useCache && source.cacheTTL) {
    cache.set(cacheKey, result, source.cacheTTL);
  }

  return result;
}

/**
 * Search across multiple documentation sources
 *
 * @param query - Search query
 * @param sources - Array of source IDs to search (defaults to all)
 * @returns Array of documentation results
 */
export async function searchDocs(
  query: string,
  sources: string[] = Object.keys(DOC_SOURCES)
): Promise<DocResult[]> {
  const results = await Promise.allSettled(
    sources.map((source) =>
      fetchDocs({
        source,
        query,
        useCache: true,
      })
    )
  );

  return results
    .filter(
      (result): result is PromiseFulfilledResult<DocResult> =>
        result.status === "fulfilled"
    )
    .map((result) => result.value);
}

/**
 * Clear documentation cache
 */
export function clearDocsCache(): void {
  cache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number } {
  return {
    size: cache.size(),
  };
}
