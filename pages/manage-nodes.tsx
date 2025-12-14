import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, gql } from '@apollo/client';

const GET_ALL_NODES = gql`
  query GetAllNodes {
    libraries {
      name
      version
      description
      repository
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
`;

const CREATE_CATEGORY = gql`
  mutation CreateCategory($name: String!) {
    createCategories(input: [{ name: $name }]) {
      categories {
        name
      }
    }
  }
`;

const CREATE_FRAMEWORK = gql`
  mutation CreateFramework($name: String!, $version: String!) {
    createFrameworks(input: [{ name: $name, version: $version }]) {
      frameworks {
        name
        version
      }
    }
  }
`;

const CREATE_AUTHOR = gql`
  mutation CreateAuthor($name: String!) {
    createAuthors(input: [{ name: $name }]) {
      authors {
        name
      }
    }
  }
`;

const DELETE_CATEGORY = gql`
  mutation DeleteCategory($name: String!) {
    deleteCategories(where: { name: $name }) {
      nodesDeleted
    }
  }
`;

const DELETE_FRAMEWORK = gql`
  mutation DeleteFramework($name: String!) {
    deleteFrameworks(where: { name: $name }) {
      nodesDeleted
    }
  }
`;

const DELETE_AUTHOR = gql`
  mutation DeleteAuthor($name: String!) {
    deleteAuthors(where: { name: $name }) {
      nodesDeleted
    }
  }
`;

const DELETE_LIBRARY = gql`
  mutation DeleteLibrary($name: String!) {
    deleteLibraries(where: { name: $name }) {
      nodesDeleted
    }
  }
`;

const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($oldName: String!, $newName: String!) {
    updateCategories(where: { name: $oldName }, update: { name: $newName }) {
      categories {
        name
      }
    }
  }
`;

const UPDATE_FRAMEWORK = gql`
  mutation UpdateFramework($oldName: String!, $newName: String!, $version: String!) {
    updateFrameworks(where: { name: $oldName }, update: { name: $newName, version: $version }) {
      frameworks {
        name
        version
      }
    }
  }
`;

const UPDATE_AUTHOR = gql`
  mutation UpdateAuthor($oldName: String!, $newName: String!) {
    updateAuthors(where: { name: $oldName }, update: { name: $newName }) {
      authors {
        name
      }
    }
  }
`;

const UPDATE_LIBRARY = gql`
  mutation UpdateLibrary($name: String!, $version: String, $description: String, $repository: String) {
    updateLibraries(
      where: { name: $name }
      update: { 
        version: $version
        description: $description
        repository: $repository
      }
    ) {
      libraries {
        name
        version
        description
        repository
      }
    }
  }
