import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { documents } from '../api';

export default function DocumentView() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'view';
  const [config, setConfig] = useState(null);
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState('');
  const containerRef = useRef(null);
  const { canEdit } = useAuth();

  useEffect(() => {
    documents.get(id).then(setDoc).catch((e) => setError(e.message));
  }, [id]);

  useEffect(() => {
    if (!doc) return;
    const isEdit = mode === 'edit' && canEdit;
    const fn = isEdit ? documents.editorConfig : documents.viewConfig;
    fn(id)
      .then(setConfig)
      .catch((e) => setError(e.response?.data?.detail || e.message));
  }, [doc, id, mode, canEdit]);

  useEffect(() => {
    if (!config || !containerRef.current) return;
    const script = document.createElement('script');
    script.src = config.api_url;
    script.onload = () => {
      if (window.DocsAPI && containerRef.current) {
        new window.DocsAPI.DocEditor(containerRef.current.id, config.config);
      }
    };
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [config]);

  if (error) return <div className="app"><p className="error">{error}</p><Link to="/">Back</Link></div>;
  if (!doc) return <div className="app"><p>Loading...</p></div>;

  return (
    <div className="app">
      <header>
        <h1>
          <Link to="/">Documents</Link> / {doc.title}
          {mode === 'edit' && canEdit && (
            <>
              {' '}
              <Link to={`/documents/${id}?mode=view`} className="btn-sm">View only</Link>
            </>
          )}
          {mode === 'view' && canEdit && (
            <>
              {' '}
              <Link to={`/documents/${id}?mode=edit`} className="btn-sm">Edit</Link>
            </>
          )}
        </h1>
      </header>
      <main className="editor-main">
        {config ? (
          <div id="onlyoffice-editor" ref={containerRef} style={{ height: 'calc(100vh - 120px)' }} />
        ) : (
          <p>Loading editor...</p>
        )}
      </main>
    </div>
  );
}
