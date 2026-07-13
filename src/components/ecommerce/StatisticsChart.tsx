"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { fetchJson } from "@/lib/fetchJson";

// Mengamankan render Next.js SSR agar tidak terjadi mismatch
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface ChartItem {
  value: number;
  label: string;
}

interface ChartFilterProps {
  year?: string;
  month?: string;
  day?: string;
  topic?: string;
}

interface StatsResponse {
  chartData?: ChartItem[];
}

const buildStatsUrl = ({ year = "all", month = "all", day = "all", topic = "all" }: ChartFilterProps) => {
  const params = new URLSearchParams();
  if (year !== "all") params.set("year", year);
  if (month !== "all") params.set("month", month);
  if (day !== "all") params.set("day", day);
  if (topic !== "all") params.set("topic", topic);
  const query = params.toString();
  return query ? `/api/stats?${query}` : "/api/stats";
};

export default function StatisticsChart({ year = "all", month = "all", day = "all", topic = "all" }: ChartFilterProps) {
  const [series, setSeries] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const json = await fetchJson<StatsResponse>(buildStatsUrl({ year, month, day, topic }));
        if (isMounted) {
          if (json.chartData && json.chartData.length > 0) {
            setSeries(json.chartData.map((item: ChartItem) => item.value));
            setLabels(json.chartData.map((item: ChartItem) => item.label));
          } else {
            setSeries([]);
            setLabels([]);
          }
        }
      } catch (error) {
        console.error("Gagal sinkronisasi chart:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();

    return () => {
      isMounted = false;
    };
  }, [year, month, day, topic]);

  const options: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "inherit",
      animations: {
        enabled: true,
        speed: 650,
        animateGradually: { enabled: true, delay: 80 },
        dynamicAnimation: { enabled: true, speed: 350 },
      },
    },
    labels: labels,
    colors: ["#16A34A", "#F59E0B", "#0EA5E9", "#EF4444", "#8B5CF6"],
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"] 
    },
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total Video",
              fontSize: "12px",
              fontWeight: 900, // Mengunci ketebalan font Total Video menjadi super bold
              color: undefined, // DIUBAH: Dibuat undefined agar tidak menimpa manipulasi CSS Global
              formatter: function (w: { globals: { seriesTotals: number[] } }) {
                const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                return String(total);
              },
            },
            value: {
              show: true,
              fontSize: "24px",
              fontWeight: 900,
              offsetY: 5
            }
          },
        },
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '12px',
        fontWeight: '900',
      },
      dropShadow: {
        enabled: false, 
      },
      formatter: function (val: string | number | number[], opts?: { seriesIndex: number; w: { globals: { series: number[] } } }) {
        return opts ? String(opts.w.globals.series[opts.seriesIndex]) : String(val);
      },
    },
    legend: { 
      position: "bottom", 
      fontSize: "13px",
      fontWeight: 900,
      markers: { size: 6, strokeWidth: 0, offsetX: -4 },
      itemMargin: { horizontal: 10, vertical: 8 }
    },
    tooltip: {
      theme: "dark",
      y: { formatter: (value) => `${value} video` },
    },
  };

  if (loading) return (
    <div className="flex h-full min-h-[500px] items-center justify-center rounded-3xl border border-emerald-900/10 bg-white shadow-sm shadow-emerald-950/[0.03] dark:border-white/[0.07] dark:bg-white/[0.04]">
      <p className="text-gray-500 animate-pulse font-sans font-bold uppercase text-[10px] tracking-widest text-center">Sinkronisasi Data...</p>
    </div>
  );

  return (
    <div className="h-full min-h-[500px] rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm shadow-emerald-950/[0.03] transition-all duration-300 dark:border-white/[0.07] dark:bg-white/[0.04] dark:shadow-none">
      <div className="mb-8">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-green-600 dark:text-green-400">Komposisi Topik</p>
        <h3 className="mt-2 text-sm font-black uppercase tracking-[0.18em] text-gray-900 dark:text-white">
          Distribusi Aktivitas
        </h3>
      </div>
      <div className="flex justify-center relative">
        <ReactApexChart options={options} series={series} type="donut" height={410} width="100%" />
      </div>
      
      {/* CSS GLOBAL: MEMAKSA PERUBAHAN WARNA TEKS BERDASARKAN TEMA */}
      <style jsx global>{`
        /* ==========================================================================
           --- A. LIGHT THEME (Mode Terang) ---
           ========================================================================== */

        /* 1. Angka pada tiap potongan warna (135, 133, 114, dll) */
        .apexcharts-datalabels text, 
        .apexcharts-datalabel,
        .apexcharts-datalabels-text {
          fill: #000000 !important; /* Hitam murni pekat */
          font-weight: 900 !important;
          transition: fill 0.3s ease;
        }

        /* 2. Teks kata "Total Video" di tengah lingkaran menjadi HITAM PEKAT BOLD */
        .apexcharts-datalabel-label {
          fill: #000000 !important; /* Memaksa teks "Total Video" menjadi hitam murni */
          font-weight: 900 !important; /* Menjadikannya sangat tebal */
          transition: fill 0.3s ease;
        }

        /* 3. Angka nilai Total di tengah chart (658) */
        .apexcharts-datalabel-value {
          fill: #000000 !important;
          font-weight: 900 !important;
          transition: fill 0.3s ease;
        }

        /* 4. Teks Legenda Keterangan di bawah chart menjadi HITAM BOLD */
        .apexcharts-legend-text,
        .apexcharts-legend-series .apexcharts-legend-text,
        span.apexcharts-legend-text {
          color: #000000 !important;
          font-weight: 900 !important;
          transition: color 0.3s ease;
        }

        /* 5. Border putih antar segmen agar terlihat rapi */
        .apexcharts-pie-series path {
          stroke: #ffffff !important;
          stroke-width: 2px;
          transition: stroke 0.3s ease;
        }


        /* ==========================================================================
           --- B. DARK THEME (Mode Gelap) ---
           ========================================================================== */

        /* 1. Angka pada tiap potongan warna saat Dark Mode */
        .dark .apexcharts-datalabels text, 
        .dark .apexcharts-datalabel,
        .dark .apexcharts-datalabels-text {
          fill: #ffffff !important;
        }

        /* 2. Teks kata "Total Video" di tengah lingkaran menjadi PUTIH BOLD saat Dark Mode */
        .dark .apexcharts-datalabel-label {
          fill: #ffffff !important; /* Memaksa teks "Total Video" menjadi putih murni */
          font-weight: 900 !important;
        }

        /* 3. Angka nilai Total di tengah chart saat Dark Mode */
        .dark .apexcharts-datalabel-value {
          fill: #ffffff !important;
        }

        /* 4. Teks Legenda Keterangan di bawah chart menjadi PUTIH BOLD */
        .dark .apexcharts-legend-text,
        .dark .apexcharts-legend-series .apexcharts-legend-text,
        .dark span.apexcharts-legend-text {
          color: #ffffff !important;
          font-weight: 900 !important;
        }

        /* 5. Sekat pembatas transisi segmen saat Dark Mode */
        .dark .apexcharts-pie-series path {
          stroke: #0b1710 !important;
        }
      `}</style>
    </div>
  );
}
