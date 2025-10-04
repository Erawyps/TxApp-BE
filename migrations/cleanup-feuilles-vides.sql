-- Nettoyage des feuilles de route vides (sans courses)
-- À exécuter dans Prisma Studio ou via psql

-- Vérifier d'abord les feuilles à supprimer
SELECT 
  fr.feuille_id,
  u.prenom,
  u.nom,
  fr.date_service,
  COUNT(c.course_id) as nb_courses
FROM feuille_route fr
LEFT JOIN course c ON c.feuille_id = fr.feuille_id
LEFT JOIN chauffeur ch ON ch.chauffeur_id = fr.chauffeur_id
LEFT JOIN utilisateur u ON u.user_id = ch.user_id
GROUP BY fr.feuille_id, u.prenom, u.nom, fr.date_service
HAVING COUNT(c.course_id) = 0
ORDER BY fr.feuille_id;

-- Supprimer les feuilles vides identifiées
-- (Les courses et charges seront supprimées automatiquement grâce à ON DELETE CASCADE)
DELETE FROM feuille_route
WHERE feuille_id IN (11, 21, 23, 24, 25, 27, 28, 30);

-- Vérifier le résultat
SELECT 
  fr.feuille_id,
  u.prenom,
  u.nom,
  fr.date_service,
  COUNT(c.course_id) as nb_courses
FROM feuille_route fr
LEFT JOIN course c ON c.feuille_id = fr.feuille_id
LEFT JOIN chauffeur ch ON ch.chauffeur_id = fr.chauffeur_id
LEFT JOIN utilisateur u ON u.user_id = ch.user_id
GROUP BY fr.feuille_id, u.prenom, u.nom, fr.date_service
ORDER BY fr.feuille_id;
