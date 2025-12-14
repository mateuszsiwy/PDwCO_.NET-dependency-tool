import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { GET_LIBRARIES } from '@/lib/graphql/queries';

const GET_ALL_NODES = gql`
  query GetAllNodes {
    libraries {
      name
      version
    }
    categories {
      name
    }
    frameworks {
      name
    }
    authors {
      name
    }
  }
`;

const ADD_DEPENDENCY = gql`
  mutation AddDependency($from: String!, $to: String!) {
    updateLibraries(
      where: { name: $from }
      connect: { dependencies: [{ where: { node: { name: $to } } }] }
    ) {
      libraries {
        name
      }
    }
  }
`;

const ADD_CATEGORY = gql`
  mutation AddCategory($library: String!, $category: String!) {
    updateLibraries(
      where: { name: $library }
      connect: { categories: [{ where: { node: { name: $category } } }] }
    ) {
      libraries {
        name
      }
    }
  }
`;

const ADD_FRAMEWORK = gql`
  mutation AddFramework($library: String!, $framework: String!) {
    updateLibraries(
      where: { name: $library }
      connect: { frameworks: [{ where: { node: { name: $framework } } }] }
    ) {
      libraries {
        name
      }
    }
  }
`;

const ADD_MAINTAINER = gql`
  mutation AddMaintainer($library: String!, $author: String!) {
    updateLibraries(
      where: { name: $library }
      connect: { maintainers: [{ where: { node: { name: $author } } }] }
    ) {
      libraries {
        name
      }
    }
  }
`;

const ADD_ALTERNATIVE = gql`
  mutation AddAlternative($from: String!, $to: String!) {
    updateLibraries(
      where: { name: $from }
      connect: { alternatives: [{ where: { node: { name: $to } } }] }
    ) {
      libraries {
        name
      }
    }
  }
`;

