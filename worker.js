import postgres from 'postgres';

export default {
  async fetch(request, env) {
    // 1. Extraire l'ID depuis l'URL
    const url = new URL(request.url);
    const id = url.searchParams.get('id'); // Pour une URL comme ?id=123
    
    if (!id) {
      return Response.json(
        { error: "ID parameter is required" },
        { status: 400 }
      );
    }

    // 2. Configurer la connexion PostgreSQL
    const sql = postgres(env.HYPERDRIVE.connectionString, {
      ssl: 'require',
      connect_timeout: 30 // Timeout en secondes
    });

    try {
      // 3. Exécuter la requête
      const [user] = await sql`
        SELECT * FROM users WHERE id = ${id}
      `;
      
      if (!user) {
        return Response.json(
          { error: "User not found" },
          { status: 404 }
        );
      }
      
      return Response.json(user);
      
    } catch (err) {
      // 4. Gestion d'erreur améliorée
      console.error("Database error:", err);
      return Response.json(
        { 
          error: "Database operation failed",
          details: env.NODE_ENV === 'development' ? err.message : null
        },
        { status: 500 }
      );
    } finally {
      // 5. Fermer proprement la connexion
      try {
        await sql.end({ timeout: 5 });
      } catch (e) {
        console.error("Error closing connection:", e);
      }
    }
  }
}