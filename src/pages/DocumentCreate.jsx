import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { documents } from '../api';

export default function DocumentCreate() {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Select a file');
      return;
    }
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['docx', 'xlsx'].includes(ext)) {
      setError('Only .docx and .xlsx allowed');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title || file.name.replace(/\.[^/.]+$/, ''));
      formData.append('file', file);
      const doc = await documents.create(formData);
      navigate(`/documents/${doc.id}?mode=edit`);
    } catch (err) {
      setError(err.response?.data?.file?.[0] || err.response?.data?.detail || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header>
        <h1><a href="/">Documents</a> / New</h1>
      </header>
      <main>
        <form className="create-form" onSubmit={handleSubmit}>
          <label>
            Title
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document title"
            />
          </label>
          <label>
            File (.docx or .xlsx)
            <input
              type="file"
              accept=".docx,.xlsx"
              onChange={(e) => setFile(e.target.files[0])}
              required
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>{loading ? 'Uploading...' : 'Create'}</button>
        </form>
      </main>
    </div>
  );
}
