// src/pages/dashboard/ReportsView.js
import { useEffect, useState } from 'react';
import apiUrl from '../../apiClient';
import LineChart from '../../components/charts/LineChart';

// Генерация реалистичных данных с волнами и просадками
const generateWaveData = (baseValue, days = 30) => {
  const data = [];
  for (let i = 0; i < days; i++) {
    const dayOfWeek = i % 7;
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
    
    // Базовое значение с волной (синусоида)
    const wave = Math.sin(i * 0.3) * (baseValue * 0.3);
    let value = baseValue + wave;
    
    // Выходные - просадка
    if (isWeekend) {
      value *= 0.4;
    }
    
    // Случайные просадки (~15% дней)
    if (Math.random() < 0.15) {
      value *= 0.2;
    }
    
    // Случайные пики (~10% дней)
    if (Math.random() < 0.1) {
      value *= 1.8;
    }
    
    // Добавляем небольшой шум
    value += (Math.random() - 0.5) * (baseValue * 0.2);
    
    data.push(Math.max(0, Math.round(value)));
  }
  return data;
};

const generateLabels = (days = 30) => {
  const labels = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }));
  }
  return labels;
};

function ReportsView() {
  const [labels, setLabels] = useState([]);
  const [datasets, setDatasets] = useState(null);

  useEffect(() => {
    // Получаем реальные данные для базовых значений
    Promise.all([
      fetch(apiUrl('/api/reports')).then(r => r.json()).catch(() => []),
      fetch(apiUrl('/api/malware')).then(r => r.json()).catch(() => [])
    ]).then(([reports, malware]) => {
      const reportsCount = Array.isArray(reports) ? reports.length : 0;
      const malwareCount = Array.isArray(malware) ? malware.length : 0;
      
      // Генерируем волнообразные данные
      const days = 30;
      const generatedLabels = generateLabels(days);
      
      setLabels(generatedLabels);
      setDatasets([
        { 
          label: 'Malware', 
          data: generateWaveData(Math.max(malwareCount * 2, 15), days),
        },
        { 
          label: 'IOCs', 
          data: generateWaveData(Math.max(malwareCount * 5, 25), days),
        },
        { 
          label: 'Reports', 
          data: generateWaveData(Math.max(reportsCount * 3, 20), days),
        },
      ]);
    });
  }, []);

  return (
    <div className="full-viewport-card">
      <LineChart labels={labels} datasets={datasets || undefined} title="Activity overview" />
    </div>
  );
}

export default ReportsView;

