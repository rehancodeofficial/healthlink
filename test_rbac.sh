#!/bin/bash

# RBAC Testing Script using curl
# Tests authentication enforcement and role-based access control

BASE_URL="http://localhost:3001"
API_BASE="$BASE_URL/api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔐 Testing RBAC Implementation${NC}"
echo "=============================================="

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local auth_header=$4
    local expected_status=$5
    local test_name=$6
    
    echo -n "Testing: $test_name ... "
    
    # Build curl command
    local curl_cmd="curl -s -w '%{http_code}' -X $method"
    curl_cmd="$curl_cmd -H 'Content-Type: application/json'"
    
    if [ ! -z "$auth_header" ]; then
        curl_cmd="$curl_cmd -H 'Authorization: $auth_header'"
    fi
    
    if [ ! -z "$data" ]; then
        curl_cmd="$curl_cmd -d '$data'"
    fi
    
    curl_cmd="$curl_cmd '$API_BASE$endpoint'"
    
    # Execute and get response
    response=$(eval $curl_cmd)
    status_code="${response: -3}"
    
    if [[ "$status_code" == "$expected_status" ]]; then
        echo -e "${GREEN}PASS${NC} (Status: $status_code)"
        ((PASSED++))
    else
        echo -e "${RED}FAIL${NC} (Expected: $expected_status, Got: $status_code)"
        ((FAILED++))
    fi
}

echo -e "\n${YELLOW}📧 Testing Messages Routes${NC}"
echo "----------------------------"

# Test authentication enforcement on messages routes
test_endpoint "GET" "/messages/contacts/all" "" "" "401" "GET /messages/contacts/all (no auth)"
test_endpoint "GET" "/messages/contacts/all" "" "Bearer invalid-token" "403" "GET /messages/contacts/all (invalid token)"
test_endpoint "GET" "/messages/unread-count?userId=test" "" "" "401" "GET /messages/unread-count (no auth)"
test_endpoint "POST" "/messages/mark-read" '{"userId":"test"}' "" "401" "POST /messages/mark-read (no auth)"
test_endpoint "GET" "/messages/inbox" "" "" "401" "GET /messages/inbox (no auth)"
test_endpoint "POST" "/messages/send" '{"content":"test","senderId":"test"}' "" "401" "POST /messages/send (no auth)"

echo -e "\n${YELLOW}💳 Testing Subscription Routes${NC}"
echo "-------------------------------"

# Test authentication enforcement on subscription routes
test_endpoint "GET" "/subscription/subscription/prices" "" "" "401" "GET /subscription/prices (no auth)"
test_endpoint "GET" "/subscription/subscription/status?userId=test" "" "" "401" "GET /subscription/status (no auth)"
test_endpoint "GET" "/subscription/subscription?userId=test" "" "" "401" "GET /subscription (no auth)"
test_endpoint "GET" "/subscription/subscription/history?userId=test" "" "" "401" "GET /subscription/history (no auth)"

# Test admin-only routes without proper auth
test_endpoint "PUT" "/subscription/subscription/prices" '{"doctorMonthlyUsd":30}' "" "401" "PUT /subscription/prices (no auth)"
test_endpoint "PATCH" "/subscription/subscription/123/status" '{"status":"ACTIVE"}' "" "401" "PATCH /subscription/status (no auth)"
test_endpoint "GET" "/subscription/stats" "" "" "401" "GET /subscription/stats (no auth)"

echo -e "\n${YELLOW}📹 Testing VideoCall Routes${NC}"
echo "-----------------------------"

# Test authentication enforcement on videocall routes
test_endpoint "POST" "/videocall/create" '{"scheduledAt":"2024-01-01T00:00:00Z"}' "" "401" "POST /videocall/create (no auth)"
test_endpoint "GET" "/videocall/list?userId=test&role=PATIENT" "" "" "401" "GET /videocall/list (no auth)"
test_endpoint "POST" "/videocall/token" '{"identity":"test","roomName":"test"}' "" "401" "POST /videocall/token (no auth)"
test_endpoint "PUT" "/videocall/status/123" '{"status":"SCHEDULED"}' "" "401" "PUT /videocall/status (no auth)"
test_endpoint "PATCH" "/videocall/reschedule/123" '{"scheduledAt":"2024-01-01T00:00:00Z"}' "" "401" "PATCH /videocall/reschedule (no auth)"

echo -e "\n${YELLOW}🔒 Testing Role-Based Access Control${NC}"
echo "-------------------------------------"

# Test admin-only routes with patient token (should fail)
test_endpoint "PUT" "/subscription/subscription/prices" '{"doctorMonthlyUsd":30}' "Bearer patient-token" "403" "PUT /subscription/prices (PATIENT role)"
test_endpoint "GET" "/subscription/stats" "" "Bearer patient-token" "403" "GET /subscription/stats (PATIENT role)"
test_endpoint "PATCH" "/subscription/subscription/123/status" '{"status":"ACTIVE"}' "Bearer patient-token" "403" "PATCH /subscription/status (PATIENT role)"

# Test admin-only routes with doctor token (should fail)
test_endpoint "PUT" "/subscription/subscription/prices" '{"doctorMonthlyUsd":30}' "Bearer doctor-token" "403" "PUT /subscription/prices (DOCTOR role)"
test_endpoint "GET" "/subscription/stats" "" "Bearer doctor-token" "403" "GET /subscription/stats (DOCTOR role)"

# Test broadcast message with patient token (should fail)
test_endpoint "POST" "/messages/send" '{"content":"test","senderId":"patient-id","broadcast":true}' "Bearer patient-token" "403" "POST /messages/send broadcast (PATIENT role)"

echo -e "\n${BLUE}📊 Test Results Summary${NC}"
echo "========================="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo "Total: $((PASSED + FAILED))"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}⚠️ Some tests failed.${NC}"
    exit 1
fi
