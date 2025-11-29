// src/pages/dashboard/ReportDetailView.js
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiUrl from '../../apiClient';

function ReportDetailView() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(apiUrl(`/api/reports/${id}`)).then(r=>r.json()).then(setData).catch(()=>{});
  }, [id]);

  if (!data) return <div className="panel-card">Загрузка...</div>;

  return (
    <div className="panel-card">
      <h2>{data.title}</h2>
      {data.author && <div>Автор: {data.author}</div>}
      {data.publication_date && <div>Дата публикации: {data.publication_date}</div>}
      {data.source_url && <div>Источник: <a href={data.source_url} target="_blank" rel="noreferrer">{data.source_url}</a></div>}
      {data.summary && <p style={{ marginTop: 12 }}>{data.summary}</p>}
      {data.full_text && <pre style={{ whiteSpace: 'pre-wrap' }}>{data.full_text}</pre>}

      {Array.isArray(data.malware_tags) && data.malware_tags.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Теги (Malware):</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {data.malware_tags.map((name, idx) => (
              <Link key={idx} to={`/dashboard/search?q=${encodeURIComponent(name)}`} className="btn-secondary" style={{ textDecoration: 'none' }}>{name}</Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportDetailView;

