import { ApolloServer } from 'apollo-server-micro';
import { neoSchema } from '@/lib/graphql/neo4j-graphql';
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

let apolloServerHandler: any;

async function getApolloServerHandler() {
  if (!apolloServerHandler) {
    try {
      const schema = await neoSchema.getSchema();
      const apolloServer = new ApolloServer({
        schema,
        context: ({ req }) => ({ req }),
        introspection: true,
        formatError: (error) => {
          console.error('GraphQL Error:', error);
          return error;
        },
      });

      await apolloServer.start();
      apolloServerHandler = apolloServer.createHandler({ path: '/api/graphql' });
    } catch (error) {
      console.error('Failed to initialize Apollo Server:', error);
      throw error;
    }
  }
  return apolloServerHandler;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const handler = await getApolloServerHandler();
    return handler(req, res);
  } catch (error: any) {
    console.error('GraphQL handler error:', error);
    return res.status(500).json({ error: error.message });
  }
}
