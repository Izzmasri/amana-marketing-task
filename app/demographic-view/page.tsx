"use client";

import { useState, useEffect } from "react";
import { Navbar } from "../../src/components/ui/navbar";
import { CardMetric } from "../../src/components/ui/card-metric";
import { Footer } from "../../src/components/ui/footer";
import { Users, TrendingUp, BarChart4, Table as TableIcon } from "lucide-react";
import { fetchMarketingData } from "../../src/lib/api";
import { MarketingData } from "../../src/types/marketing";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function DemographicView() {
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

  // Process data for gender metrics
  const genderMetrics = data.campaigns.reduce((acc, campaign) => {
    campaign.demographic_breakdown?.forEach((demo) => {
      const gender = demo.gender.toLowerCase();
      if (!acc[gender]) {
        acc[gender] = { clicks: 0, spend: 0, revenue: 0, ageGroups: {} };
      }
      acc[gender].clicks += demo.performance?.clicks || 0;
      acc[gender].spend += campaign.spend * (demo.percentage_of_audience / 100);
      acc[gender].revenue +=
        campaign.revenue * (demo.percentage_of_audience / 100);

      // Group by age group
      if (demo.age_group) {
        if (!acc[gender].ageGroups[demo.age_group]) {
          acc[gender].ageGroups[demo.age_group] = {
            clicks: 0,
            spend: 0,
            revenue: 0,
            impressions: 0,
            conversions: 0,
          };
          acc[gender].ageGroups[demo.age_group].weightedCtr = 0;
          acc[gender].ageGroups[demo.age_group].weightedConversionRate = 0;
        }
        acc[gender].ageGroups[demo.age_group].clicks +=
          demo.performance?.clicks || 0;
        acc[gender].ageGroups[demo.age_group].spend +=
          campaign.spend * (demo.percentage_of_audience / 100);
        acc[gender].ageGroups[demo.age_group].revenue +=
          campaign.revenue * (demo.percentage_of_audience / 100);
        acc[gender].ageGroups[demo.age_group].impressions +=
          demo.performance?.impressions || 0;
        acc[gender].ageGroups[demo.age_group].conversions +=
          demo.performance?.conversions || 0;
        acc[gender].ageGroups[demo.age_group].weightedCtr +=
          (demo.performance?.ctr || 0) * (demo.performance?.impressions || 0);
        acc[gender].ageGroups[demo.age_group].weightedConversionRate +=
          (demo.performance?.conversion_rate || 0) *
          (demo.performance?.clicks || 0);
      }
    });
    return acc;
  }, {} as Record<string, { clicks: number; spend: number; revenue: number; ageGroups: any }>);

  // Prepare data for bar charts
  const ageGroups = Array.from(
    new Set(
      data.campaigns.flatMap(
        (camp) => camp.demographic_breakdown?.map((d) => d.age_group) || []
      )
    )
  )
    .filter(Boolean)
    .sort();

  const spendByAgeGroup = {
    labels: ageGroups,
    datasets: [
      {
        label: "Spend",
        data: ageGroups.map((ageGroup) =>
          Object.values(genderMetrics).reduce(
            (sum, gender) => sum + (gender.ageGroups[ageGroup]?.spend || 0),
            0
          )
        ),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  const revenueByAgeGroup = {
    labels: ageGroups,
    datasets: [
      {
        label: "Revenue",
        data: ageGroups.map((ageGroup) =>
          Object.values(genderMetrics).reduce(
            (sum, gender) => sum + (gender.ageGroups[ageGroup]?.revenue || 0),
            0
          )
        ),
        backgroundColor: "rgba(153, 102, 255, 0.6)",
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#D1D5DB", // text-gray-300
        },
      },
      title: {
        display: true,
        text: "",
        color: "#F9FAFB", // text-gray-50
      },
    },
    scales: {
      x: {
        ticks: { color: "#9CA3AF" }, // text-gray-400
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
      y: {
        ticks: { color: "#9CA3AF" }, // text-gray-400
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
    },
  };

  // Prepare table data
  const prepareTableData = (gender: "male" | "female") => {
    return ageGroups.map((ageGroup) => {
      const metrics = genderMetrics[gender]?.ageGroups[ageGroup] || {};
      const ctr = metrics.impressions
        ? metrics.weightedCtr / metrics.impressions
        : 0;
      const conversionRate = metrics.clicks
        ? metrics.weightedConversionRate / metrics.clicks
        : 0;
      return {
        ageGroup,
        impressions: metrics.impressions?.toLocaleString() || "0",
        clicks: metrics.clicks?.toLocaleString() || "0",
        conversions: metrics.conversions?.toLocaleString() || "0",
        ctr: ctr.toFixed(2) + "%",
        conversionRate: conversionRate.toFixed(2) + "%",
      };
    });
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
              <h1 className="text-3xl md:text-5xl font-bold">
                Demographic View
              </h1>
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6">
          {/* Gender Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">
                <Users className="inline-block mr-2" /> Male Metrics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CardMetric
                  title="Total Clicks"
                  value={genderMetrics.male?.clicks?.toLocaleString() || "0"}
                  icon={<TrendingUp />}
                />
                <CardMetric
                  title="Total Spend"
                  value={`$${(genderMetrics.male?.spend || 0).toLocaleString(
                    undefined,
                    {
                      maximumFractionDigits: 2,
                    }
                  )}`}
                  icon={<TrendingUp />}
                />
                <CardMetric
                  title="Total Revenue"
                  value={`$${(genderMetrics.male?.revenue || 0).toLocaleString(
                    undefined,
                    {
                      maximumFractionDigits: 2,
                    }
                  )}`}
                  icon={<TrendingUp />}
                />
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-pink-400">
                <Users className="inline-block mr-2" /> Female Metrics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CardMetric
                  title="Total Clicks"
                  value={genderMetrics.female?.clicks?.toLocaleString() || "0"}
                  icon={<TrendingUp />}
                />
                <CardMetric
                  title="Total Spend"
                  value={`$${(genderMetrics.female?.spend || 0).toLocaleString(
                    undefined,
                    {
                      maximumFractionDigits: 2,
                    }
                  )}`}
                  icon={<TrendingUp />}
                />
                <CardMetric
                  title="Total Revenue"
                  value={`$${(
                    genderMetrics.female?.revenue || 0
                  ).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}`}
                  icon={<TrendingUp />}
                />
              </div>
            </div>
          </div>

          {/* Bar Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-white">
                <BarChart4 className="inline-block mr-2" /> Total Spend by Age
                Group
              </h2>
              <div className="h-64">
                <Bar options={chartOptions} data={spendByAgeGroup} />
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-white">
                <BarChart4 className="inline-block mr-2" /> Total Revenue by Age
                Group
              </h2>
              <div className="h-64">
                <Bar options={chartOptions} data={revenueByAgeGroup} />
              </div>
            </div>
          </div>

          {/* Tables */}
          <div className="grid grid-cols-1 gap-8">
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">
                <TableIcon className="inline-block mr-2" /> Campaign Performance
                by Male Age Groups
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Age Group
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
                        Conversion Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {prepareTableData("male").map((row, index) => (
                      <tr key={`male-${index}`} className="hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {row.ageGroup}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {row.impressions}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {row.clicks}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {row.conversions}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {row.ctr}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {row.conversionRate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-pink-400">
                <TableIcon className="inline-block mr-2" /> Campaign Performance
                by Female Age Groups
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Age Group
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
                        Conversion Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {prepareTableData("female").map((row, index) => (
                      <tr key={`female-${index}`} className="hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {row.ageGroup}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {row.impressions}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {row.clicks}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {row.conversions}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {row.ctr}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {row.conversionRate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
