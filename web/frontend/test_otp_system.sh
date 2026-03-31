#!/bin/bash

# OTP System Test Script
# This script tests the OTP email verification system

API_URL="http://localhost:5001/api"
TEST_EMAIL="test-$(date +%s)@example.com"

echo "🧪 Testing OTP Email Verification System"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Register a new user
echo -e "${YELLOW}Test 1: Register a new user${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test User\",
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"TestPass123\",
    \"role\": \"PATIENT\"
  }")

echo "Response: $REGISTER_RESPONSE"

if echo "$REGISTER_RESPONSE" | grep -q "requiresVerification"; then
  echo -e "${GREEN}✓ Registration successful${NC}"
else
  echo -e "${RED}✗ Registration failed${NC}"
  exit 1
fi

echo ""

# Test 2: Send OTP explicitly
echo -e "${YELLOW}Test 2: Send OTP${NC}"
SEND_RESPONSE=$(curl -s -X POST "$API_URL/otp/send" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\"
  }")

echo "Response: $SEND_RESPONSE"

if echo "$SEND_RESPONSE" | grep -q "OTP sent successfully"; then
  echo -e "${GREEN}✓ OTP sent successfully${NC}"
else
  echo -e "${RED}✗ Failed to send OTP${NC}"
  echo "Note: This might fail if email is not configured. Check backend logs."
fi

echo ""

# Test 3: Try to verify with wrong OTP
echo -e "${YELLOW}Test 3: Verify with wrong OTP${NC}"
VERIFY_WRONG=$(curl -s -X POST "$API_URL/otp/verify" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"otp\": \"000000\"
  }")

echo "Response: $VERIFY_WRONG"

if echo "$VERIFY_WRONG" | grep -q "Invalid OTP"; then
  echo -e "${GREEN}✓ Correctly rejected invalid OTP${NC}"
else
  echo -e "${RED}✗ Should have rejected invalid OTP${NC}"
fi

echo ""

# Test 4: Check database for OTP
echo -e "${YELLOW}Test 4: Check database for OTP${NC}"
docker exec curevirtual2-db-1 mysql -u root -prootpassword curevirtual_db \
  -e "SELECT id, email, otp, verified, expiresAt FROM EmailOTP WHERE email='$TEST_EMAIL' ORDER BY createdAt DESC LIMIT 1;" 2>/dev/null

echo ""

# Test 5: Rate limiting
echo -e "${YELLOW}Test 5: Test rate limiting${NC}"
echo "Sending 4 requests rapidly..."

for i in {1..4}; do
  RATE_RESPONSE=$(curl -s -X POST "$API_URL/otp/send" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"ratelimit-test@example.com\"
    }")
  
  if [ $i -eq 4 ]; then
    if echo "$RATE_RESPONSE" | grep -q "Too many requests"; then
      echo -e "${GREEN}✓ Rate limiting working correctly${NC}"
    else
      echo -e "${RED}✗ Rate limiting not triggered${NC}"
    fi
  fi
done

echo ""

# Test 6: Cleanup expired OTPs
echo -e "${YELLOW}Test 6: Cleanup expired OTPs${NC}"
CLEANUP_RESPONSE=$(curl -s -X DELETE "$API_URL/otp/cleanup")

echo "Response: $CLEANUP_RESPONSE"

if echo "$CLEANUP_RESPONSE" | grep -q "Cleanup completed"; then
  echo -e "${GREEN}✓ Cleanup endpoint working${NC}"
else
  echo -e "${RED}✗ Cleanup failed${NC}"
fi

echo ""
echo "=========================================="
echo "🎉 OTP System Test Complete!"
echo ""
echo "⚠️  NOTE: To fully test email sending:"
echo "1. Configure EMAIL_USER and EMAIL_PASS in .env"
echo "2. Use a real email address"
echo "3. Check your inbox for the OTP"
echo "4. Use that OTP to verify"
echo ""
echo "Example manual verification:"
echo "curl -X POST $API_URL/otp/verify \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\": \"$TEST_EMAIL\", \"otp\": \"YOUR_OTP_FROM_EMAIL\"}'"
echo ""
