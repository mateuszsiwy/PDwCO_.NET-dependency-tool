import type { NextApiRequest, NextApiResponse } from 'next';
import { driver } from '@/lib/neo4j';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = driver.session();

  try {
    const { action } = req.query;

    switch (action) {
      case 'pagerank': {

        const result = await session.run(`
          MATCH (lib:Library)
          OPTIONAL MATCH (dependent:Library)-[:DEPENDS_ON]->(lib)
          WITH lib, count(DISTINCT dependent) as directDependents
          OPTIONAL MATCH (indirect:Library)-[:DEPENDS_ON*2..3]->(lib)
          WITH lib, directDependents, count(DISTINCT indirect) as indirectDependents
          WITH lib, 
               (directDependents * 10.0 + indirectDependents * 2.0) as score
          WHERE score > 0
          RETURN lib.name AS library, score
          ORDER BY score DESC
          LIMIT 20
        `);

        const rankings = result.records.map(record => ({
          library: record.get('library'),
          score: record.get('score')
        }));

        return res.status(200).json({ rankings });
      }

      case 'impact': {
        const { library } = req.query;
        if (!library) {
          return res.status(400).json({ error: 'Library name required' });
        }

        const result = await session.run(`
          MATCH path = (dependent:Library)-[:DEPENDS_ON*]->(target:Library {name: $library})
          WITH dependent, length(path) as depth
          RETURN DISTINCT dependent.name as library, 
                 dependent.version as version,
                 MIN(depth) as distance
          ORDER BY distance, library
        `, { library });

        const impactedLibraries = result.records.map(record => ({
          library: record.get('library'),
          version: record.get('version'),
          distance: record.get('distance').toNumber()
        }));

        return res.status(200).json({ 
          target: library,
          impactedCount: impactedLibraries.length,
          impactedLibraries 
        });
      }

      case 'circular': {
        const result = await session.run(`
          MATCH path = (a:Library)-[:DEPENDS_ON*2..]->(a)
          WHERE ALL(n IN nodes(path) WHERE single(m IN nodes(path) WHERE m = n))
          WITH [n IN nodes(path) | n.name] AS cycle, length(path) as cycleLength
          RETURN DISTINCT cycle, cycleLength
          ORDER BY cycleLength
          LIMIT 50
        `);

        const cycles = result.records.map(record => ({
          cycle: record.get('cycle'),
          length: record.get('cycleLength').toNumber()
        }));

        return res.status(200).json({ 
          cyclesFound: cycles.length,
          cycles 
        });
      }

      case 'statistics': {
        const stats = await session.run(`
          MATCH (l:Library)
          OPTIONAL MATCH (l)-[d:DEPENDS_ON]->()
          WITH l, COUNT(d) as depCount
          RETURN 
            COUNT(l) as totalLibraries,
            AVG(depCount) as avgDependencies,
            MAX(depCount) as maxDependencies,
            MIN(depCount) as minDependencies
        `);

        const categoryStats = await session.run(`
          MATCH (c:Category)<-[:BELONGS_TO]-(l:Library)
          RETURN c.name as category, COUNT(l) as libraryCount
          ORDER BY libraryCount DESC
        `);

        const frameworkStats = await session.run(`
          MATCH (f:Framework)<-[:TARGETS]-(l:Library)
          RETURN f.name as framework, COUNT(l) as libraryCount
          ORDER BY libraryCount DESC
        `);

        const record = stats.records[0];
        
        return res.status(200).json({
          totalLibraries: record.get('totalLibraries').toNumber(),
          avgDependencies: record.get('avgDependencies'),
          maxDependencies: record.get('maxDependencies').toNumber(),
          minDependencies: record.get('minDependencies').toNumber(),
          categoryDistribution: categoryStats.records.map(r => ({
            category: r.get('category'),
            count: r.get('libraryCount').toNumber()
          })),
          frameworkDistribution: frameworkStats.records.map(r => ({
            framework: r.get('framework'),
            count: r.get('libraryCount').toNumber()
          }))
        });
      }

      case 'communities': {
        const result = await session.run(`
          MATCH (l:Library)
          OPTIONAL MATCH path = (l)-[:DEPENDS_ON*1..2]-(connected:Library)
          WITH l, collect(DISTINCT connected.name) + [l.name] as cluster
          RETURN l.name as library, cluster
          ORDER BY size(cluster) DESC, library
          LIMIT 50
        `);

        const communities: { [key: string]: string[] } = {};
        const processed = new Set<string>();
        let communityId = 0;

        result.records.forEach(record => {
          const library = record.get('library');
          if (processed.has(library)) return;
          
          const cluster = record.get('cluster');
          const communityKey = `community_${communityId}`;
          communities[communityKey] = cluster.filter((lib: string) => !processed.has(lib));
          
          cluster.forEach((lib: string) => processed.add(lib));
          communityId++;
        });

        return res.status(200).json({ 
          communityCount: Object.keys(communities).length,
          communities 
        });
      }

      case 'most-depended': {
        const result = await session.run(`
          MATCH (l:Library)<-[:DEPENDS_ON]-(dependent:Library)
          WITH l, COUNT(DISTINCT dependent) as dependentCount
          RETURN l.name as library, l.version as version, dependentCount
          ORDER BY dependentCount DESC
          LIMIT 20
        `);

        const libraries = result.records.map(record => ({
          library: record.get('library'),
          version: record.get('version'),
          dependentCount: record.get('dependentCount').toNumber()
        }));

        return res.status(200).json({ libraries });
      }

      default:
        return res.status(400).json({ error: 'Invalid action parameter' });
    }
  } catch (error: any) {
    console.error('Analytics API error:', error);
    return res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
}
