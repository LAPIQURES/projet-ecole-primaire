#!/bin/bash

echo "🚀 Démarrage du serveur backend..."
cd a:/BD_v5_fix/projet_v4/backend

# Démarrer le serveur en arrière-plan
node server.js &
SERVER_PID=$!

echo "⏳ Attente du démarrage du serveur (3 secondes)..."
sleep 3

echo ""
echo "🧪 Exécution des tests..."
echo ""

# Exécuter les tests
node test_rapports_api.js
TEST_RESULT=$?

# Arrêter le serveur
kill $SERVER_PID 2>/dev/null

exit $TEST_RESULT
