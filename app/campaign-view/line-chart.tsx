"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LineChartProps {
  title: string;
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      tension?: number;
      fill?: boolean;
    }[];
  };
  formatValue?: (value: number) => string;
}

export function LineChart({ title, data, formatValue }: LineChartProps) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#D1D5DB", // text-gray-300
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              const value = context.parsed.y;
              label += formatValue
                ? formatValue(value)
                : value.toLocaleString();
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#9CA3AF", // text-gray-400
          maxRotation: 45,
          minRotation: 45,
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      y: {
        ticks: {
          color: "#9CA3AF", // text-gray-400
          callback: function (value: string | number) {
            return formatValue
              ? formatValue(Number(value))
              : Number(value).toLocaleString();
          },
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
  };

  return (
    <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
      <h3 className="text-base sm:text-lg font-semibold text-white mb-4">
        {title}
      </h3>
      <div className="h-64 sm:h-80">
        <Line options={options} data={data} />
      </div>
    </div>
  );
}
