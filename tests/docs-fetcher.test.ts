/**
 * Manual test for docs fetcher
 *
 * Run with: npx tsx tests/docs-fetcher.test.ts
 */

import {
  fetchDocs,
  searchDocs,
  DOC_SOURCES,
  getCacheStats,
  clearDocsCache,
} from "../src/lib/plugins/docs-fetcher";

async function testDocsFetcher() {
  console.log("🧪 Testing Documentation Fetcher\n");

  // Test 1: List available sources
  console.log("Test 1: Available documentation sources");
  console.log("=====================================");
  Object.values(DOC_SOURCES).forEach((source) => {
    console.log(`- ${source.name} (${source.id}): ${source.baseUrl}`);
  });
  console.log();

  // Test 2: Fetch from Bricks Builder
  console.log("Test 2: Fetch from Bricks Builder");
  console.log("==================================");
  try {
    const result = await fetchDocs({
      source: "bricks",
      useCache: true,
      timeout: 15000,
    });
    console.log(`✅ Success: ${result.title}`);
    console.log(`URL: ${result.url}`);
    console.log(`Content length: ${result.content.length} chars`);
    console.log(`Cached: ${result.cached}`);
    console.log(`Preview: ${result.content.substring(0, 200)}...`);
  } catch (error) {
    console.error(
      `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
  console.log();

  // Test 3: Test caching
  console.log("Test 3: Cache verification (refetch same source)");
  console.log("================================================");
  try {
    const result = await fetchDocs({
      source: "bricks",
      useCache: true,
    });
    console.log(`✅ Second fetch: ${result.cached ? "FROM CACHE" : "FRESH"}`);
    console.log(`Cache stats: ${JSON.stringify(getCacheStats())}`);
  } catch (error) {
    console.error(
      `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
  console.log();

  // Test 4: Search across sources
  console.log("Test 4: Search for 'grid' across all sources");
  console.log("============================================");
  try {
    const results = await searchDocs("grid");
    console.log(`✅ Found ${results.length} results`);
    results.forEach((result, i) => {
      console.log(`\n${i + 1}. ${result.source}`);
      console.log(`   URL: ${result.url}`);
      console.log(`   Content preview: ${result.content.substring(0, 150)}...`);
    });
  } catch (error) {
    console.error(
      `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
  console.log();

  // Test 5: Error handling (invalid source)
  console.log("Test 5: Error handling (invalid source)");
  console.log("=======================================");
  try {
    await fetchDocs({
      source: "invalid-source",
    });
    console.log("❌ Should have thrown an error");
  } catch (error) {
    console.log(
      `✅ Correctly threw error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
  console.log();

  // Test 6: Clear cache
  console.log("Test 6: Clear cache");
  console.log("==================");
  clearDocsCache();
  console.log(`✅ Cache cleared: ${JSON.stringify(getCacheStats())}`);
  console.log();

  console.log("🎉 All tests completed!");
}

// Run tests
testDocsFetcher().catch((error) => {
  console.error("Test suite failed:", error);
  process.exit(1);
});
