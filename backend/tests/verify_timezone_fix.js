const { parseAsLocal, formatLocal } = require("./utils/timeUtils");

function testParsing() {
  const testCases = [
    { input: "2026-02-21T13:00:00", expectedISO: "2026-02-21T13:00:00.000Z" },
    { input: "2026-02-21T13:00", expectedISO: "2026-02-21T13:00:00.000Z" },
    { input: "2026-02-21", expectedISO: "2026-02-21T00:00:00.000Z" },
  ];

  console.log("--- Starting Time Parsing Verification ---");

  testCases.forEach(({ input, expectedISO }) => {
    const result = parseAsLocal(input);
    const resultISO = result.toISOString();
    const success = resultISO === expectedISO;

    console.log(`Input: ${input}`);
    console.log(`Parsed ISO: ${resultISO}`);
    console.log(`Expected ISO: ${expectedISO}`);
    console.log(`Match: ${success ? "✅ PASS" : "❌ FAIL"}`);
    console.log("-----------------------------------------");
  });
}

testParsing();
