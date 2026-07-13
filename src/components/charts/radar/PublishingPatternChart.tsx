"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface ChartFilterProps {
  year?: string;
}

interface SeriesData {
  name: string;
  data: number[];
}

interface ChartData {
  series: SeriesData[];
  categories: string[];
}

const buildPublishingUrl = ({ year = "all" }: ChartFilterProps) => {
  const params = new URLSearchParams();
  if (year !== "all") params.set("year", year);
  const query = params.toString();
  return query ? `/api/stats/publishing-pattern?${query}` : "/api/stats/publishing-pattern";
};

export default function PublishingPatternChart({ year = "all" }: ChartFilterProps) {
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
        const res = await fetch(buildPublishingUrl({ year }));
        const json = await res.json();
        if (isMounted && json.series && json.categories) {
          setChartData({
            series: json.series,
            categories: json.categories,
          });
        }
      } catch (error) {
        console.error("Gagal mengambil publishing pattern data:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [year]);

  const options: ApexOptions = {
    chart: {
      type: "radar",
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
      radar: {
        size: 140,
        polygons: {
          strokeColors: "#000000",
          fill: {
            colors: ["#f8fafc", "#ffffff"],
          },
        },
      },
    },
    colors: ["#16A34A", "#0EA5E9", "#F59E0B", "#F97316", "#8B5CF6"],
    xaxis: {
      categories: chartData.categories,
      labels: {
        style: {
          fontSize: "12px",
          fontWeight: 700,
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "11px",
          fontWeight: 700,
        },
      },
    },
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      markers: {
        size: 6,
      },
    },
    tooltip: {
      theme: "dark",
      y: { formatter: (value: number) => `${value} video` },
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          plotOptions: {
            radar: {
              size: 100,
            },
          },
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
            Content Behavior
          </p>
          <h3 className="mt-2 text-sm font-black uppercase tracking-[0.18em] text-gray-900 dark:text-white">
            Pola Publishing Berdasarkan Hari
          </h3>
          <p className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-400">
            Pola publikasi konten kreator YouTube dalam seminggu untuk setiap topik pertanian.
          </p>
        </div>
      </div>
      <div className="w-full overflow-hidden">
        {chartData.series.length > 0 && chartData.categories.length > 0 ? (
          <ReactApexChart options={options} series={chartData.series} type="radar" height={390} width="100%" />
        ) : (
          <div className="flex h-[390px] items-center justify-center text-sm text-gray-500">
            Tidak ada data untuk ditampilkan
          </div>
        )}
      </div>

      <style jsx global>{`
        .apexcharts-xaxis-label text {
          fill: #000000 !important;
          font-weight: 700 !important;
          font-size: 12px !important;
        }

        .dark .apexcharts-xaxis-label text {
          fill: #ffffff !important;
          font-weight: 700 !important;
        }

        .apexcharts-legend-text {
          fill: #000000 !important;
          font-weight: 700 !important;
          font-size: 12px !important;
        }

        .dark .apexcharts-legend-text {
          fill: #ffffff !important;
        }

        .apexcharts-tooltip {
          background: rgba(0, 0, 0, 0.8) !important;
          border: 1px solid #333 !important;
        }
      `}</style>
    </div>
  );
}
