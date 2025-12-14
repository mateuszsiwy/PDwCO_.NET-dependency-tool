import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function GraphVisualization() {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allNodes, setAllNodes] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadVisualization = async () => {
      try {
        const { Network } = await import('vis-network');
        
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query {
                libraries {
                  name
                  version
                  dependencies {
                    name
                  }
                  categories {
                    name
                  }
                  frameworks {
                    name
                  }
                  maintainers {
                    name
                  }
                  alternatives {
                    name
                  }
                }
                categories {
                  name
                }
                frameworks {
                  name
                  version
                }
                authors {
                  name
                }
              }
            `,
          }),
        });

        const { data } = await response.json();
        
        if (!data?.libraries) {
          throw new Error('No data received');
        }

        const nodes: any[] = [];
        const edges: any[] = [];
        const nodeIds = new Set<string>();

        data.libraries.forEach((lib: any) => {
          if (!nodeIds.has(lib.name)) {
            nodes.push({
              id: lib.name,
              label: `${lib.name}\nv${lib.version}`,
              shape: 'box',
              color: {
                background: '#0078D4',
                border: '#005A9E',
                highlight: {
                  background: '#00A4EF',
                  border: '#0078D4'
                }
              },
              font: { color: '#ffffff', size: 12, bold: true },
              group: 'library'
            });
            nodeIds.add(lib.name);
          }
        });

        data.categories?.forEach((cat: any) => {
          if (!nodeIds.has(`cat_${cat.name}`)) {
            nodes.push({
              id: `cat_${cat.name}`,
              label: cat.name,
              shape: 'ellipse',
              color: {
                background: '#00B7C3',
                border: '#008B94',
                highlight: {
                  background: '#00D8E6',
                  border: '#00B7C3'
                }
              },
              font: { color: '#ffffff', size: 11 },
              group: 'category'
            });
            nodeIds.add(`cat_${cat.name}`);
          }
        });

        data.frameworks?.forEach((fw: any) => {
          if (!nodeIds.has(`fw_${fw.name}`)) {
            nodes.push({
              id: `fw_${fw.name}`,
              label: fw.name,
              shape: 'diamond',
              color: {
                background: '#68217A',
                border: '#4B1A5C',
                highlight: {
                  background: '#8C2E9E',
                  border: '#68217A'
                }
              },
              font: { color: '#ffffff', size: 11, bold: true },
              group: 'framework'
            });
            nodeIds.add(`fw_${fw.name}`);
          }
        });

        data.authors?.forEach((author: any) => {
          if (!nodeIds.has(`auth_${author.name}`)) {
            nodes.push({
              id: `auth_${author.name}`,
              label: author.name,
              shape: 'dot',
              color: {
                background: '#CA5010',
                border: '#A74109',
                highlight: {
                  background: '#EF6C2D',
                  border: '#CA5010'
                }
              },
              font: { color: '#ffffff', size: 10 },
              size: 15,
              group: 'author'
            });
            nodeIds.add(`auth_${author.name}`);
          }
        });

        data.libraries.forEach((lib: any) => {
          lib.dependencies?.forEach((dep: any) => {
            edges.push({
              from: lib.name,
              to: dep.name,
              arrows: 'to',
              color: { color: '#666666' },
              label: 'depends on',
              font: { size: 9, align: 'middle', color: '#4FC3F7', background: '#1E1E1E', strokeWidth: 0 },
              dashes: false
            });
          });

          lib.categories?.forEach((cat: any) => {
            edges.push({
              from: lib.name,
              to: `cat_${cat.name}`,
              arrows: 'to',
              color: { color: '#00B7C3', opacity: 0.6 },
              label: 'belongs to',
              font: { size: 9, align: 'middle', color: '#00E5FF', background: '#1E1E1E', strokeWidth: 0 },
              dashes: true,
              width: 1.5
            });
          });

          lib.frameworks?.forEach((fw: any) => {
            edges.push({
              from: lib.name,
              to: `fw_${fw.name}`,
              arrows: 'to',
              color: { color: '#68217A', opacity: 0.6 },
              label: 'targets',
              font: { size: 9, align: 'middle', color: '#CE93D8', background: '#1E1E1E', strokeWidth: 0 },
              dashes: [5, 5],
              width: 2
            });
          });

          lib.maintainers?.forEach((author: any) => {
            edges.push({
              from: lib.name,
              to: `auth_${author.name}`,
              arrows: 'to',
              color: { color: '#CA5010', opacity: 0.6 },
              label: 'maintained by',
              font: { size: 9, align: 'middle', color: '#FFAB40', background: '#1E1E1E', strokeWidth: 0 },
              dashes: [2, 4],
              width: 1.5
            });
          });

          lib.alternatives?.forEach((alt: any) => {
            if (lib.name < alt.name) {
              edges.push({
                from: lib.name,
                to: alt.name,
                arrows: 'to;from',
                color: { color: '#16C60C', opacity: 0.6 },
                label: 'alternative',
                font: { size: 9, align: 'middle', color: '#69F0AE', background: '#1E1E1E', strokeWidth: 0 },
                dashes: [10, 5],
                width: 1.5
              });
            }
          });
        });

        setAllNodes(nodes);

        if (containerRef.current) {
          const network = new Network(
            containerRef.current,
            { nodes, edges },
            {
              physics: {
                enabled: true,
                stabilization: {
                  iterations: 100,
                },
                barnesHut: {
                  gravitationalConstant: -2000,
                  springLength: 200,
                  springConstant: 0.04,
                },
              },
              interaction: {
                hover: true,
                tooltipDelay: 200,
              },
              nodes: {
                font: {
                  size: 14,
                  face: 'arial',
                },
              },
            }
          );

          networkRef.current = network;

          network.on('click', (params) => {
            if (params.nodes.length > 0) {
              const nodeId = params.nodes[0];
              if (!nodeId.startsWith('cat_') && !nodeId.startsWith('fw_') && !nodeId.startsWith('auth_')) {
                router.push(`/library/${nodeId}`);
              }
            }
          });
        }

        setLoading(false);
      } catch (err: any) {
        console.error('Error loading visualization:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadVisualization();
  }, [router]);

  const handleNodeSearch = (nodeId: string) => {
    if (nodeId && networkRef.current) {
      networkRef.current.focus(nodeId, {
        scale: 1.5,
        animation: {
          duration: 1000,
          easingFunction: 'easeInOutQuad'
        }
      });
      
      networkRef.current.selectNodes([nodeId]);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Dependency Graph</h1>
      </header>

      <nav className="nav">
        <Link href="/">Graph</Link>
        <Link href="/libraries">All Libraries</Link>
        <Link href="/manage-relationships">Manage Relationships</Link>
        <Link href="/manage-nodes">Manage Nodes</Link>
      </nav>

      <main className="main">
        {loading && <p>Loading graph visualization...</p>}
        {error && <p className="error">Error: {error}</p>}
        
        {!loading && !error && (
          <div className="graph-search-container">
            <label htmlFor="nodeSearch" className="search-label">
              Focus on Node:
            </label>
            <select
              id="nodeSearch"
              value={selectedNode}
              onChange={(e) => {
                setSelectedNode(e.target.value);
                handleNodeSearch(e.target.value);
              }}
              className="node-search-select"
            >
              <option value="">-- Select a node to focus --</option>
              {allNodes
                .sort((a, b) => {
                  const getType = (node: any) => {
                    if (node.id.startsWith('cat_')) return 2;
                    if (node.id.startsWith('fw_')) return 3;
                    if (node.id.startsWith('auth_')) return 4;
                    return 1; // library
                  };
                  const typeA = getType(a);
                  const typeB = getType(b);
                  if (typeA !== typeB) return typeA - typeB;
                  return a.label.localeCompare(b.label);
                })
                .map((node) => {
                  let prefix = '';
                  if (node.id.startsWith('cat_')) prefix = 'Category: ';
                  else if (node.id.startsWith('fw_')) prefix = 'Framework: ';
                  else if (node.id.startsWith('auth_')) prefix = 'Author: ';
                  else prefix = 'Library: ';
                  
                  return (
                    <option key={node.id} value={node.id}>
                      {prefix}{node.label}
                    </option>
                  );
                })}
            </select>
          </div>
        )}

        <div className="graph-legend">
          <h3>Legend:</h3>
          <div className="legend-items">
            <div className="legend-item">
              <span className="legend-box library"></span>
              <span>Library</span>
            </div>
            <div className="legend-item">
              <span className="legend-box category"></span>
              <span>Category</span>
            </div>
            <div className="legend-item">
              <span className="legend-box framework"></span>
              <span>Framework</span>
            </div>
            <div className="legend-item">
              <span className="legend-box author"></span>
              <span>Author</span>
            </div>
          </div>
          <div className="legend-relationships">
            <p><strong>Relationships:</strong></p>
            <p>─── depends on</p>
            <p>╌╌╌ belongs to</p>
            <p>┄┄┄ targets</p>
            <p>┈┈┈ maintained by</p>
            <p>━━━ alternative</p>
          </div>
        </div>
        
        <div className="graph-info">
          <p>Click on a library node (blue box) to view details • Drag to move • Scroll to zoom</p>
        </div>
        
        <div 
          ref={containerRef} 
          className="graph-container"
          style={{ 
            width: '100%', 
            height: '700px', 
            border: '1px solid #3E3E42',
            borderRadius: '8px',
            background: '#1E1E1E'
          }}
        />
      </main>
    </div>
  );
}
