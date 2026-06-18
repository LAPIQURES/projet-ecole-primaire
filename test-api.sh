#!/bin/bash

# 🧪 TESTS API - Plateforme Scolaire

BASE_URL="http://localhost:5000/api"

echo "=========================================="
echo "🧪 TEST API - Plateforme Scolaire"
echo "=========================================="
echo ""

# 1️⃣ Health Check
echo "1️⃣  Health Check..."
curl -s "$BASE_URL/health" | jq . || echo "❌ Erreur"
echo ""

# 2️⃣ Login
echo "2️⃣  Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ecole.com","password":"admin123"}')
echo "$LOGIN_RESPONSE" | jq .
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token' 2>/dev/null)
echo "Token: $TOKEN"
echo ""

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo "❌ Erreur de login, tests arrêtés"
  exit 1
fi

# 3️⃣ Get Current User
echo "3️⃣  Get Current User..."
curl -s "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# 4️⃣ Get Élèves
echo "4️⃣  Get Élèves..."
curl -s "$BASE_URL/eleves" \
  -H "Authorization: Bearer $TOKEN" | jq . | head -20
echo ""

# 5️⃣ Get Classes
echo "5️⃣  Get Classes..."
curl -s "$BASE_URL/classes" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# 6️⃣ Get Enseignants
echo "6️⃣  Get Enseignants..."
curl -s "$BASE_URL/enseignants" \
  -H "Authorization: Bearer $TOKEN" | jq . | head -20
echo ""

# 7️⃣ Create Élève
echo "7️⃣  Create Élève..."
curl -s -X POST "$BASE_URL/eleves" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"prenom":"Jean","nom":"Dupont","email":"jean@test.com","classe":"6A"}' | jq .
echo ""

# 8️⃣ Create Classe
echo "8️⃣  Create Classe..."
curl -s -X POST "$BASE_URL/classes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"nom":"6C","niveau":"6ème","capacite":30}' | jq .
echo ""

# 9️⃣ Create Enseignant
echo "9️⃣  Create Enseignant..."
curl -s -X POST "$BASE_URL/enseignants" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"prenom":"Marie","nom":"Martin","email":"marie@test.com","specialite":"Mathématiques"}' | jq .
echo ""

echo "=========================================="
echo "✅ TESTS TERMINÉS"
echo "=========================================="
