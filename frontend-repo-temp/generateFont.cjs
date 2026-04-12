/**
 * generateFont.cjs
 *
 * This script will:
 * ✅ Create /src/assets/fonts if it doesn’t exist
 * ✅ Decode the Base64 Digital7 font
 * ✅ Save it as Digital7.ttf
 *
 * How to use:
 * 1. Replace <BASE64_FONT_DATA> with the actual Base64 string (Part 2)
 * 2. Run: node generateFont.cjs
 */

const fs = require("fs");
const path = require("path");

// ✅ STEP 1: Paste the FULL Base64 font data between the backticks
const base64Font = `
<BASE64_FONT_DATA>
`;

// ✅ STEP 2: Define fonts folder path
const fontsDir = path.join(__dirname, "src", "assets", "fonts");

// ✅ STEP 3: Ensure folder exists
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
  console.log("✅ Created folder:", fontsDir);
}

// ✅ STEP 4: Define output font path
const fontPath = path.join(fontsDir, "Digital7.ttf");

// ✅ STEP 5: Decode Base64 and write the file
try {
  fs.writeFileSync(fontPath, Buffer.from(base64Font, "base64"));
  console.log("✅ Digital7.ttf successfully created at:", fontPath);
} catch (err) {
  console.error("❌ Error writing font file:", err);
}
