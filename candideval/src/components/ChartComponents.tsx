import React from 'react';
import { Bar, Pie, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
);

interface BarChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
    }[];
  };
  title: string;
}

export const BarChart: React.FC<BarChartProps> = ({ data, title }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
  };
  return <Bar options={options} data={data} />;
};

interface PieChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
      borderColor: string[];
      borderWidth: number;
    }[];
  };
  title: string;
}

export const PieChart: React.FC<PieChartProps> = ({ data, title }) => {
    const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
  };
  return <Pie data={data} options={options} />;
};

interface RadarChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: (number | null)[];
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
    }[];
  };
  title: string;
}

export const RadarChart: React.FC<RadarChartProps> = ({ data, title }) => {
    const options = {
    responsive: true,
    scales: {
      r: {
        suggestedMin: 0,
        suggestedMax: 10,
      },
    },
    plugins: {
      title: {
        display: true,
        text: title,
      },
    },
  };
  return <Radar data={data} options={options} />;
};