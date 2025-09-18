"use client";

import { useState, useEffect } from "react";
import { Navbar } from "../../src/components/ui/navbar";
import { Footer } from "../../src/components/ui/footer";
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
import { fetchMarketingData } from "../../src/lib/api";
import { MarketingData } from "../../src/types/marketing";

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

export default function WeeklyView() {
  const [data, setData] = useState<MarketingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const marketingData = await fetchMarketingData();
        setData(marketingData);
      } catch (error) {
        console.error("Failed to fetch marketing data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-white">
          Loading...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-white">
          Failed to load data.
        </div>
      </div>
    );
  }

  // Aggregate weekly performance data from all campaigns
  const weeklyData = data.campaigns.reduce((acc, campaign) => {
    campaign.weekly_performance?.forEach((week) => {
      if (!acc[week.week_start]) {
        acc[week.week_start] = {
          revenue: 0,
          spend: 0,
          week_end: week.week_end,
        };
      }
      acc[week.week_start].revenue += week.revenue;
      acc[week.week_start].spend += week.spend;
    });
    return acc;
  }, {} as Record<string, { revenue: number; spend: number; week_end: string }>);

  // Sort by week start date to ensure chronological order
  const sortedWeeks = Object.entries(weeklyData).sort(
    ([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime()
  );

  const labels = sortedWeeks.map(([date]) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  );

  const revenueByWeekData = {
    labels,
    datasets: [
      {
        label: "Weekly Revenue",
        data: sortedWeeks.map(([, data]) => data.revenue),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const spendByWeekData = {
    labels,
    datasets: [
      {
        label: "Weekly Spend",
        data: sortedWeeks.map(([, data]) => data.spend),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const formatAsCurrency = (value: number) =>
    `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  const lineChartOptions = {
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
              label += formatAsCurrency(value);
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
            return formatAsCurrency(Number(value));
          },
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
  };

  return (
    <div className="flex h-screen bg-gray-900">
      <Navbar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-y-auto">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-12">
          <div className="px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl md:text-5xl font-bold">Weekly View</h1>
              <p className="mt-4 text-lg text-gray-300">
                Track campaign performance on a week-by-week basis.
              </p>
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="grid grid-cols-1 gap-8">
            <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4">
                Weekly Revenue Over Time
              </h3>
              <div className="h-64 sm:h-80">
                <Line options={lineChartOptions} data={revenueByWeekData} />
              </div>
            </div>
            <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4">
                Weekly Spend Over Time
              </h3>
              <div className="h-64 sm:h-80">
                <Line options={lineChartOptions} data={spendByWeekData} />
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
