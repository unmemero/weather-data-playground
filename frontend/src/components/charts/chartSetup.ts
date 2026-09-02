import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Global Dark Mode Theme Configuration
ChartJS.defaults.color = '#94a3b8';
ChartJS.defaults.font.family = 'Inter, system-ui, sans-serif';
ChartJS.defaults.font.size = 11;
ChartJS.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 23, 42, 0.95)';
ChartJS.defaults.plugins.tooltip.borderColor = 'rgba(51, 65, 85, 0.8)';
ChartJS.defaults.plugins.tooltip.borderWidth = 1;
ChartJS.defaults.plugins.tooltip.titleColor = '#f8fafc';
ChartJS.defaults.plugins.tooltip.bodyColor = '#cbd5e1';
ChartJS.defaults.plugins.tooltip.padding = 10;
ChartJS.defaults.plugins.tooltip.cornerRadius = 8;
