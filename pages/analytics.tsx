import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface PageRankResult {
  library: string;
  score: number;
}

interface ImpactResult {
  target: string;
  impactedCount: number;
  impactedLibraries: Array<{
    library: string;
    version: string;
    distance: number;
  }>;
}

interface CircularResult {
  cyclesFound: number;
  cycles: Array<{ cycle: string[]; length: number }>;
}

interface MostDependedResult {
  libraries: Array<{
    library: string;
    version: string;
    dependentCount: number;
  }>;
}

export default function Analytics() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'pagerank' | 'impact' | 'circular' | 'most-depended'>('pagerank');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [pageRankData, setPageRankData] = useState<PageRankResult[]>([]);
  const [selectedLibrary, setSelectedLibrary] = useState('');
  const [impactData, setImpactData] = useState<ImpactResult | null>(null);
  const [libraries, setLibraries] = useState<string[]>([]);
  const [circularData, setCircularData] = useState<CircularResult | null>(null);
  const [mostDependedData, setMostDependedData] = useState<MostDependedResult | null>(null);

  useEffect(() => {
    fetchLibraries();
  }, []);

  const fetchLibraries = async () => {
    try {
      const res = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `query { libraries { name } }`
        })
      });
      const { data } = await res.json();
      setLibraries(data.libraries.map((l: any) => l.name).sort());
    } catch (err) {
      console.error('Error fetching libraries:', err);
    }
  };

  const fetchPageRank = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/analytics?action=pagerank');
      if (!res.ok) throw new Error('Failed to fetch PageRank');
      const data = await res.json();
      setPageRankData(data.rankings);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchImpactAnalysis = async () => {
    if (!selectedLibrary) {
      setError('Please select a library');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/analytics?action=impact&library=${encodeURIComponent(selectedLibrary)}`);
      if (!res.ok) throw new Error('Failed to fetch impact analysis');
      const data = await res.json();
      setImpactData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCircularDependencies = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/analytics?action=circular');
      if (!res.ok) throw new Error('Failed to fetch circular dependencies');
      const data = await res.json();
      setCircularData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMostDepended = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/analytics?action=most-depended');
      if (!res.ok) throw new Error('Failed to fetch most depended libraries');
      const data = await res.json();
      setMostDependedData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setError('');
    
    if (tab === 'pagerank' && pageRankData.length === 0) {
      fetchPageRank();
    } else if (tab === 'most-depended' && !mostDependedData) {
      fetchMostDepended();
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Graph Analytics</h1>
        <p>Advanced graph algorithms and analysis</p>
      </header>

      <nav className="nav">
        <Link href="/">Graph</Link>
        <Link href="/libraries">All Libraries</Link>
        <Link href="/analytics">Analytics</Link>
        <Link href="/manage-relationships">Manage Relationships</Link>
        <Link href="/manage-nodes">Manage Nodes</Link>
      </nav>

      <main className="main">
        <div className="analytics-tabs">
          <button 
            className={`tab ${activeTab === 'pagerank' ? 'active' : ''}`}
            onClick={() => handleTabChange('pagerank')}
          >
            PageRank
          </button>
          <button 
            className={`tab ${activeTab === 'most-depended' ? 'active' : ''}`}
            onClick={() => handleTabChange('most-depended')}
          >
            Most Depended
          </button>
          <button 
            className={`tab ${activeTab === 'impact' ? 'active' : ''}`}
            onClick={() => handleTabChange('impact')}
          >
            Impact Analysis
          </button>
          <button 
            className={`tab ${activeTab === 'circular' ? 'active' : ''}`}
            onClick={() => handleTabChange('circular')}
          >
            Circular Dependencies
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {activeTab === 'pagerank' && (
          <div className="analytics-content">
            <div className="analytics-header">
              <h2>PageRank Algorithm</h2>
              <p>Ranking libraries by their importance in the dependency graph. Libraries with higher scores are more central and depended upon.</p>
              <button onClick={fetchPageRank} disabled={loading} className="submit-button">
                {loading ? 'Calculating...' : 'Run PageRank'}
              </button>
            </div>

            {pageRankData.length > 0 && (
              <div className="results-table">
                <table>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Library</th>
                      <th>PageRank Score</th>
                      <th>Relative Importance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRankData.map((item, index) => (
                      <tr key={item.library}>
                        <td><strong>#{index + 1}</strong></td>
                        <td>
                          <Link href={`/library/${item.library}`} className="link">
                            {item.library}
                          </Link>
                        </td>
                        <td>{item.score.toFixed(4)}</td>
                        <td>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${(item.score / pageRankData[0].score) * 100}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'most-depended' && (
          <div className="analytics-content">
            <div className="analytics-header">
              <h2>Most Depended Libraries</h2>
              <p>Libraries that are direct dependencies for the most other libraries.</p>
              <button onClick={fetchMostDepended} disabled={loading} className="submit-button">
                {loading ? 'Analyzing...' : 'Analyze Dependencies'}
              </button>
            </div>

            {mostDependedData && (
              <div className="results-table">
                <table>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Library</th>
                      <th>Version</th>
                      <th>Used By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mostDependedData.libraries.map((item, index) => (
                      <tr key={item.library}>
                        <td><strong>#{index + 1}</strong></td>
                        <td>
                          <Link href={`/library/${item.library}`} className="link">
                            {item.library}
                          </Link>
                        </td>
                        <td><span className="version-badge">v{item.version}</span></td>
                        <td><strong>{item.dependentCount}</strong> libraries</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'impact' && (
          <div className="analytics-content">
            <div className="analytics-header">
              <h2>Dependency Impact Analysis</h2>
              <p>Analyze what would be affected if a library was removed or deprecated.</p>
              
              <div className="impact-form">
                <div className="form-group">
                  <label htmlFor="librarySelect">Select Library:</label>
                  <select 
                    id="librarySelect"
                    value={selectedLibrary}
                    onChange={(e) => setSelectedLibrary(e.target.value)}
                  >
                    <option value="">-- Select a library --</option>
                    {libraries.map(lib => (
                      <option key={lib} value={lib}>{lib}</option>
                    ))}
                  </select>
                </div>
                <button onClick={fetchImpactAnalysis} disabled={loading || !selectedLibrary} className="submit-button">
                  {loading ? 'Analyzing...' : 'Analyze Impact'}
                </button>
              </div>
            </div>

            {impactData && (
              <div className="impact-results">
                <div className="impact-summary">
                  <h3>Impact Summary</h3>
                  <p>If <strong>{impactData.target}</strong> was removed, it would affect:</p>
                  <div className="impact-count">{impactData.impactedCount} libraries</div>
                </div>

                {impactData.impactedLibraries.length > 0 && (
                  <div className="results-table">
                    <h3>Affected Libraries</h3>
                    <table>
                      <thead>
                        <tr>
                          <th>Library</th>
                          <th>Version</th>
                          <th>Dependency Distance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {impactData.impactedLibraries.map((item) => (
                          <tr key={item.library}>
                            <td>
                              <Link href={`/library/${item.library}`} className="link">
                                {item.library}
                              </Link>
                            </td>
                            <td><span className="version-badge">v{item.version}</span></td>
                            <td>
                              <span className={`distance-badge distance-${item.distance}`}>
                                {item.distance === 1 ? 'Direct' : `${item.distance} levels`}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {impactData.impactedLibraries.length === 0 && (
                  <div className="no-impact">
                    <p>No libraries depend on this library. It can be safely removed.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'circular' && (
          <div className="analytics-content">
            <div className="analytics-header">
              <h2>Circular Dependency Detection</h2>
              <p>Detect circular dependencies in the library graph (potential architectural issues).</p>
              <button onClick={fetchCircularDependencies} disabled={loading} className="submit-button">
                {loading ? 'Detecting...' : 'Detect Cycles'}
              </button>
            </div>

            {circularData && (
              <div className="circular-results">
                <div className="circular-summary">
                  <h3>Detection Results</h3>
                  {circularData.cyclesFound > 0 ? (
                    <div className="warning-box">
                      <strong>Warning:</strong> Found {circularData.cyclesFound} circular dependencies
                    </div>
                  ) : (
                    <div className="success-box">
                      <strong>Good:</strong> No circular dependencies detected
                    </div>
                  )}
                </div>

                {circularData.cycles.length > 0 && (
                  <div className="cycles-list">
                    <h3>Detected Cycles</h3>
                    {circularData.cycles.map((cycle, index) => (
                      <div key={index} className="cycle-item">
                        <strong>Cycle {index + 1}</strong> (length: {cycle.length})
                        <div className="cycle-path">
                          {cycle.cycle.map((lib, i) => (
                            <span key={i}>
                              <Link href={`/library/${lib}`} className="link">{lib}</Link>
                              {i < cycle.cycle.length - 1 && ' → '}
                            </span>
                          ))}
                          {' → '}
                          <Link href={`/library/${cycle.cycle[0]}`} className="link">{cycle.cycle[0]}</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
