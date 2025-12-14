import { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_LIBRARY_DETAILS } from '@/lib/graphql/queries';

export default function LibraryDetails() {
  const router = useRouter();
  const { name } = router.query;

  const { loading, error, data } = useQuery(GET_LIBRARY_DETAILS, {
    variables: { name },
    skip: !name,
  });

  if (!name) return null;

  return (
    <div className="container">
      <header className="header">
        <h1>Library Details</h1>
      </header>

      <nav className="nav">
        <Link href="/">Graph</Link>
        <Link href="/libraries">All Libraries</Link>
        <Link href="/analytics">Analytics</Link>
        <Link href="/manage-relationships">Manage Relationships</Link>
        <Link href="/manage-nodes">Manage Nodes</Link>
      </nav>

      <main className="main">
        {loading && <p>Loading library details...</p>}
        {error && <p className="error">Error: {error.message}</p>}
        
        {data?.libraries?.[0] && (
          <div className="library-details">
            <div className="detail-header">
              <h2>{data.libraries[0].name}</h2>
              <span className="version-badge">v{data.libraries[0].version}</span>
            </div>

            <p className="description">{data.libraries[0].description}</p>

            {data.libraries[0].repository && (
              <a 
                href={data.libraries[0].repository} 
                target="_blank" 
                rel="noopener noreferrer"
                className="repo-link-big"
              >
                View Repository →
              </a>
            )}

            <section className="detail-section">
              <h3>Categories</h3>
              <div className="tags">
                {data.libraries[0].categories.map((cat: any) => (
                  <span key={cat.name} className="tag-large">
                    {cat.name}
                    {cat.description && <small>{cat.description}</small>}
                  </span>
                ))}
              </div>
            </section>

            <section className="detail-section">
              <h3>Target Frameworks</h3>
              <div className="frameworks">
                {data.libraries[0].frameworks.map((fw: any) => (
                  <span key={fw.name} className="framework-large">
                    {fw.name}
                  </span>
                ))}
              </div>
            </section>

            <section className="detail-section">
              <h3>👥 Maintainers</h3>
              <div className="maintainers">
                {data.libraries[0].maintainers.map((author: any) => (
                  <div key={author.name} className="maintainer">
                    {author.url ? (
                      <a href={author.url} target="_blank" rel="noopener noreferrer">
                        {author.name}
                      </a>
                    ) : (
                      <span>{author.name}</span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {data.libraries[0].dependencies.length > 0 && (
              <section className="detail-section">
                <h3>Dependencies ({data.libraries[0].dependencies.length})</h3>
                <div className="dependency-list">
                  {data.libraries[0].dependencies.map((dep: any) => (
                    <div key={dep.name} className="dependency-item">
                      <Link href={`/library/${dep.name}`}>
                        <strong>{dep.name}</strong>
                      </Link>
                      <span className="version">v{dep.version}</span>
                      <p>{dep.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {data.libraries[0].dependents.length > 0 && (
              <section className="detail-section">
                <h3>Used By ({data.libraries[0].dependents.length})</h3>
                <div className="dependency-list">
                  {data.libraries[0].dependents.map((dep: any) => (
                    <div key={dep.name} className="dependency-item">
                      <Link href={`/library/${dep.name}`}>
                        <strong>{dep.name}</strong>
                      </Link>
                      <span className="version">v{dep.version}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {data.libraries[0].alternatives.length > 0 && (
              <section className="detail-section">
                <h3>🔄 Alternatives</h3>
                <div className="dependency-list">
                  {data.libraries[0].alternatives.map((alt: any) => (
                    <div key={alt.name} className="dependency-item">
                      <Link href={`/library/${alt.name}`}>
                        <strong>{alt.name}</strong>
                      </Link>
                      <span className="version">v{alt.version}</span>
                      <p>{alt.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
