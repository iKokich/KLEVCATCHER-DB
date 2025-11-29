// src/pages/dashboard/SearchView.js
import { useState } from 'react';
import apiUrl from '../../apiClient';
import { Link } from 'react-router-dom';

function Row({ children }) { return <div style={{ padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>{children}</div>; }

function SearchView() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  // поисковая вкладка больше не управляет IOC

  const search = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl(`/api/search?q=${encodeURIComponent(q)}`));
      const json = await res.json();
      setResults(json);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="panel-card">
      <h2>Поиск</h2>
      <div className="search-bar">
        <input value={q} onChange={e=>setQ(e.target.value)} type="search" placeholder="Поиск по отчетам, правилам, угрозам..." />
        <button className="button-28" onClick={search} disabled={loading}>{loading ? 'Поиск...' : 'Найти'}</button>
      </div>
      {/* Без формы IOC. Выводим результаты для Malware и Reports */}
      {!results && <div className="search-results-placeholder">Результаты появятся здесь</div>}
      {results && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <div>
            <h3>Malware</h3>
            {(results.malware || []).map(m => (
              <Row key={`m-${m.id}`}>
                <Link to={`/dashboard/malware/${m.id}`}>{m.name}</Link>
              </Row>
            ))}
          </div>
          <div>
            <h3>APT группы</h3>
            {(results.apt_groups || []).map(a => <Row key={`a-${a.id}`}>{a.name}</Row>)}
          </div>
          <div>
            <h3>IOCs</h3>
            {(results.iocs || []).map(i => <Row key={`i-${i.id}`}>{i.type}: {i.value}</Row>)}
          </div>
          <div>
            <h3>Отчеты</h3>
            {(results.reports || []).map(r => (
              <Row key={`r-${r.id}`}>
                <Link to={`/dashboard/reports/${r.id}`}>{r.title}</Link>
              </Row>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchView;

