import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@/lib/neo4j';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getSession();

  try {
    const result = await session.run('RETURN 1 as test');
    const isConnected = result.records.length > 0;

    if (isConnected) {
      res.status(200).json({ status: 'connected', message: 'Neo4j connection successful' });
    } else {
      res.status(500).json({ status: 'error', message: 'No records returned' });
    }
  } catch (error: any) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message || 'Connection failed' 
    });
  } finally {
    await session.close();
  }
}
