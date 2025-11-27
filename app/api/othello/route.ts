import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return new Response(
    JSON.stringify({ message: 'Othello WebSocket endpoint. Use WebSocket connection.' }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
