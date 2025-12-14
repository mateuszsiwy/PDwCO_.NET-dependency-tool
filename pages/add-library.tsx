import { useState } from 'react';
import Link from 'next/link';
import { useMutation } from '@apollo/client';
import { CREATE_LIBRARY, GET_LIBRARIES } from '@/lib/graphql/queries';

export default function AddLibrary() {
  const [formData, setFormData] = useState({
    name: '',
    version: '',
    description: '',
    repository: '',
  });

  const [createLibrary, { loading, error }] = useMutation(CREATE_LIBRARY, {
    refetchQueries: [{ query: GET_LIBRARIES }],
  });

  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    try {
      await createLibrary({
        variables: formData,
      });
      setSuccess(true);
      setFormData({ name: '', version: '', description: '', repository: '' });
    } catch (err) {
      console.error('Error creating library:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="container">
      <header className="header">
        <h1>➕ Add New Library</h1>
      </header>

      <nav className="nav">
        <Link href="/">Graph</Link>
        <Link href="/libraries">All Libraries</Link>
        <Link href="/add-library">Add Library</Link>
        <Link href="/manage-relationships">Manage Relationships</Link>
        <Link href="/manage-nodes">Manage Nodes</Link>
      </nav>

      <main className="main">
        <div className="form-container">
          <form onSubmit={handleSubmit} className="library-form">
            <div className="form-group">
              <label htmlFor="name">Library Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Newtonsoft.Json"
              />
            </div>

            <div className="form-group">
              <label htmlFor="version">Version *</label>
              <input
                type="text"
                id="version"
                name="version"
                value={formData.version}
                onChange={handleChange}
                required
                placeholder="e.g., 13.0.3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Brief description of the library..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="repository">Repository URL</label>
              <input
                type="url"
                id="repository"
                name="repository"
                value={formData.repository}
                onChange={handleChange}
                placeholder="https://github.com/..."
              />
            </div>

            {error && (
              <div className="error-message">
                Error: {error.message}
              </div>
            )}

            {success && (
              <div className="success-message">
                Library created successfully!
              </div>
            )}

            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Creating...' : 'Create Library'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
