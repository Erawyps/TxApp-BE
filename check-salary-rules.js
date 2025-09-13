import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSalaryRules() {
  try {
    const rules = await prisma.regle_salaire.findMany();
    console.log('Règles de salaire dans la DB:', rules.length);
    rules.forEach(rule => {
      console.log('- ID:', rule.id, 'Nom:', rule.nom, 'Type:', rule.type_regle);
    });
  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSalaryRules();