import postgres from 'postgres';

export default {
  async fetch(request, env) {
    const sql = postgres(env.HYPERDRIVE.connectionString, {
      ssl: 'require'
    });

    try {
      const [user] = await sql`
        SELECT * FROM users WHERE id = ${request.params.id}
      `;
      
      return Response.json(user || { error: "User not found" });
    } catch (err) {
      return Response.json(
        { error: err.message },
        { status: 500 }
      );
    } finally {
      await sql.end();
    }
  }
}