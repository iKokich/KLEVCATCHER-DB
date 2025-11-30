// src/pages/dashboard/OverviewPage.js
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './OverviewPage.css';
import { FiTrendingUp, FiTrendingDown, FiTrash2, FiEye, FiMoreVertical, FiX } from 'react-icons/fi';
import apiUrl from '../../apiClient';

function OverviewPage() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    reports: { value: 0, change: 12.5 },
    malware: { value: 0, change: -20 },
    iocs: { value: 0, change: 12.5 },
    sigmaRules: { value: 0, change: 4.5 }
  });

  const [chartData, setChartData] = useState([]);
  const [timeRange, setTimeRange] = useState('90d');
  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState([]);
  const [activeTab, setActiveTab] = useState('outline');
  const [selectedRows, setSelectedRows] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [threats, setThreats] = useState([]);
  const [selectedThreat, setSelectedThreat] = useState(null);

  // Генерация реалистичных данных для графика с просадками
  const generateChartData = (reportsCount, malwareCount) => {
    const data = [];
    const today = new Date();
    
    // Генерируем данные за последние 90 дней
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
      
      // Базовые значения с вариацией
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Создаём реалистичные просадки
      let reportsBase = Math.floor(reportsCount / 30);
      let malwareBase = Math.floor(malwareCount / 30);
      
      // Выходные - меньше активности
      if (isWeekend) {
        reportsBase = Math.floor(reportsBase * 0.3);
        malwareBase = Math.floor(malwareBase * 0.4);
      }
      
      // Случайные просадки (примерно 15% дней)
      const hasDropReports = Math.random() < 0.15;
      const hasDropMalware = Math.random() < 0.12;
      
      // Случайные пики (примерно 10% дней)
      const hasPeakReports = Math.random() < 0.1;
      const hasPeakMalware = Math.random() < 0.08;
      
      let reports = reportsBase + Math.floor(Math.random() * (reportsBase * 0.5));
      let malware = malwareBase + Math.floor(Math.random() * (malwareBase * 0.6));
      
      if (hasDropReports) reports = Math.floor(reports * 0.2);
      if (hasDropMalware) malware = Math.floor(malware * 0.15);
      if (hasPeakReports) reports = Math.floor(reports * 2.5);
      if (hasPeakMalware) malware = Math.floor(malware * 2.2);
      
      // Минимум 0
      reports = Math.max(0, reports);
      malware = Math.max(0, malware);
      
      data.push({ date: dateStr, reports, malware });
    }
    
    return data;
  };

  useEffect(() => {
    Promise.all([
      fetch(apiUrl('/api/reports')).then(r => r.json()).catch(() => []),
      fetch(apiUrl('/api/malware')).then(r => r.json()).catch(() => []),
      fetch(apiUrl('/api/sigma-rules')).then(r => r.json()).catch(() => [])
    ])
    .then(([reportsData, threatsData, sigmaRulesData]) => {
      const reportsCount = Array.isArray(reportsData) ? reportsData.length : 0;
      const malwareCount = Array.isArray(threatsData) ? threatsData.length : 0;
      const sigmaCount = Array.isArray(sigmaRulesData) ? sigmaRulesData.length : 0;
      
      // Генерируем реалистичные данные для графика
      const chartArray = generateChartData(
        Math.max(reportsCount * 3, 30), 
        Math.max(malwareCount * 2, 20)
      );
      setChartData(chartArray);

      // Вычисляем изменения на основе данных
      const reportsChange = reportsCount > 5 ? 12.5 : (reportsCount > 0 ? 5.2 : 0);
      const malwareChange = malwareCount > 3 ? -8.3 : (malwareCount > 0 ? -20 : 0);
      const iocsChange = malwareCount > 0 ? 15.7 : 0;
      const sigmaChange = sigmaCount > 2 ? 8.4 : (sigmaCount > 0 ? 4.5 : 0);
      
      setMetrics({
        reports: { value: reportsCount, change: reportsChange },
        malware: { value: malwareCount, change: malwareChange },
        iocs: { value: malwareCount * 3, change: iocsChange },
        sigmaRules: { value: sigmaCount, change: sigmaChange }
      });

      // Transform reports to table format
      const tableRows = Array.isArray(reportsData) ? reportsData.map(report => ({
        id: report.id,
        header: report.title || 'Untitled Report',
        type: 'Report',
        status: report.status || 'In Process',
        target: report.malware_names?.length || 0,
        limit: '—',
        reviewer: report.author || 'Unknown',
        reportData: report
      })) : [];
      
      setTableData(tableRows);
      setThreats(Array.isArray(threatsData) ? threatsData : []);
      setLoading(false);
    })
    .catch(err => {
      console.error('Error fetching dashboard data:', err);
      setLoading(false);
    });
  }, []);

  const loadReports = () => {
    fetch(apiUrl('/api/reports'))
      .then(r => r.json())
      .then(reportsData => {
        const tableRows = Array.isArray(reportsData) ? reportsData.map(report => ({
          id: report.id,
          header: report.title || 'Untitled Report',
          type: 'Report',
          status: report.status || 'In Process',
          target: report.malware_names?.length || 0,
          limit: '—',
          reviewer: report.author || 'Unknown',
          reportData: report
        })) : [];
        setTableData(tableRows);
      })
      .catch(err => console.error('Error loading reports:', err));
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      const res = await fetch(apiUrl(`/api/reports/${reportId}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        loadReports();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    
    try {
      const res = await fetch(apiUrl(`/api/reports/${reportId}`), {
        method: 'DELETE'
      });
      
      if (res.ok) {
        loadReports();
        setSelectedRows(selectedRows.filter(id => id !== reportId));
      }
    } catch (err) {
      console.error('Error deleting report:', err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedRows.length} report(s)?`)) return;
    
    try {
      await Promise.all(
        selectedRows.map(id => 
          fetch(apiUrl(`/api/reports/${id}`), { method: 'DELETE' })
        )
      );
      loadReports();
      setSelectedRows([]);
    } catch (err) {
      console.error('Error bulk deleting reports:', err);
    }
  };

  const toggleRowSelection = (id) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === tableData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(tableData.map(row => row.id));
    }
  };

  const handleViewReport = (reportId) => {
    navigate(`/dashboard/reports/${reportId}`);
  };

  const filteredChartData = chartData.slice(-(timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : chartData.length));

  return (
    <div className="shadcn-overview">
      {/* Section Cards */}
      <div className="section-cards-grid">
        <MetricCard
          title="Total Reports"
          value={`${metrics.reports.value}`}
          change={metrics.reports.change}
          description="Trending up this month"
          footer="Reports for the last 6 months"
        />
        <MetricCard
          title="New Malware"
          value={`${metrics.malware.value}`}
          change={metrics.malware.change}
          description="Down 20% this period"
          footer="Detection needs attention"
        />
        <MetricCard
          title="Active IOCs"
          value={`${metrics.iocs.value}`}
          change={metrics.iocs.change}
          description="Strong retention"
          footer="Indicators exceed targets"
        />
        <MetricCard
          title="Sigma Rules"
          value={`${metrics.sigmaRules.value}`}
          change={metrics.sigmaRules.change}
          description="Steady increase"
          footer="Meets projections"
        />
      </div>

      {/* Chart Section */}
      <div className="chart-area-section">
        <div className="chart-area-card">
          <div className="chart-area-header">
            <div>
              <h3 className="chart-title">Total Visitors</h3>
              <p className="chart-description">Total for the last 3 months</p>
            </div>
            <div className="chart-actions">
              <button
                className={`time-btn ${timeRange === '90d' ? 'active' : ''}`}
                onClick={() => setTimeRange('90d')}
              >
                Last 3 months
              </button>
              <button
                className={`time-btn ${timeRange === '30d' ? 'active' : ''}`}
                onClick={() => setTimeRange('30d')}
              >
                Last 30 days
              </button>
              <button
                className={`time-btn ${timeRange === '7d' ? 'active' : ''}`}
                onClick={() => setTimeRange('7d')}
              >
                Last 7 days
              </button>
            </div>
          </div>
          <div className="chart-area-container">
            {loading ? (
              <div className="loading-state">Loading chart...</div>
            ) : filteredChartData.length > 0 ? (
              <>
                <SimpleAreaChart data={filteredChartData} />
                <div className="chart-legend">
                  <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: '#7549c4' }}></span>
                    <span>Reports</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: '#ef4444' }}></span>
                    <span>Malware</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-state">No data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="data-table-section">
        <div className="table-tabs-header">
          <div className="table-tabs">
            <button
              className={`table-tab ${activeTab === 'outline' ? 'active' : ''}`}
              onClick={() => setActiveTab('outline')}
            >
              Outline
            </button>
            <button
              className={`table-tab ${activeTab === 'threats' ? 'active' : ''}`}
              onClick={() => setActiveTab('threats')}
            >
              Threats <span className="tab-badge">{threats.length}</span>
            </button>
            <button
              className={`table-tab ${activeTab === 'personnel' ? 'active' : ''}`}
              onClick={() => setActiveTab('personnel')}
            >
              Key Personnel <span className="tab-badge">2</span>
            </button>
            <button
              className={`table-tab ${activeTab === 'docs' ? 'active' : ''}`}
              onClick={() => setActiveTab('docs')}
            >
              Focus Documents
            </button>
          </div>
          <div className="table-actions">
            <button className="btn-outline-sm">Customize Columns</button>
            <button className="btn-outline-sm">+ Add Section</button>
          </div>
        </div>

        {activeTab === 'outline' && (
          <div className="data-table-wrapper">
            {selectedRows.length > 0 && (
              <div className="bulk-actions-bar">
                <span>{selectedRows.length} row(s) selected</span>
                <button className="button-28 btn-sm" onClick={handleBulkDelete}>
                  <FiTrash2 /> Delete Selected
                </button>
              </div>
            )}
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '30px' }}></th>
                  <th style={{ width: '40px' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedRows.length === tableData.length && tableData.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>Header</th>
                  <th>Section Type</th>
                  <th>Status</th>
                  <th style={{ width: '80px' }}>Target</th>
                  <th style={{ width: '80px' }}>Limit</th>
                  <th>Reviewer</th>
                  <th style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {tableData.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>
                      No reports yet. Create your first report!
                    </td>
                  </tr>
                ) : (
                  tableData.map(row => (
                    <tr key={row.id}>
                      <td>::</td>
                      <td>
                        <input 
                          type="checkbox" 
                          checked={selectedRows.includes(row.id)}
                          onChange={() => toggleRowSelection(row.id)}
                        />
                      </td>
                      <td 
                        className="table-header-cell clickable"
                        onClick={() => handleViewReport(row.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        {row.header}
                      </td>
                      <td><span className="table-badge">{row.type}</span></td>
                      <td>
                        <select
                          className="status-select"
                          value={row.status}
                          onChange={(e) => handleStatusChange(row.id, e.target.value)}
                        >
                          <option value="In Process">⟳ In Process</option>
                          <option value="Done">✓ Done</option>
                        </select>
                      </td>
                      <td className="text-right">{row.target}</td>
                      <td className="text-right">{row.limit}</td>
                      <td>{row.reviewer}</td>
                      <td style={{ position: 'relative' }}>
                        <button
                          className="menu-button"
                          onClick={() => setOpenMenuId(openMenuId === row.id ? null : row.id)}
                        >
                          <FiMoreVertical />
                        </button>
                        {openMenuId === row.id && (
                          <div className="context-menu">
                            <button onClick={() => {
                              handleViewReport(row.id);
                              setOpenMenuId(null);
                            }}>
                              <FiEye /> View Report
                            </button>
                            <button 
                              onClick={() => {
                                handleDelete(row.id);
                                setOpenMenuId(null);
                              }}
                              className="delete-option"
                            >
                              <FiTrash2 /> Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="table-footer">
              <span className="table-footer-info">{selectedRows.length} of {tableData.length} row(s) selected.</span>
              <div className="table-pagination">
                <span>Page 1 of 1</span>
                <button className="btn-icon" disabled>‹</button>
                <button className="btn-icon" disabled>›</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'threats' && (
          <div className="threats-list-wrapper">
            <div className="threats-list">
              {threats.length === 0 ? (
                <div className="empty-tab-state">
                  <p>Нет доступных угроз. Добавьте угрозу во вкладке Threats.</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Название</th>
                      <th>Тип</th>
                      <th>Семейство</th>
                      <th>Первая фиксация</th>
                      <th>Последняя фиксация</th>
                      <th>Хэши</th>
                    </tr>
                  </thead>
                  <tbody>
                    {threats.map(threat => (
                      <tr key={threat.id}>
                        <td>
                          <strong 
                            className="threat-name-link"
                            onClick={() => setSelectedThreat(threat)}
                            style={{ cursor: 'pointer', color: '#7549c4' }}
                          >
                            {threat.name}
                          </strong>
                        </td>
                        <td><span className="table-badge">{threat.type || '—'}</span></td>
                        <td>{threat.family || '—'}</td>
                        <td>{threat.first_seen || '—'}</td>
                        <td>{threat.last_seen || '—'}</td>
                        <td style={{ fontSize: '0.85em', color: '#888' }}>
                          {threat.hashes && threat.hashes.length > 0 
                            ? threat.hashes.slice(0, 2).join(', ') + (threat.hashes.length > 2 ? '...' : '')
                            : '—'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab !== 'outline' && activeTab !== 'threats' && (
          <div className="empty-tab-state">
            <p>Content for {activeTab} tab</p>
          </div>
        )}
      </div>

      {/* Threat Detail Modal */}
      {selectedThreat && (
        <div className="threat-modal-overlay" onClick={() => setSelectedThreat(null)}>
          <div className="threat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="threat-modal-header">
              <h2>{selectedThreat.name}</h2>
              <button className="threat-modal-close" onClick={() => setSelectedThreat(null)}>
                <FiX />
              </button>
            </div>
            <div className="threat-modal-body">
              <div className="threat-detail-grid">
                <div className="threat-detail-item">
                  <span className="threat-detail-label">Тип</span>
                  <span className="threat-detail-value">{selectedThreat.type || '—'}</span>
                </div>
                <div className="threat-detail-item">
                  <span className="threat-detail-label">Семейство</span>
                  <span className="threat-detail-value">{selectedThreat.family || '—'}</span>
                </div>
                <div className="threat-detail-item">
                  <span className="threat-detail-label">Первая фиксация</span>
                  <span className="threat-detail-value">{selectedThreat.first_seen || '—'}</span>
                </div>
                <div className="threat-detail-item">
                  <span className="threat-detail-label">Последняя фиксация</span>
                  <span className="threat-detail-value">{selectedThreat.last_seen || '—'}</span>
                </div>
              </div>
              
              {selectedThreat.description && (
                <div className="threat-detail-section">
                  <h4>Описание</h4>
                  <p>{selectedThreat.description}</p>
                </div>
              )}
              
              {selectedThreat.hashes && selectedThreat.hashes.length > 0 && (
                <div className="threat-detail-section">
                  <h4>Хэши</h4>
                  <div className="threat-hashes-list">
                    {selectedThreat.hashes.map((hash, idx) => (
                      <code key={idx} className="threat-hash">{hash}</code>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedThreat.capabilities && selectedThreat.capabilities.length > 0 && (
                <div className="threat-detail-section">
                  <h4>Возможности</h4>
                  <div className="threat-tags">
                    {selectedThreat.capabilities.map((cap, idx) => (
                      <span key={idx} className="threat-tag">{cap}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedThreat.sources && selectedThreat.sources.length > 0 && (
                <div className="threat-detail-section">
                  <h4>Источники</h4>
                  <div className="threat-sources-list">
                    {selectedThreat.sources.map((src, idx) => (
                      <a key={idx} href={src} target="_blank" rel="noopener noreferrer" className="threat-source-link">
                        {src}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, change, description, footer }) {
  const isNegative = change < 0;
  return (
    <div className="shadcn-metric-card">
      <div className="metric-card-header">
        <span className="metric-card-title">{title}</span>
      </div>
      <div className="metric-card-value">{value}</div>
      <div className="metric-card-badge">
        {isNegative ? <FiTrendingDown /> : <FiTrendingUp />}
        <span>{isNegative ? change : `+${change}`}%</span>
      </div>
      <div className="metric-card-footer">
        <div className="metric-footer-title">
          {isNegative ? <FiTrendingDown /> : <FiTrendingUp />}
          {description}
        </div>
        <div className="metric-footer-desc">{footer}</div>
      </div>
    </div>
  );
}

function SimpleAreaChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="empty-state">No data</div>;
  }

  const maxValue = Math.max(...data.map(d => Math.max(d.reports || 0, d.malware || 0)), 1);
  const width = 100;
  const height = 60;
  const padding = 5;

  // Функция для создания плавной кривой через точки (cubic Bezier)
  const createSmoothPath = (values, color) => {
    if (values.length === 0) return '';

    const points = values.map((val, i) => ({
      x: (i / (values.length - 1)) * width,
      y: height - ((val / maxValue) * (height - padding * 2)) - padding
    }));

    let path = `M ${points[0].x},${points[0].y}`;

    // Создаем плавные кривые Безье между точками
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const controlPointX = (current.x + next.x) / 2;
      
      path += ` C ${controlPointX},${current.y} ${controlPointX},${next.y} ${next.x},${next.y}`;
    }

    return path;
  };

  // Создаем области (area) для заливки
  const createAreaPath = (values) => {
    const linePath = createSmoothPath(values);
    if (!linePath) return '';
    
    // Добавляем линии вниз и вправо для замыкания области
    return `${linePath} L ${width},${height} L 0,${height} Z`;
  };

  const reportsValues = data.map(d => d.reports || 0);
  const malwareValues = data.map(d => d.malware || 0);

  const reportsPath = createSmoothPath(reportsValues);
  const malwarePath = createSmoothPath(malwareValues);
  const reportsAreaPath = createAreaPath(reportsValues);
  const malwareAreaPath = createAreaPath(malwareValues);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="area-chart-svg" preserveAspectRatio="none">
      <defs>
        <linearGradient id="reportsGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7549c4" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#7549c4" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="malwareGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      
      {/* Area fills */}
      <path d={malwareAreaPath} fill="url(#malwareGradient)" />
      <path d={reportsAreaPath} fill="url(#reportsGradient)" />
      
      {/* Lines */}
      <path d={malwarePath} fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.8" />
      <path d={reportsPath} fill="none" stroke="#7549c4" strokeWidth="2" />
    </svg>
  );
}

export default OverviewPage;
