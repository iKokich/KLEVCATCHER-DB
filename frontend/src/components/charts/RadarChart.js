// src/components/charts/RadarChart.js
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { faker } from '@faker-js/faker';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Traffic Sources by Day',
      font: {
        size: 16,
      }
    },
  },
};

const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const data = {
  labels,
  datasets: [
    {
      label: 'Direct',
      // ИСПРАВЛЕНИЕ: Заменяем faker.datatype.number на faker.number.int
      data: labels.map(() => faker.number.int({ min: 0, max: 1000 })),
      backgroundColor: 'rgba(71, 71, 135, 0.4)', // #474787
      borderColor: '#474787',
      borderWidth: 2,
    },
    {
      label: 'Organic Search',
      // ИСПРАВЛЕНИЕ: Заменяем faker.datatype.number на faker.number.int
      data: labels.map(() => faker.number.int({ min: 0, max: 1000 })),
      backgroundColor: 'rgba(146, 144, 195, 0.4)', // #9290C3
      borderColor: '#9290C3',
      borderWidth: 2,
    },
  ],
};

function RadarChart() {
  return <Radar options={options} data={data} />;
}

export default RadarChart;