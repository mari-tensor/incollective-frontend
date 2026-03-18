import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { documents } from '../api';

export default function DocumentList() {
  const [docs, setDocs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { user, logout, canEdit } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    documents.list(search).then(setDocs).catch(console.error).finally(() => setLoading(false));
  }, [search]);

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await documents.delete(id);
      setDocs((d) => d.filter((x) => x.id !== id));
    } catch (e) {
      alert(e.response?.data?.detail || 'Delete failed');
    }
  };

  const handleDownload = async (id, title, fileType) => {
    try {
      const blob = await documents.download(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title || 'document'}.${fileType}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e.response?.data?.detail || 'Download failed');
    }
  };

  const handleExport = async (id, title) => {
    try {
      const blob = await documents.export(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title || 'document'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      const msg = e.response?.status === 501
        ? 'PDF export requires OnlyOffice. File downloaded as original instead.'
        : (e.response?.data?.detail || 'Export failed');
      alert(msg);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>Documents</h1>
        <div className="user">
          <span>{user?.username} ({user?.role})</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>
      <main>
        <div className="toolbar">
          <input
            type="search"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {canEdit && (
            <Link to="/create" className="btn">+ New Document</Link>
          )}
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="doc-list">
              <table className="doc-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map((d) => (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 500 }}>{d.title}</td>
                      <td>
                        <span className={`file-type file-type-${d.file_type}`}>{d.file_type}</span>
                      </td>
                      <td>{new Date(d.created_at).toLocaleDateString()}</td>
                      <td className="actions-cell">
                        <Link to={`/documents/${d.id}?mode=view`}>View</Link>
                        {canEdit && (
                          <>
                            <Link to={`/documents/${d.id}?mode=edit`}>Edit</Link>
                            <button className="link link-danger" onClick={() => handleDelete(d.id, d.title)}>Delete</button>
                          </>
                        )}
                        <button className="link" onClick={() => handleDownload(d.id, d.title, d.file_type)}>Download</button>
                        <button className="link" onClick={() => handleExport(d.id, d.title)}>Export</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="doc-cards">
              {docs.map((d) => (
                <div key={d.id} className="doc-card">
                  <div className="doc-card-title">{d.title}</div>
                  <div className="doc-card-meta">{d.file_type} · {new Date(d.created_at).toLocaleDateString()}</div>
                  <div className="doc-card-actions">
                    <Link to={`/documents/${d.id}?mode=view`}>View</Link>
                    {canEdit && (
                      <>
                        <Link to={`/documents/${d.id}?mode=edit`}>Edit</Link>
                        <button className="link link-danger" onClick={() => handleDelete(d.id, d.title)}>Delete</button>
                      </>
                    )}
                    <button className="link" onClick={() => handleDownload(d.id, d.title, d.file_type)}>Download</button>
                    <button className="link" onClick={() => handleExport(d.id, d.title)}>Export</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {!loading && docs.length === 0 && <p className="empty">No documents</p>}
      </main>
    </div>
  );
}
