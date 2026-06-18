#!/bin/bash
# Test script for bulletin endpoints

BASE_URL="http://localhost:5000/api"
AUTH_HEADER="Authorization: Bearer test-token"

echo "🧪 Testing Bulletin Endpoints"
echo "==============================="

# Test 1: GET years and trimesters
echo -e "\n1. Testing GET /api/years (public endpoint)"
curl -s -X GET "$BASE_URL/years" \
  -H "Content-Type: application/json" | jq '.' || echo "Error"

# Test 2: GET eleves
echo -e "\n2. Testing GET /api/eleves"
curl -s -X GET "$BASE_URL/eleves" \
  -H "Content-Type: application/json" | jq '.[] | {matricule, prenom, nom, classe}' | head -20 || echo "Error"

# Test 3: GET bulletins for a specific student (requires valid matricule)
echo -e "\n3. Testing GET /api/bulletins/eleve/{matricule}"
echo "Note: This requires a valid student matricule"

# Test 4: Health check
echo -e "\n4. Testing Health Check"
curl -s -X GET "$BASE_URL/health" | jq '.' || echo "Error"

echo -e "\n✅ Test complete!"
