// src/components/charts/DoughnutChart.js
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'right',
    },
    title: {
      display: true,
      text: 'Sessions by Country',
      font: {
        size: 16,
      }
    },
  },
};

export const data = {
  labels: ['USA', 'India', 'UK', 'Australia', 'Canada'],
  datasets: [
    {
      label: '# of Sessions',
      data: [12, 19, 3, 5, 2], // Пример данных
      backgroundColor: [
        '#474787', // deep purple-gray
        '#535C91', // (из темной палитры)
        '#9290C3', // (из темной палитры)
        '#AAABB8', // cool gray
        '#dcdcf2', // Очень светлый вариант
      ],
      borderColor: [
        '#FFFFFF',
        '#FFFFFF',
        '#FFFFFF',
        '#FFFFFF',
        '#FFFFFF',
      ],
      borderWidth: 3,
    },
  ],
};

function DoughnutChart() {
  return <Doughnut options={options} data={data} />;
}

export default DoughnutChart;