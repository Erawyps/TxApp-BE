#!/bin/bash

echo "=== Démarrage des serveurs ==="
cd /Users/kuassitehou/Documents/Documents\ -\ OHMPXV/GitHub/TxApp-BE

# Démarrer les serveurs en arrière-plan
npm run dev:full &
SERVERS_PID=$!

# Attendre que les serveurs démarrent
sleep 8

echo "=== Test de l'authentification ==="
echo "Test direct API:"
curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ismail.drissi@txapp.be","password":"ismail2024"}' | jq .success

echo "Test via proxy:"
curl -s -X POST http://localhost:5173/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ismail.drissi@txapp.be","password":"ismail2024"}' | jq .success

echo "=== Arrêt des serveurs ==="
kill $SERVERS_PID
wait $SERVERS_PID 2>/dev/null

echo "Test terminé"