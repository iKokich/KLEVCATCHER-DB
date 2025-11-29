// src/pages/dashboard/ReportsView.js
import { useEffect, useState } from 'react';
import apiUrl from '../../apiClient';
import LineChart from '../../components/charts/LineChart';

function ReportsView() {
  const [labels, setLabels] = useState([]);
  const [datasets, setDatasets] = useState(null);

  useEffect(() => {
    fetch(apiUrl('/api/stats/overview'))
      .then(res => res.json())
      .then(json => {
        setLabels(json.labels || []);
        const ds = json.datasets || {};
        setDatasets([
          { label: 'Malware', data: ds.malware || [], borderColor: '#474787', backgroundColor: 'rgba(71,71,135,0.5)' },
          { label: 'IOCs', data: ds.iocs || [], borderColor: '#9290C3', backgroundColor: 'rgba(146,144,195,0.5)' },
          { label: 'Reports', data: ds.reports || [], borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.4)' },
        ]);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="full-viewport-card">
      <LineChart labels={labels} datasets={datasets || undefined} title="Activity overview" />
    </div>
  );
}

export default ReportsView;

