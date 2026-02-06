/**
 * Test file for Echo Agent
 *
 * Demonstrates agent usage patterns and validates base agent functionality.
 * Run with: npx tsx tests/echo-agent.test.ts
 */

import { EchoAgent } from "../src/lib/agents/example-echo-agent";

async function testEchoAgent() {
  console.log("🧪 Testing Echo Agent\n");

  // Test 1: Basic echo
  console.log("Test 1: Basic echo");
  console.log("==================");
  try {
    const agent1 = new EchoAgent({ id: "test-echo-1" });
    const result1 = await agent1.run({
      message: "Hello World",
      repeat: 1,
      transform: "none",
    });

    console.log(`✅ Success: ${result1.success}`);
    console.log(`📊 Confidence: ${result1.confidence.toFixed(2)}`);
    console.log(`📝 Output: "${result1.data.processedMessage}"`);
    console.log(`⏱️  Execution time: ${result1.metadata.executionTime}ms`);
    console.log(`💭 Reasoning steps: ${result1.reasoning.length}`);
  } catch (error) {
    console.error("❌ Error:", error);
  }
  console.log();

  // Test 2: Transformation
  console.log("Test 2: Uppercase transformation with repetition");
  console.log("===============================================");
  try {
    const agent2 = new EchoAgent({ id: "test-echo-2" });
    const result2 = await agent2.run({
      message: "hello",
      repeat: 3,
      transform: "uppercase",
    });

    console.log(`✅ Success: ${result2.success}`);
    console.log(`📊 Confidence: ${result2.confidence.toFixed(2)}`);
    console.log(`📝 Output: "${result2.data.processedMessage}"`);
    console.log(`🔄 Transform: ${result2.data.transformApplied}`);
  } catch (error) {
    console.error("❌ Error:", error);
  }
  console.log();

  // Test 3: Reverse transformation
  console.log("Test 3: Reverse transformation");
  console.log("==============================");
  try {
    const agent3 = new EchoAgent({ id: "test-echo-3" });
    const result3 = await agent3.run({
      message: "Bricks Builder",
      repeat: 1,
      transform: "reverse",
    });

    console.log(`✅ Success: ${result3.success}`);
    console.log(`📊 Confidence: ${result3.confidence.toFixed(2)}`);
    console.log(`📝 Original: "${result3.data.originalMessage}"`);
    console.log(`📝 Reversed: "${result3.data.processedMessage}"`);
  } catch (error) {
    console.error("❌ Error:", error);
  }
  console.log();

  // Test 4: High repeat count (should generate warning)
  console.log("Test 4: High repeat count (warning test)");
  console.log("========================================");
  try {
    const agent4 = new EchoAgent({ id: "test-echo-4" });
    const result4 = await agent4.run({
      message: "Test",
      repeat: 8,
      transform: "none",
    });

    console.log(`✅ Success: ${result4.success}`);
    console.log(`📊 Confidence: ${result4.confidence.toFixed(2)}`);
    console.log(`⚠️  Warnings: ${result4.warnings.length}`);
    if (result4.warnings.length > 0) {
      result4.warnings.forEach((w) => console.log(`   - ${w}`));
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
  console.log();

  // Test 5: Invalid input (validation error)
  console.log("Test 5: Invalid input (validation test)");
  console.log("=======================================");
  const agent5 = new EchoAgent({ id: "test-echo-5" });
  const result5 = await agent5.run({
    message: "", // Empty message should fail validation
    repeat: 1,
    transform: "none",
  });

  if (!result5.success && result5.errors && result5.errors.length > 0) {
    console.log("✅ Correctly returned validation error");
    console.log(`📝 Success: ${result5.success}`);
    console.log(`📝 Errors: ${result5.errors.join(", ")}`);
  } else {
    console.log(`❌ Expected validation error but got success: ${result5.success}`);
  }
  console.log();

  // Test 6: Long message (should generate warning)
  console.log("Test 6: Long message (warning test)");
  console.log("===================================");
  try {
    const agent6 = new EchoAgent({ id: "test-echo-6" });
    const longMessage = "x".repeat(1500);
    const result6 = await agent6.run({
      message: longMessage,
      repeat: 1,
      transform: "none",
    });

    console.log(`✅ Success: ${result6.success}`);
    console.log(`📊 Confidence: ${result6.confidence.toFixed(2)}`);
    console.log(`📏 Message length: ${result6.data.messageLength}`);
    console.log(`⚠️  Warnings: ${result6.warnings.length}`);
    if (result6.warnings.length > 0) {
      result6.warnings.forEach((w) => console.log(`   - ${w}`));
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
  console.log();

  console.log("🎉 All tests completed!");
}

// Run tests
testEchoAgent().catch((error) => {
  console.error("Test suite failed:", error);
  process.exit(1);
});