export default function ManageRelationships() {
  const { data: nodesData, loading: nodesLoading } = useQuery(GET_ALL_NODES);
  const [relationshipType, setRelationshipType] = useState('DEPENDS_ON');
  const [fromNode, setFromNode] = useState('');
  const [toNode, setToNode] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [addDependency] = useMutation(ADD_DEPENDENCY, {
    refetchQueries: [{ query: GET_LIBRARIES }]
  });
  const [addCategory] = useMutation(ADD_CATEGORY, {
    refetchQueries: [{ query: GET_LIBRARIES }]
  });
  const [addFramework] = useMutation(ADD_FRAMEWORK, {
    refetchQueries: [{ query: GET_LIBRARIES }]
  });
  const [addMaintainer] = useMutation(ADD_MAINTAINER, {
    refetchQueries: [{ query: GET_LIBRARIES }]
  });
  const [addAlternative] = useMutation(ADD_ALTERNATIVE, {
    refetchQueries: [{ query: GET_LIBRARIES }]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    try {
      switch (relationshipType) {
        case 'DEPENDS_ON':
          await addDependency({ variables: { from: fromNode, to: toNode } });
          setSuccess(`Added dependency: ${fromNode} → ${toNode}`);
          break;
        case 'BELONGS_TO':
          await addCategory({ variables: { library: fromNode, category: toNode } });
          setSuccess(`Added category: ${fromNode} → ${toNode}`);
          break;
        case 'TARGETS':
          await addFramework({ variables: { library: fromNode, framework: toNode } });
          setSuccess(`Added framework target: ${fromNode} → ${toNode}`);
          break;
        case 'MAINTAINED_BY':
          await addMaintainer({ variables: { library: fromNode, author: toNode } });
          setSuccess(`Added maintainer: ${fromNode} → ${toNode}`);
          break;
        case 'ALTERNATIVE_TO':
          await addAlternative({ variables: { from: fromNode, to: toNode } });
          setSuccess(`Added alternative: ${fromNode} ↔ ${toNode}`);
          break;
      }
      setFromNode('');
      setToNode('');
    } catch (err: any) {
      setError(`Error: ${err.message}`);
      console.error('Error adding relationship:', err);
    }
  };

  const getSourceOptions = () => {
    if (!nodesData) return [];
    switch (relationshipType) {
      case 'DEPENDS_ON':
      case 'BELONGS_TO':
      case 'TARGETS':
      case 'MAINTAINED_BY':
      case 'ALTERNATIVE_TO':
        return nodesData.libraries || [];
      default:
        return [];
    }
  };

  const getTargetOptions = () => {
    if (!nodesData) return [];
    switch (relationshipType) {
      case 'DEPENDS_ON':
      case 'ALTERNATIVE_TO':
        return nodesData.libraries || [];
      case 'BELONGS_TO':
        return nodesData.categories || [];
      case 'TARGETS':
        return nodesData.frameworks || [];
      case 'MAINTAINED_BY':
        return nodesData.authors || [];
      default:
        return [];
    }
  };

  const getRelationshipDescription = () => {
    switch (relationshipType) {
      case 'DEPENDS_ON':
        return 'Library depends on another library';
      case 'BELONGS_TO':
        return 'Library belongs to a category';
      case 'TARGETS':
        return 'Library targets a framework';
      case 'MAINTAINED_BY':
        return 'Library is maintained by an author';
      case 'ALTERNATIVE_TO':
        return 'Library is an alternative to another';
      default:
        return '';
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="container">
        <header className="header">
          <h1>Manage Relationships</h1>
          <p>Add connections between nodes in the graph</p>
        </header>

        <nav className="nav">
          <Link href="/">Graph</Link>
          <Link href="/libraries">All Libraries</Link>
          <Link href="/analytics">Analytics</Link>
          <Link href="/manage-relationships">Manage Relationships</Link>
          <Link href="/manage-nodes">Manage Nodes</Link>
        </nav>

        <main className="main">
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Manage Relationships</h1>
        <p>Add connections between nodes in the graph</p>
      </header>

      <nav className="nav">
        <Link href="/">Graph</Link>
        <Link href="/libraries">All Libraries</Link>
        <Link href="/analytics">Analytics</Link>
        <Link href="/manage-relationships">Manage Relationships</Link>
        <Link href="/manage-nodes">Manage Nodes</Link>
      </nav>

      <main className="main">
        <div className="form-container">
          <form onSubmit={handleSubmit} className="library-form">
            <h2>Add New Relationship</h2>
            
            <div className="form-group">
              <label htmlFor="relationshipType">Relationship Type *</label>
              <select
                id="relationshipType"
                value={relationshipType}
                onChange={(e) => {
                  setRelationshipType(e.target.value);
                  setFromNode('');
                  setToNode('');
                }}
                required
              >
                <option value="DEPENDS_ON">Depends On (Library → Library)</option>
                <option value="BELONGS_TO">Belongs To (Library → Category)</option>
                <option value="TARGETS">Targets (Library → Framework)</option>
                <option value="MAINTAINED_BY">Maintained By (Library → Author)</option>
                <option value="ALTERNATIVE_TO">Alternative To (Library ↔ Library)</option>
              </select>
              <small className="help-text">{getRelationshipDescription()}</small>
            </div>

            <div className="form-group">
              <label htmlFor="fromNode">
                From (Source) *
                {relationshipType === 'DEPENDS_ON' && ' - Which library'}
                {relationshipType === 'BELONGS_TO' && ' - Which library'}
                {relationshipType === 'TARGETS' && ' - Which library'}
                {relationshipType === 'MAINTAINED_BY' && ' - Which library'}
                {relationshipType === 'ALTERNATIVE_TO' && ' - First library'}
              </label>
              <select
                id="fromNode"
                value={fromNode}
                onChange={(e) => setFromNode(e.target.value)}
                required
                disabled={nodesLoading}
              >
                <option value="">-- Select --</option>
                {getSourceOptions().map((node: any) => (
                  <option key={node.name} value={node.name}>
                    {node.name} {node.version && `(v${node.version})`}
                  </option>
                ))}
              </select>
            </div>

            <div className="relationship-arrow">
              {relationshipType === 'ALTERNATIVE_TO' ? '↔' : '→'}
            </div>

            <div className="form-group">
              <label htmlFor="toNode">
                To (Target) *
                {relationshipType === 'DEPENDS_ON' && ' - Depends on which library'}
                {relationshipType === 'BELONGS_TO' && ' - In which category'}
                {relationshipType === 'TARGETS' && ' - Which framework'}
                {relationshipType === 'MAINTAINED_BY' && ' - By which author'}
                {relationshipType === 'ALTERNATIVE_TO' && ' - Second library'}
              </label>
              <select
                id="toNode"
                value={toNode}
                onChange={(e) => setToNode(e.target.value)}
                required
                disabled={nodesLoading}
              >
                <option value="">-- Select --</option>
                {getTargetOptions().map((node: any) => (
                  <option key={node.name} value={node.name}>
                    {node.name} {node.version && `(v${node.version})`}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {success && (
              <div className="success-message">
                {success}
              </div>
            )}

            <button type="submit" disabled={nodesLoading} className="submit-button">
              {nodesLoading ? 'Loading...' : 'Add Relationship'}
            </button>
          </form>

          <div className="info-panel">
            <h3>Quick Guide</h3>
            <ul>
              <li><strong>Depends On:</strong> One library requires another to function</li>
              <li><strong>Belongs To:</strong> Categorize libraries by functionality</li>
              <li><strong>Targets:</strong> Specify which .NET framework versions are supported</li>
              <li><strong>Maintained By:</strong> Link libraries to their maintainers</li>
              <li><strong>Alternative To:</strong> Mark libraries as alternatives (creates bidirectional link)</li>
            </ul>
            
            <div className="tip">
              <strong>Tip:</strong> After adding relationships, visit the graph page to see your changes visualized!
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
