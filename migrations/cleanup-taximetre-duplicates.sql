-- Migration optionnelle: Nettoyage de la table taximetre
-- Suppression des colonnes dupliquées (anciennes versions)
--
-- ⚠️ ATTENTION: Cette migration supprime des colonnes!
-- Exécuter UNIQUEMENT si vous êtes sûr que les anciennes colonnes ne sont plus utilisées.
--
-- Date: 2025-10-08
-- Description: Suppression des colonnes dupliquées dans la table taximetre

-- Vérifier d'abord si des données existent dans les anciennes colonnes
-- Exécuter cette requête AVANT la migration pour vérifier:
/*
SELECT 
  COUNT(*) as total_records,
  COUNT(pc_debut_tax) as pc_debut_tax_count,
  COUNT(pc_fin_tax) as pc_fin_tax_count,
  COUNT(index_km_debut_tax) as index_km_debut_tax_count,
  COUNT(index_km_fin_tax) as index_km_fin_tax_count,
  COUNT(km_charge_debut) as km_charge_debut_count,
  COUNT(km_charge_fin) as km_charge_fin_count,
  COUNT(chutes_debut_tax) as chutes_debut_tax_count,
  COUNT(chutes_fin_tax) as chutes_fin_tax_count
FROM taximetre;
*/

-- Si toutes les colonnes anciennes sont à 0 (ou NULL), vous pouvez exécuter la migration:

BEGIN;

-- 1. Créer une table de backup (recommandé)
CREATE TABLE IF NOT EXISTS taximetre_backup AS 
SELECT * FROM taximetre;

-- 2. Supprimer les anciennes colonnes dupliquées
ALTER TABLE taximetre 
  DROP COLUMN IF EXISTS pc_debut_tax,
  DROP COLUMN IF EXISTS pc_fin_tax,
  DROP COLUMN IF EXISTS index_km_debut_tax,
  DROP COLUMN IF EXISTS index_km_fin_tax,
  DROP COLUMN IF EXISTS km_charge_debut,
  DROP COLUMN IF EXISTS km_charge_fin,
  DROP COLUMN IF EXISTS chutes_debut_tax,
  DROP COLUMN IF EXISTS chutes_fin_tax;

-- 3. Ajouter un commentaire sur la table
COMMENT ON TABLE taximetre IS 'Table taximetre nettoyée - anciennes colonnes supprimées le 2025-10-08';

-- 4. Vérifier le résultat
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'taximetre'
ORDER BY ordinal_position;

COMMIT;

-- Rollback si nécessaire:
-- BEGIN;
-- DROP TABLE taximetre;
-- ALTER TABLE taximetre_backup RENAME TO taximetre;
-- COMMIT;

-- ============ RÉSULTAT ATTENDU ============
/*
La table taximetre doit contenir UNIQUEMENT:

 column_name                  | data_type         | is_nullable
------------------------------+-------------------+-------------
 feuille_id                   | integer           | NO
 taximetre_prise_charge_debut | numeric(10,2)     | YES
 taximetre_prise_charge_fin   | numeric(10,2)     | YES
 taximetre_index_km_debut     | integer           | YES
 taximetre_index_km_fin       | integer           | YES
 taximetre_km_charge_debut    | numeric(10,2)     | YES
 taximetre_km_charge_fin      | numeric(10,2)     | YES
 taximetre_chutes_debut       | numeric(10,2)     | YES
 taximetre_chutes_fin         | numeric(10,2)     | YES
 created_at                   | timestamp(6)      | YES
 updated_at                   | timestamp(6)      | YES  <- À AJOUTER si pas présent
*/

-- ============ MISE À JOUR DU SCHÉMA PRISMA ============
/*
Après cette migration, mettre à jour prisma/schema.prisma:

model taximetre {
  feuille_id Int @id
  
  // DÉBUT DE SHIFT
  taximetre_prise_charge_debut Decimal? @db.Decimal(10, 2)
  taximetre_index_km_debut     Int?
  taximetre_km_charge_debut    Decimal? @db.Decimal(10, 2)
  taximetre_chutes_debut       Decimal? @db.Decimal(10, 2)
  
  // FIN DE SHIFT
  taximetre_prise_charge_fin   Decimal? @db.Decimal(10, 2)
  taximetre_index_km_fin       Int?
  taximetre_km_charge_fin      Decimal? @db.Decimal(10, 2)
  taximetre_chutes_fin         Decimal? @db.Decimal(10, 2)
  
  created_at DateTime? @default(now()) @db.Timestamp(6)
  updated_at DateTime? @default(now()) @updatedAt @db.Timestamp(6)
  
  feuille_route feuille_route @relation(fields: [feuille_id], references: [feuille_id], onDelete: Cascade, onUpdate: NoAction)
}

Puis exécuter:
npx prisma db pull
npx prisma generate
*/
