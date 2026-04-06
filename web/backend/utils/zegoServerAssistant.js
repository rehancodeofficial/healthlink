const crypto = require("crypto");

/**
 * Generate ZEGOCLOUD Token04
 *
 * @param {number} appId - ZEGOCLOUD AppID
 * @param {string} userId - User ID
 * @param {string} serverSecret - Server Secret (32 chars)
 * @param {number} effectiveTimeInSeconds - Token validity duration
 * @param {string} payload - Optional payload (JSON string)
 * @returns {string} - Generated Token04
 */
function generateToken04(appId, userId, serverSecret, effectiveTimeInSeconds, payload) {
  if (!appId || typeof appId !== "number") {
    throw new Error("appId is invalid (must be a number)");
  }
  if (!userId || typeof userId !== "string") {
    throw new Error("userId is invalid (must be a string)");
  }
  if (!serverSecret || typeof serverSecret !== "string") {
    throw new Error("serverSecret is invalid (must be a string)");
  }

  // 1. Create token info
  const createTime = Math.floor(Date.now() / 1000);
  const expireTime = createTime + effectiveTimeInSeconds;
  const nonce = crypto.randomInt(100000000, 999999999); // Random int

  const tokenInfo = {
    app_id: appId,
    user_id: userId,
    nonce: nonce,
    ctime: createTime,
    expire: expireTime,
    payload: payload || "",
  };

  const plaintext = JSON.stringify(tokenInfo);

  // 2. Prepare IV (16 random bytes)
  const iv = crypto.randomBytes(16);

  // 3. Prepare Key (Ensure 32 bytes for AES-256)
  let key = Buffer.from(serverSecret, "utf8");
  if (key.length !== 32) {
    // If not exactly 32 bytes, adjust it
    if (key.length > 32) {
      key = key.slice(0, 32);
    } else {
      key = Buffer.concat([key, Buffer.alloc(32 - key.length, 0)]);
    }
  }

  // 4. Encrypt (AES-256-CBC)
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let ciphertext = cipher.update(plaintext, "utf8");
  ciphertext = Buffer.concat([ciphertext, cipher.final()]);

  // 5. Pack binary data
  // Format: [IV Length (2be)][IV][Cipher Length (2be)][Cipher]
  const ivLen = Buffer.alloc(2);
  ivLen.writeUInt16BE(iv.length);

  const ciphertextLen = Buffer.alloc(2);
  ciphertextLen.writeUInt16BE(ciphertext.length);

  const binData = Buffer.concat([ivLen, iv, ciphertextLen, ciphertext]);

  // 6. Prepend Version (0x04) and Base64 Encode
  const result = Buffer.concat([Buffer.from([0x04]), binData]);

  return result.toString("base64");
}

module.exports = {
  generateToken04,
};
