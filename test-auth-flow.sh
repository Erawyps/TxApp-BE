#!/bin/bash

echo "=== Démarrage des serveurs ==="
cd /Users/kuassitehou/Documents/Documents\ -\ OHMPXV/GitHub/TxApp-BE

# Démarrer l'API en arrière-plan
npm run dev:api &
API_PID=$!

# Attendre que l'API démarre
sleep 3

# Démarrer le frontend en arrière-plan
npm run dev &
FRONTEND_PID=$!

# Attendre que le frontend démarre
sleep 5

echo "=== Test de l'authentification ==="
echo "Test direct API:"
curl -s -X POST "http://localhost:3001/api/auth/login" -H "Content-Type: application/json" -d '{"email":"ismail.drissi@txapp.be","password":"ismail2024"}' | head -c 200
echo -e "\n"

echo "Test via proxy:"
curl -s -X POST "http://localhost:5174/api/auth/login" -H "Content-Type: application/json" -d '{"email":"ismail.drissi@txapp.be","password":"ismail2024"}' | head -c 200
echo -e "\n"

echo "=== Arrêt des serveurs ==="
kill $FRONTEND_PID 2>/dev/null
kill $API_PID 2>/dev/null

echo "Test terminé"