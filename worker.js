import postgres from 'postgres';

export default {
  async fetch(request, env) {
    // 1. Configuration de la connexion
    const sql = postgres(env.HYPERDRIVE.connectionString, {
      ssl: 'require',
      connect_timeout: 10,
      max: 1  // Limite à 1 connexion pour éviter les fuites
    });

    try {
      // 2. Exécution d'une requête fixe (sans paramètre)
      const users = await sql`
        SELECT * FROM users LIMIT 10
      `;
      
      // 3. Formatage de la réponse
      return Response.json({
        success: true,
        data: users,
        count: users.length
      });
      
    } catch (err) {
      // 4. Gestion d'erreur basique
      return Response.json(
        { 
          success: false,
          error: "Database query failed",
          message: err.message 
        },
        { status: 500 }
      );
    } finally {
      // 5. Nettoyage
      await sql.end().catch(() => {});
    }
  }
}