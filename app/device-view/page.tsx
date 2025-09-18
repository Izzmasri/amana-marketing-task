"use client";

import { useState, useEffect } from "react";
import { Navbar } from "../../src/components/ui/navbar";
import { CardMetric } from "../../src/components/ui/card-metric";
import { Footer } from "../../src/components/ui/footer";
import {
  Smartphone,
  Monitor,
  Tablet,
  DollarSign,
  TrendingUp,
  Users,
  PieChart,
  BarChart4,
  Table as TableIcon,
} from "lucide-react";
import { fetchMarketingData } from "../../src/lib/api";
import { MarketingData } from "../../src/types/marketing";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function DeviceView() {
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

  // Process data for device metrics
  const deviceMetrics = data.campaigns
    .flatMap((campaign) => campaign.device_performance || [])
    .reduce((acc, device) => {
      const deviceName = device.device;
      if (!acc[deviceName]) {
        acc[deviceName] = {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          spend: 0,
          revenue: 0,
          weightedCtr: 0,
          weightedConversionRate: 0,
        };
      }
      acc[deviceName].impressions += device.impressions;
      acc[deviceName].clicks += device.clicks;
      acc[deviceName].conversions += device.conversions;
      acc[deviceName].spend += device.spend;
      acc[deviceName].revenue += device.revenue;
      acc[deviceName].weightedCtr += device.ctr * device.impressions;
      acc[deviceName].weightedConversionRate +=
        device.conversion_rate * device.clicks;
      return acc;
    }, {} as Record<string, { impressions: number; clicks: number; conversions: number; spend: number; revenue: number; weightedCtr: number; weightedConversionRate: number }>);

  const devices = Object.keys(deviceMetrics).sort(
    (a, b) => deviceMetrics[b].revenue - deviceMetrics[a].revenue
  );

  const formatAsCurrency = (value: number) =>
    `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  // Prepare data for doughnut chart
  const revenueByDeviceData = {
    labels: devices,
    datasets: [
      {
        label: "Revenue",
        data: devices.map((device) => deviceMetrics[device].revenue),
        backgroundColor: [
          "rgba(59, 130, 246, 0.7)", // blue-500
          "rgba(16, 185, 129, 0.7)", // green-500
          "rgba(239, 68, 68, 0.7)", // red-500
        ],
        borderColor: "#1F2937", // gray-800
        borderWidth: 2,
      },
    ],
  };

  // Prepare data for bar chart
  const performanceByDeviceData = {
    labels: devices,
    datasets: [
      {
        label: "CTR (%)",
        data: devices.map(
          (device) =>
            deviceMetrics[device].weightedCtr /
            deviceMetrics[device].impressions
        ),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
      {
        label: "Conversion Rate (%)",
        data: devices.map(
          (device) =>
            deviceMetrics[device].weightedConversionRate /
            deviceMetrics[device].clicks
        ),
        backgroundColor: "rgba(153, 102, 255, 0.6)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: { color: "#D1D5DB" },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || "";
            if (label) label += ": ";
            if (context.parsed.y !== null) {
              label += `${context.parsed.y.toFixed(2)}%`;
            } else if (context.parsed !== null) {
              label += formatAsCurrency(context.parsed);
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#9CA3AF" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
      y: {
        ticks: { color: "#9CA3AF" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
    },
  };

  const doughnutOptions = { ...chartOptions, scales: {} };

  return (
    <div className="flex h-screen bg-gray-900">
      <Navbar />

      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-y-auto">
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-12">
          <div className="px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-5xl font-bold">
              Device Performance
            </h1>
            <p className="mt-4 text-lg text-gray-300">
              Comparing campaign effectiveness across Mobile, Desktop, and
              Tablet.
            </p>
          </div>
        </section>

        <div className="flex-1 p-4 lg:p-6">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {devices.map((device) => (
              <div
                key={device}
                className="bg-gray-800 rounded-lg p-6 shadow-lg"
              >
                <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
                  {device === "Mobile" && (
                    <Smartphone className="mr-2 text-blue-400" />
                  )}
                  {device === "Desktop" && (
                    <Monitor className="mr-2 text-green-400" />
                  )}
                  {device === "Tablet" && (
                    <Tablet className="mr-2 text-red-400" />
                  )}
                  {device} Performance
                </h2>
                <div className="space-y-4">
                  <CardMetric
                    title="Total Spend"
                    value={formatAsCurrency(deviceMetrics[device].spend)}
                    icon={<DollarSign />}
                  />
                  <CardMetric
                    title="Total Revenue"
                    value={formatAsCurrency(deviceMetrics[device].revenue)}
                    icon={<TrendingUp />}
                  />
                  <CardMetric
                    title="Total Conversions"
                    value={deviceMetrics[device].conversions.toLocaleString()}
                    icon={<Users />}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-white">
                <PieChart className="inline-block mr-2" /> Revenue by Device
              </h2>
              <div className="h-80">
                <Doughnut
                  options={doughnutOptions}
                  data={revenueByDeviceData}
                />
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-white">
                <BarChart4 className="inline-block mr-2" /> Performance Metrics
                by Device
              </h2>
              <div className="h-80">
                <Bar options={chartOptions} data={performanceByDeviceData} />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-white">
              <TableIcon className="inline-block mr-2" /> Detailed Device
              Comparison
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Device
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Spend
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Impressions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Clicks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Conversions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      CTR
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Conv. Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {devices.map((device) => {
                    const metrics = deviceMetrics[device];
                    const ctr = metrics.impressions
                      ? metrics.weightedCtr / metrics.impressions
                      : 0;
                    const convRate = metrics.clicks
                      ? metrics.weightedConversionRate / metrics.clicks
                      : 0;
                    return (
                      <tr key={device} className="hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                          {device}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">
                          {formatAsCurrency(metrics.revenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {formatAsCurrency(metrics.spend)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {metrics.impressions.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {metrics.clicks.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {metrics.conversions.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {ctr.toFixed(2)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {convRate.toFixed(2)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
