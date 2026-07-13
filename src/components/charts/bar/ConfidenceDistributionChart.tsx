"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface ChartFilterProps {
  year?: string;
  topic?: string;
}

interface ChartData {
  series: Array<{ name: string; data: number[] }>;
  categories: string[];
  stats?: {
    totalVideos: number;
    averageConfidence: number;
  };
}

const buildConfidenceUrl = ({ year = "all", topic = "all" }: ChartFilterProps) => {
  const params = new URLSearchParams();
  if (year !== "all") params.set("year", year);
  if (topic !== "all") params.set("topic", topic);
  const query = params.toString();
  return query ? `/api/stats/confidence?${query}` : "/api/stats/confidence";
};

export default function ConfidenceDistributionChart({ year = "all", topic = "all" }: ChartFilterProps) {
  const [chartData, setChartData] = useState<ChartData>({
    series: [],
    categories: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(buildConfidenceUrl({ year, topic }));
        const json = await res.json();
        if (isMounted && json.series) {
          setChartData({
            series: json.series,
            categories: json.categories,
            stats: json.stats,
          });
        }
      } catch (error) {
        console.error("Gagal mengambil confidence chart data:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [year, topic]);

  const options: ApexOptions = {
    chart: {
      type: "bar",
      fontFamily: "inherit",
      animations: {
        enabled: true,
        speed: 650,
        animateGradually: { enabled: true, delay: 80 },
        dynamicAnimation: { enabled: true, speed: 350 },
      },
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        borderRadiusApplication: "end",
        horizontal: false,
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: string | number) => `${val}`,
      textAnchor: "middle",
      offsetY: -10,
      style: {
        fontSize: "12px",
        colors: ["#000000"],
        fontWeight: 800,
      },
    },
    xaxis: {
      categories: chartData.categories,
      title: {
        text: "Confidence Score Ranges",
        style: { fontSize: "12px", fontWeight: 700 },
      },
      labels: {
        style: {
          fontSize: "11px",
          fontWeight: 700,
        },
      },
    },
    yaxis: {
      title: {
        text: "Jumlah Video",
        style: { fontSize: "12px", fontWeight: 700 },
      },
    },
    colors: ["#16A34A"],
    grid: {
      show: true,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      strokeDashArray: 4,
    },
    tooltip: {
      theme: "dark",
      y: { formatter: (value: number) => `${value} video` },
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          xaxis: { labels: { style: { fontSize: "10px" } } },
        },
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-[500px] items-center justify-center rounded-3xl border border-emerald-900/10 bg-white text-xs font-bold uppercase tracking-[0.2em] text-gray-400 shadow-sm shadow-emerald-950/[0.03] dark:border-white/[0.07] dark:bg-white/[0.04]">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-full min-h-[500px] overflow-hidden rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm shadow-emerald-950/[0.03] transition-all duration-300 dark:border-white/[0.07] dark:bg-white/[0.04] dark:shadow-none">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-green-600 dark:text-green-400">
            Model Performance
          </p>
          <h3 className="mt-2 text-sm font-black uppercase tracking-[0.18em] text-gray-900 dark:text-white">
            Model Confidence Distribution
          </h3>
          <p className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-400">
            Transparansi performa model BERT dalam mengklasifikasi topik pertanian.
          </p>
        </div>
        {chartData.stats && (
          <div className="rounded-2xl bg-blue-50 px-4 py-3 text-right dark:bg-blue-500/10">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
              Avg Confidence
            </p>
            <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">
              {(chartData.stats.averageConfidence * 100).toFixed(1)}%
            </p>
          </div>
        )}
      </div>
      <div className="w-full overflow-hidden">
        {chartData.series.length > 0 && chartData.categories.length > 0 ? (
          <ReactApexChart options={options} series={chartData.series} type="bar" height={390} width="100%" />
        ) : (
          <div className="flex h-[390px] items-center justify-center text-sm text-gray-500">
            Tidak ada data untuk ditampilkan
          </div>
        )}
      </div>

      <style jsx global>{`
        .apexcharts-yaxis-label text,
        .apexcharts-xaxis-label text {
          fill: #000000 !important;
          font-weight: 700 !important;
        }

        .dark .apexcharts-yaxis-label text,
        .dark .apexcharts-xaxis-label text {
          fill: #ffffff !important;
          font-weight: 700 !important;
        }

        .apexcharts-gridline {
          stroke: #000000 !important;
          opacity: 0.1 !important;
        }

        .dark .apexcharts-gridline {
          stroke: #ffffff !important;
          opacity: 0.15 !important;
        }

        .apexcharts-datalabel {
          fill: #000000 !important;
          font-weight: 800 !important;
        }

        .dark .apexcharts-datalabel {
          fill: #ffffff !important;
        }
      `}</style>
    </div>
  );
}
