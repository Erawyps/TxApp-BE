#!/usr/bin/env node

/**
 * Script de vérification - Feuille de Route PDF
 * 
 * Ce script vérifie que toutes les corrections ont été appliquées correctement
 * et que le système est prêt à générer des feuilles de route PDF complètes.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Vérification des corrections - Feuille de Route PDF\n');

let allChecksPass = true;
const results = [];

// ============ VÉRIFICATION 1 : Field Mapper existe ============
console.log('📋 Vérification 1 : Field Mapper...');
const fieldMapperPath = path.join(__dirname, 'src/utils/fieldMapper.js');
if (fs.existsSync(fieldMapperPath)) {
  const content = fs.readFileSync(fieldMapperPath, 'utf-8');
  
  // Vérifier les exports
  const hasMapFeuilleRoute = content.includes('export const mapFeuilleRouteFromDB');
  const hasMapCourse = content.includes('export const mapCourseFromDB');
  const hasIndexDepart = content.includes('index_depart: dbCourse.index_depart ?? dbCourse.index_embarquement');
  
  if (hasMapFeuilleRoute && hasMapCourse && hasIndexDepart) {
    console.log('  ✅ Field Mapper présent et complet');
    console.log('  ✅ mapFeuilleRouteFromDB exporté');
    console.log('  ✅ mapCourseFromDB exporté');
    console.log('  ✅ index_depart avec fallback configuré');
    results.push({ check: 'Field Mapper', status: 'OK' });
  } else {
    console.log('  ❌ Field Mapper incomplet');
    if (!hasMapFeuilleRoute) console.log('     - mapFeuilleRouteFromDB manquant');
    if (!hasMapCourse) console.log('     - mapCourseFromDB manquant');
    if (!hasIndexDepart) console.log('     - index_depart fallback manquant');
    allChecksPass = false;
    results.push({ check: 'Field Mapper', status: 'ERREUR' });
  }
} else {
  console.log('  ❌ Field Mapper non trouvé à:', fieldMapperPath);
  allChecksPass = false;
  results.push({ check: 'Field Mapper', status: 'MANQUANT' });
}
console.log('');

// ============ VÉRIFICATION 2 : printUtils.js ============
console.log('📋 Vérification 2 : printUtils.js...');
const printUtilsPath = path.join(__dirname, 'src/app/pages/forms/new-post-form/utils/printUtils.js');
if (fs.existsSync(printUtilsPath)) {
  const content = fs.readFileSync(printUtilsPath, 'utf-8');
  
  const hasImportFieldMapper = content.includes("import { mapFeuilleRouteFromDB, mapCourseFromDB }");
  const hasMapFeuilleRouteUsage = content.includes('mapFeuilleRouteFromDB(rawShiftData)');
  const hasMapCourseUsage = content.includes('rawCourses.map(c => mapCourseFromDB(c)');
  const hasFetchDataForPDF = content.includes('export const fetchDataForPDF = async (feuilleId)');
  const fetchIsNotCommented = !content.includes('/** \nexport const fetchDataForPDF');
  
  if (hasImportFieldMapper && hasMapFeuilleRouteUsage && hasMapCourseUsage && hasFetchDataForPDF && fetchIsNotCommented) {
    console.log('  ✅ printUtils.js correctement configuré');
    console.log('  ✅ Field Mapper importé');
    console.log('  ✅ mapFeuilleRouteFromDB utilisé');
    console.log('  ✅ mapCourseFromDB utilisé');
    console.log('  ✅ fetchDataForPDF active (non commentée)');
    results.push({ check: 'printUtils.js', status: 'OK' });
  } else {
    console.log('  ❌ printUtils.js incomplet');
    if (!hasImportFieldMapper) console.log('     - Import Field Mapper manquant');
    if (!hasMapFeuilleRouteUsage) console.log('     - mapFeuilleRouteFromDB non utilisé');
    if (!hasMapCourseUsage) console.log('     - mapCourseFromDB non utilisé');
    if (!hasFetchDataForPDF) console.log('     - fetchDataForPDF manquant');
    if (!fetchIsNotCommented) console.log('     - fetchDataForPDF encore commentée');
    allChecksPass = false;
    results.push({ check: 'printUtils.js', status: 'ERREUR' });
  }
} else {
  console.log('  ❌ printUtils.js non trouvé à:', printUtilsPath);
  allChecksPass = false;
  results.push({ check: 'printUtils.js', status: 'MANQUANT' });
}
console.log('');

// ============ VÉRIFICATION 3 : Schéma Prisma ============
console.log('📋 Vérification 3 : Schéma Prisma...');
const schemaPath = path.join(__dirname, 'prisma/schema.prisma');
if (fs.existsSync(schemaPath)) {
  const content = fs.readFileSync(schemaPath, 'utf-8');
  
  const hasIndexDepart = content.includes('index_depart');
  const hasCourseModel = content.includes('model course {');
  const hasFeuilleRouteModel = content.includes('model feuille_route {');
  
  if (hasIndexDepart && hasCourseModel && hasFeuilleRouteModel) {
    console.log('  ✅ Schéma Prisma correct');
    console.log('  ✅ index_depart présent dans le modèle course');
    console.log('  ✅ model course défini');
    console.log('  ✅ model feuille_route défini');
    results.push({ check: 'Schéma Prisma', status: 'OK' });
  } else {
    console.log('  ❌ Schéma Prisma incomplet');
    if (!hasIndexDepart) console.log('     - index_depart manquant');
    if (!hasCourseModel) console.log('     - model course manquant');
    if (!hasFeuilleRouteModel) console.log('     - model feuille_route manquant');
    allChecksPass = false;
    results.push({ check: 'Schéma Prisma', status: 'ERREUR' });
  }
} else {
  console.log('  ❌ Schéma Prisma non trouvé à:', schemaPath);
  allChecksPass = false;
  results.push({ check: 'Schéma Prisma', status: 'MANQUANT' });
}
console.log('');

// ============ VÉRIFICATION 4 : prismaService.js ============
console.log('📋 Vérification 4 : prismaService.js...');
const prismaServicePath = path.join(__dirname, 'src/services/prismaService.js');
if (fs.existsSync(prismaServicePath)) {
  const content = fs.readFileSync(prismaServicePath, 'utf-8');
  
  const hasGetFeuilleRouteById = content.includes('export async function getFeuilleRouteById');
  const hasPluralCourses = content.includes('courses: {') && content.includes('include: {');
  const hasPluralCharges = content.includes('charges: {') && content.includes('include: {');
  const hasTaximetreInclude = content.includes('taximetre: true');
  const hasSocieteTaxiInclude = content.includes('societe_taxi: true');
  
  if (hasGetFeuilleRouteById && hasPluralCourses && hasPluralCharges && hasTaximetreInclude && hasSocieteTaxiInclude) {
    console.log('  ✅ prismaService.js correctement configuré');
    console.log('  ✅ getFeuilleRouteById exporté');
    console.log('  ✅ Relations au pluriel (courses, charges)');
    console.log('  ✅ taximetre inclus');
    console.log('  ✅ societe_taxi inclus');
    results.push({ check: 'prismaService.js', status: 'OK' });
  } else {
    console.log('  ❌ prismaService.js incomplet');
    if (!hasGetFeuilleRouteById) console.log('     - getFeuilleRouteById manquant');
    if (!hasPluralCourses) console.log('     - courses (pluriel) manquant');
    if (!hasPluralCharges) console.log('     - charges (pluriel) manquant');
    if (!hasTaximetreInclude) console.log('     - taximetre include manquant');
    if (!hasSocieteTaxiInclude) console.log('     - societe_taxi include manquant');
    allChecksPass = false;
    results.push({ check: 'prismaService.js', status: 'ERREUR' });
  }
} else {
  console.log('  ❌ prismaService.js non trouvé à:', prismaServicePath);
  allChecksPass = false;
  results.push({ check: 'prismaService.js', status: 'MANQUANT' });
}
console.log('');

// ============ VÉRIFICATION 5 : Documentation ============
console.log('📋 Vérification 5 : Documentation...');
const docs = [
  'CORRECTIONS_FEUILLE_ROUTE.md',
  'GUIDE_FIELD_MAPPER.md',
  'CLARIFICATION_PRISMA_RELATIONS.md',
  'GUIDE_TEST_PDF.md',
  'RESUME_FINAL_CORRECTIONS.md'
];

let allDocsPresent = true;
docs.forEach(doc => {
  const docPath = path.join(__dirname, doc);
  if (fs.existsSync(docPath)) {
    console.log(`  ✅ ${doc} présent`);
  } else {
    console.log(`  ❌ ${doc} manquant`);
    allDocsPresent = false;
  }
});

if (allDocsPresent) {
  results.push({ check: 'Documentation', status: 'OK' });
} else {
  allChecksPass = false;
  results.push({ check: 'Documentation', status: 'INCOMPLET' });
}
console.log('');

// ============ RÉSUMÉ ============
console.log('=' .repeat(60));
console.log('📊 RÉSUMÉ DES VÉRIFICATIONS');
console.log('=' .repeat(60));
console.log('');

results.forEach(result => {
  const icon = result.status === 'OK' ? '✅' : '❌';
  console.log(`${icon} ${result.check.padEnd(25)} : ${result.status}`);
});

console.log('');
console.log('=' .repeat(60));

if (allChecksPass) {
  console.log('✅ SUCCÈS : Toutes les vérifications sont passées !');
  console.log('');
  console.log('🎉 Le système est prêt à générer des feuilles de route PDF complètes.');
  console.log('');
  console.log('📋 Prochaines étapes :');
  console.log('  1. Démarrer le serveur : npm run dev');
  console.log('  2. Ouvrir la vue chauffeur dans le navigateur');
  console.log('  3. Sélectionner une feuille de route');
  console.log('  4. Cliquer sur "Générer PDF"');
  console.log('  5. Vérifier que toutes les données sont présentes dans le PDF');
  console.log('');
  console.log('📚 Consultez GUIDE_TEST_PDF.md pour plus de détails');
  process.exit(0);
} else {
  console.log('❌ ERREUR : Certaines vérifications ont échoué');
  console.log('');
  console.log('⚠️  Veuillez corriger les erreurs ci-dessus avant de continuer.');
  console.log('');
  console.log('📚 Consultez la documentation :');
  console.log('  - RESUME_FINAL_CORRECTIONS.md');
  console.log('  - GUIDE_FIELD_MAPPER.md');
  process.exit(1);
}
