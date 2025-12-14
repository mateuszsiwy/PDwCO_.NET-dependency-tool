import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_LIBRARIES } from '@/lib/graphql/queries';

export default function Libraries() {
  const { loading, error, data } = useQuery(GET_LIBRARIES);

  return (
    <div className="container">
      <header className="header">
        <h1>All Libraries</h1>
      </header>

      <nav className="nav">
        <Link href="/">Graph</Link>
        <Link href="/libraries">All Libraries</Link>
        <Link href="/analytics">Analytics</Link>
        <Link href="/manage-relationships">Manage Relationships</Link>
        <Link href="/manage-nodes">Manage Nodes</Link>
      </nav>

      <main className="main">
        {loading && <p>Loading libraries...</p>}
        {error && <p className="error">Error loading libraries: {error.message}</p>}
        
        {data && (
          <>
            <p className="count">Total: {data.libraries.length} libraries</p>
            <div className="library-list">
              {data.libraries.map((lib: any) => (
                <div key={lib.name} className="library-item">
                  <div className="library-header">
                    <h3>{lib.name}</h3>
                    <span className="version">v{lib.version}</span>
                  </div>
                  <p className="description">{lib.description}</p>
                  {lib.repository && (
                    <a 
                      href={lib.repository} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="repo-link"
                    >
                      Repository →
                    </a>
                  )}
                  <div className="meta">
                    <div className="tags">
                      {lib.categories.map((cat: any) => (
                        <span key={cat.name} className="tag">{cat.name}</span>
                      ))}
                    </div>
                    <div className="frameworks">
                      {lib.frameworks.slice(0, 2).map((fw: any) => (
                        <span key={fw.name} className="framework">{fw.name}</span>
                      ))}
                    </div>
                  </div>
                  <Link href={`/library/${lib.name}`} className="details-link">
                    View Details →
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
