// src/components/charts/LineChart.js
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { faker } from '@faker-js/faker';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export const options = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: { 
    legend: { 
      position: 'top',
      labels: {
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 20,
        color: '#a1a1aa',
        font: { size: 12 }
      }
    }, 
    title: { 
      display: true, 
      text: 'Sessions Overview',
      color: '#fafafa',
      font: { size: 16, weight: '600' },
      padding: { bottom: 20 }
    } 
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(161, 161, 170, 0.1)',
        drawBorder: false,
      },
      ticks: {
        color: '#71717a',
        font: { size: 11 }
      }
    },
    y: {
      grid: {
        color: 'rgba(161, 161, 170, 0.1)',
        drawBorder: false,
      },
      ticks: {
        color: '#71717a',
        font: { size: 11 }
      }
    }
  },
  elements: {
    line: {
      tension: 0.4, // Плавные кривые
      borderWidth: 2,
    },
    point: {
      radius: 0, // Скрыть точки
      hoverRadius: 4,
      hoverBackgroundColor: '#fff',
    }
  }
};

const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const data = {
  labels,
  datasets: [
    {
      label: 'Organic',
      data: labels.map(() => faker.number.int({ min: 500, max: 1000 })),
      borderColor: '#a1a1aa',
      backgroundColor: 'rgba(161, 161, 170, 0.15)',
      fill: true,
      tension: 0.4,
    },
    {
      label: 'Referral',
      data: labels.map(() => faker.number.int({ min: 200, max: 800 })),
      borderColor: '#52525b',
      backgroundColor: 'rgba(82, 82, 91, 0.2)',
      fill: true,
      tension: 0.4,
    },
  ],
};

function LineChart({ labels: customLabels, datasets: customDatasets, title }) {
  // Применяем стили к кастомным датасетам
  const styledDatasets = customDatasets?.map((ds, index) => ({
    ...ds,
    fill: true,
    tension: 0.4,
    borderWidth: 2,
    pointRadius: 0,
    pointHoverRadius: 4,
    borderColor: index === 0 ? '#71717a' : index === 1 ? '#a1a1aa' : '#52525b',
    backgroundColor: index === 0 
      ? 'rgba(113, 113, 122, 0.2)' 
      : index === 1 
        ? 'rgba(161, 161, 170, 0.15)' 
        : 'rgba(82, 82, 91, 0.25)',
  }));

  const chartData = styledDatasets && customLabels ? {
    labels: customLabels,
    datasets: styledDatasets,
  } : data;
  
  const chartOptions = {
    ...options,
    plugins: { ...options.plugins, title: { ...options.plugins.title, text: title || options.plugins.title.text } }
  };
  return <Line options={chartOptions} data={chartData} />;
}
export default LineChart;