`;

export default function ManageNodes() {
  const { data, loading, refetch } = useQuery(GET_ALL_NODES);
  const [nodeType, setNodeType] = useState('category');
  const [operation, setOperation] = useState<'create' | 'edit' | 'delete'>('create');
  const [selectedNode, setSelectedNode] = useState('');
  const [formData, setFormData] = useState({ name: '', version: '', description: '', repository: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [createCategory] = useMutation(CREATE_CATEGORY, { refetchQueries: [{ query: GET_ALL_NODES }] });
  const [createFramework] = useMutation(CREATE_FRAMEWORK, { refetchQueries: [{ query: GET_ALL_NODES }] });
  const [createAuthor] = useMutation(CREATE_AUTHOR, { refetchQueries: [{ query: GET_ALL_NODES }] });
  const [deleteCategory] = useMutation(DELETE_CATEGORY, { refetchQueries: [{ query: GET_ALL_NODES }] });
  const [deleteFramework] = useMutation(DELETE_FRAMEWORK, { refetchQueries: [{ query: GET_ALL_NODES }] });
  const [deleteAuthor] = useMutation(DELETE_AUTHOR, { refetchQueries: [{ query: GET_ALL_NODES }] });
  const [deleteLibrary] = useMutation(DELETE_LIBRARY, { refetchQueries: [{ query: GET_ALL_NODES }] });
  const [updateCategory] = useMutation(UPDATE_CATEGORY, { refetchQueries: [{ query: GET_ALL_NODES }] });
  const [updateFramework] = useMutation(UPDATE_FRAMEWORK, { refetchQueries: [{ query: GET_ALL_NODES }] });
  const [updateAuthor] = useMutation(UPDATE_AUTHOR, { refetchQueries: [{ query: GET_ALL_NODES }] });
  const [updateLibrary] = useMutation(UPDATE_LIBRARY, { refetchQueries: [{ query: GET_ALL_NODES }] });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    try {
      if (operation === 'create') {
        switch (nodeType) {
          case 'category':
            await createCategory({ variables: { name: formData.name } });
            setSuccess(`Created category: ${formData.name}`);
            break;
          case 'framework':
            await createFramework({ variables: { name: formData.name, version: formData.version } });
            setSuccess(`Created framework: ${formData.name} v${formData.version}`);
            break;
          case 'author':
            await createAuthor({ variables: { name: formData.name } });
            setSuccess(`Created author: ${formData.name}`);
            break;
        }
      } else if (operation === 'edit') {
        switch (nodeType) {
          case 'category':
            await updateCategory({ variables: { oldName: selectedNode, newName: formData.name } });
            setSuccess(`Updated category: ${selectedNode} → ${formData.name}`);
            break;
          case 'framework':
            await updateFramework({ variables: { oldName: selectedNode, newName: formData.name, version: formData.version } });
            setSuccess(`Updated framework: ${formData.name} v${formData.version}`);
            break;
          case 'author':
            await updateAuthor({ variables: { oldName: selectedNode, newName: formData.name } });
            setSuccess(`Updated author: ${selectedNode} → ${formData.name}`);
            break;
          case 'library':
            await updateLibrary({ 
              variables: { 
                name: selectedNode, 
                version: formData.version,
                description: formData.description,
                repository: formData.repository
              } 
            });
            setSuccess(`Updated library: ${selectedNode}`);
            break;
        }
      } else if (operation === 'delete') {
        const confirmDelete = confirm(`Are you sure you want to delete ${nodeType} "${selectedNode}"? This will also remove all relationships.`);
        if (!confirmDelete) return;

        switch (nodeType) {
          case 'category':
            await deleteCategory({ variables: { name: selectedNode } });
            setSuccess(`Deleted category: ${selectedNode}`);
            break;
          case 'framework':
            await deleteFramework({ variables: { name: selectedNode } });
            setSuccess(`Deleted framework: ${selectedNode}`);
            break;
          case 'author':
            await deleteAuthor({ variables: { name: selectedNode } });
            setSuccess(`Deleted author: ${selectedNode}`);
            break;
          case 'library':
            await deleteLibrary({ variables: { name: selectedNode } });
            setSuccess(`Deleted library: ${selectedNode}`);
            break;
        }
      }

      setFormData({ name: '', version: '', description: '', repository: '' });
      setSelectedNode('');
      refetch();
    } catch (err: any) {
      setError(`Error: ${err.message}`);
      console.error('Error managing node:', err);
    }
  };

  const getNodesList = () => {
    if (!data) return [];
    switch (nodeType) {
      case 'category': return data.categories || [];
      case 'framework': return data.frameworks || [];
      case 'author': return data.authors || [];
      case 'library': return data.libraries || [];
      default: return [];
    }
  };

  const handleNodeSelect = (nodeName: string) => {
    setSelectedNode(nodeName);
    const nodesList = getNodesList();
    const node = nodesList.find((n: any) => n.name === nodeName);
    if (node) {
      setFormData({
        name: node.name || '',
        version: node.version || '',
        description: node.description || '',
        repository: node.repository || ''
      });
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
          <h1>Manage All Nodes</h1>
          <p>Create, Edit, and Delete nodes in the graph</p>
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
        <h1>Manage All Nodes</h1>
        <p>Create, Edit, and Delete nodes in the graph</p>
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
            <h2>Node Management</h2>
            
            <div className="form-group">
              <label htmlFor="operation">Operation *</label>
              <select
                id="operation"
                value={operation}
                onChange={(e) => {
                  setOperation(e.target.value as any);
                  setFormData({ name: '', version: '', description: '', repository: '' });
                  setSelectedNode('');
                }}
                required
              >
                <option value="create">Create New</option>
                <option value="edit">Edit Existing</option>
                <option value="delete">Delete</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="nodeType">Node Type *</label>
              <select
                id="nodeType"
                value={nodeType}
                onChange={(e) => {
                  setNodeType(e.target.value);
                  setFormData({ name: '', version: '', description: '', repository: '' });
                  setSelectedNode('');
                }}
                required
              >
                <option value="library">Library</option>
                <option value="category">Category</option>
                <option value="framework">Framework</option>
                <option value="author">Author</option>
              </select>
            </div>

            {(operation === 'edit' || operation === 'delete') && (
              <div className="form-group">
                <label htmlFor="selectedNode">Select {nodeType} *</label>
                <select
                  id="selectedNode"
                  value={selectedNode}
                  onChange={(e) => handleNodeSelect(e.target.value)}
                  required
                  disabled={loading}
                >
                  <option value="">-- Select --</option>
                  {getNodesList().map((node: any) => (
                    <option key={node.name} value={node.name}>
                      {node.name} {node.version && `(v${node.version})`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {operation !== 'delete' && (
              <>
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={operation === 'edit' && nodeType === 'library'}
                    placeholder={`Enter ${nodeType} name`}
                  />
                  {operation === 'edit' && nodeType === 'library' && (
                    <small className="help-text">Library name cannot be changed (it's the primary key)</small>
                  )}
                </div>

                {(nodeType === 'framework' || nodeType === 'library') && (
                  <div className="form-group">
                    <label htmlFor="version">Version {nodeType === 'framework' ? '*' : ''}</label>
                    <input
                      id="version"
                      type="text"
                      value={formData.version}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                      required={nodeType === 'framework'}
                      placeholder="e.g., 8.0, 7.0.0"
                    />
                  </div>
                )}

                {nodeType === 'library' && (
                  <>
                    <div className="form-group">
                      <label htmlFor="description">Description</label>
                      <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Brief description of the library"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="repository">Repository URL</label>
                      <input
                        id="repository"
                        type="url"
                        value={formData.repository}
                        onChange={(e) => setFormData({ ...formData, repository: e.target.value })}
                        placeholder="https://github.com/..."
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <button 
              type="submit" 
              disabled={loading} 
              className="submit-button"
              style={{
                background: operation === 'delete' ? '#f44336' : undefined
              }}
            >
              {loading ? 'Loading...' : 
                operation === 'create' ? 'Create' :
                operation === 'edit' ? 'Update' :
                'Delete'}
            </button>
          </form>

          <div className="info-panel">
            <h3>Current Stats</h3>
            {!loading && data && (
              <ul>
                <li><strong>Libraries:</strong> {data.libraries?.length || 0}</li>
                <li><strong>Categories:</strong> {data.categories?.length || 0}</li>
                <li><strong>Frameworks:</strong> {data.frameworks?.length || 0}</li>
                <li><strong>Authors:</strong> {data.authors?.length || 0}</li>
              </ul>
            )}
            
            <h3 style={{ marginTop: '2rem' }}>Operations Guide</h3>
            <ul>
              <li><strong>Create:</strong> Add new nodes to the graph</li>
              <li><strong>Edit:</strong> Modify existing node properties</li>
              <li><strong>Delete:</strong> Remove nodes and their relationships</li>
            </ul>
            
            <div className="tip">
              <strong>Warning:</strong> Deleting a node will also remove all its relationships!
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
