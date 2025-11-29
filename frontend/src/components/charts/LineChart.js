// src/components/charts/LineChart.js
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { faker } from '@faker-js/faker';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'top' }, title: { display: true, text: 'Sessions Overview' } },
};

const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const data = {
  labels,
  datasets: [
    {
      label: 'Organic',
      // ИСПРАВЛЕНИЕ: Заменяем faker.datatype.number на faker.number.int
      data: labels.map(() => faker.number.int({ min: 500, max: 1000 })),
      borderColor: '#474787',
      backgroundColor: 'rgba(71, 71, 135, 0.5)',
    },
    {
      label: 'Referral',
      // ИСПРАВЛЕНИЕ: Заменяем faker.datatype.number на faker.number.int
      data: labels.map(() => faker.number.int({ min: 200, max: 800 })),
      borderColor: '#9290C3',
      backgroundColor: 'rgba(146, 144, 195, 0.5)',
    },
  ],
};

function LineChart({ labels: customLabels, datasets: customDatasets, title }) {
  const chartData = customDatasets && customLabels ? {
    labels: customLabels,
    datasets: customDatasets,
  } : data;
  const chartOptions = {
    ...options,
    plugins: { ...options.plugins, title: { ...options.plugins.title, text: title || options.plugins.title.text } }
  };
  return <Line options={chartOptions} data={chartData} />;
}
export default LineChart;