import { put, list } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const BLOB_NAME = 'conf-state.json';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method === 'GET') {
    const { blobs } = await list({ prefix: BLOB_NAME });
    if (!blobs.length) return res.json(null);
    const r = await fetch(blobs[0].url);
    return res.json(await r.json());
  }

  if (req.method === 'PUT') {
    await put(BLOB_NAME, JSON.stringify(req.body), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return res.json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
