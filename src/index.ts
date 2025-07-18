import postgres from 'postgres';

export default {
  async fetch(request: Request, env: any) {
    const sql = postgres(env.HYPERDRIVE);

    const result = await sql`SELECT NOW()`;
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
