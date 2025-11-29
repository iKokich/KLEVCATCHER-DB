// src/pages/dashboard/CheckView.js
import { useEffect, useMemo, useState } from 'react';
import apiUrl from '../../apiClient';
import MultiStepLoader from '../../components/ui/MultiStepLoader';

const HISTORY_KEY = 'vt_scan_history';

const scanningStates = [
  { text: "Подключение к VirusTotal API..." },
  { text: "Отправка индикатора на анализ..." },
  { text: "Сканирование антивирусными движками..." },
  { text: "Проверка репутации..." },
  { text: "Анализ поведения..." },
  { text: "Сбор результатов от движков..." },
  { text: "Формирование отчёта..." },
  { text: "Завершение анализа..." },
];

function CheckView() {
  const [indicator, setIndicator] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 6)));
  }, [history]);

  const lastAnalysisDate = useMemo(() => {
    if (!scanResult?.last_analysis_date) return null;
    return new Date(scanResult.last_analysis_date).toLocaleString();
  }, [scanResult]);

  const handleScan = async (e) => {
    e.preventDefault();
    setError('');
    setScanResult(null);
    if (!indicator.trim()) {
      setError('Введите hash, URL или IP для проверки');
      return;
    }

    try {
      setLoading(true);
      setShowLoader(true);
      const res = await fetch(apiUrl('/api/virustotal/scan'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ indicator: indicator.trim() }),
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.message || payload.error || 'Ошибка запроса');
      }
      if (!payload.data) {
        setError(payload.message || 'Совпадения не найдены');
        return;
      }
      setScanResult(payload.data);
      setHistory((prev) => {
        const next = [
          {
            indicator: payload.data.indicator,
            detection_ratio: payload.data.detection_ratio,
            checked_at: new Date().toISOString(),
          },
          ...prev.filter((item) => item.indicator !== payload.data.indicator),
        ];
        return next.slice(0, 6);
      });
    } catch (err) {
      setError(err.message || 'Не удалось выполнить сканирование');
    } finally {
      setLoading(false);
      setShowLoader(false);
    }
  };

  return (
    <div className="panel-card vt-panel">
      <div className="vt-header">
        <div>
          <p className="eyebrow">VirusTotal Scanner</p>
          <h2>Анализ hash / URL / IP</h2>
          <p className="muted">
            Укажите IOC, и мы проксируем запрос в VirusTotal, не раскрывая ваш API ключ.
          </p>
        </div>
        <div className="vt-badge">Live lookup</div>
      </div>

      <form className="vt-form" onSubmit={handleScan}>
        <label className="vt-label">
          Индикатор компрометации
          <input
            type="text"
            placeholder="Например, d41d8cd98f00b204e9800998ecf8427e или https://example.com"
            value={indicator}
            onChange={(e) => setIndicator(e.target.value)}
          />
        </label>
        <div className="form-actions">
          <button className="button-28" type="submit" disabled={loading}>
            {loading ? 'Сканируем...' : 'Сканировать'}
          </button>
        </div>
      </form>

      {/* Multi-Step Loader */}
      <MultiStepLoader 
        loading={showLoader} 
        loadingStates={scanningStates}
        duration={1200}
      />

      {error && <div className="vt-error">{error}</div>}

      {scanResult && (
        <div className="vt-result-card">
          <div className="vt-score">
            <p>Detection ratio</p>
            <strong>{scanResult.detection_ratio}</strong>
          </div>
          <div className="vt-meta">
            <div>
              <p className="label">Тип</p>
              <p className="value">{scanResult.type || '—'}</p>
            </div>
            <div>
              <p className="label">Анализ</p>
              <p className="value">{lastAnalysisDate || '—'}</p>
            </div>
            <div>
              <p className="label">Репутация</p>
              <p className="value">{scanResult.reputation ?? '—'}</p>
            </div>
          </div>
          {scanResult.engines?.length > 0 && (
            <div className="vt-engines">
              <p className="label">Топ движков</p>
              <div className="vt-engine-list">
                {scanResult.engines.map((engine) => (
                  <div key={engine.engine} className="vt-engine-chip">
                    <span>{engine.engine}</span>
                    <strong>{engine.result}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
          {scanResult.permalink && (
            <a
              className="vt-link"
              href={scanResult.permalink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Открыть детальный отчёт на VirusTotal
            </a>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div className="vt-history">
          <div className="vt-history-head">
            <h3>Недавние проверки</h3>
            <p className="muted">Сохраняем локально только для вас</p>
          </div>
          <div className="vt-history-grid">
            {history.map((item) => (
              <button
                key={item.indicator}
                className="vt-history-item"
                onClick={() => {
                  setIndicator(item.indicator);
                  setScanResult(null);
                  setError('');
                }}
                type="button"
              >
                <span>{item.indicator}</span>
                <small>{item.detection_ratio}</small>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CheckView;
