import { Neo4jGraphQL } from '@neo4j/graphql';
import { driver } from '../neo4j';
import { typeDefs } from './schema';

export const neoSchema = new Neo4jGraphQL({
  typeDefs,
  driver,
});
