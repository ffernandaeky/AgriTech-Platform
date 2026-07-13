"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface ChartDataItem {
  label: string;
  value: number;
}

export default function PieChartAgritube() {
  const [series, setSeries] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((json: { chartData: ChartDataItem[] }) => {
        if (json.chartData) {
          setSeries(json.chartData.map((d) => d.value));
          setLabels(json.chartData.map((d) => d.label));
        }
      });
  }, []);

  const options: ApexOptions = {
    chart: { type: "donut" },
    labels: labels,
    colors: ["#22C55E", "#EAB308", "#3B82F6", "#EF4444", "#6366F1"],
    legend: { position: "bottom" },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total Video",
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter: (w: any) => {
                return w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0).toString();
              },
            },
          },
        },
      },
    },
  };

  return <ReactApexChart options={options} series={series} type="donut" height={340} />;
}