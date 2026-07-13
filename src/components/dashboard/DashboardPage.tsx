"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useAuthUser } from "@/lib/auth";
import { fetchJson } from "@/lib/fetchJson";

const ChartLoading = () => (
  <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-emerald-900/10 bg-white text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-slate-500">
    Loading Chart...
  </div>
);

const EcommerceMetrics = dynamic(() => import("@/components/ecommerce/EcommerceMetrics"), {
  ssr: false,
  loading: () => <ChartLoading />,
});
const StatisticsChart = dynamic(() => import("@/components/ecommerce/StatisticsChart"), {
  ssr: false,
  loading: () => <ChartLoading />,
});
const TopChannelChart = dynamic(() => import("@/components/charts/bar/TopChannelChart"), {
  ssr: false,
  loading: () => <ChartLoading />,
});
const YearlyTrendChart = dynamic(() => import("@/components/charts/line/YearlyTrendChart"), {
  ssr: false,
  loading: () => <ChartLoading />,
});

interface DashboardFilter {
  years: string[];
  months: string[];
  days: string[];
}

interface StatsResponse {
  timeline?: {
    yearlyCounts?: Array<{ year: number; count: number }>;
  };
}

const MONTH_OPTIONS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const DEFAULT_FILTER: DashboardFilter = {
  years: [],
  months: [],
  days: [],
};

const daysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

const formatDayLabel = (year: number, month: number, day: number) => {
  const weekday = new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(new Date(year, month - 1, day));
  return `${day} - ${weekday}`;
};

const WEEKDAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const toFilterParam = (values: string[]) => (values.length > 0 ? values.join(",") : "all");

const toggleValue = (values: string[], value: string) => {
  if (values.includes(value)) return values.filter((item) => item !== value);
  return [...values, value].sort((a, b) => Number(a) - Number(b));
};

export default function DashboardPage() {
  const user = useAuthUser();
  const [dateFilter, setDateFilter] = useState<DashboardFilter>(DEFAULT_FILTER);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  useEffect(() => {
    let isMounted = true;

    fetchJson<StatsResponse>("/api/stats")
      .then((data) => {
        if (!isMounted) return;
        const years = data.timeline?.yearlyCounts?.map((item) => item.year).sort((a, b) => b - a) ?? [];
        setAvailableYears(years);
      })
      .catch((error) => {
        console.error("Gagal memuat opsi filter dashboard:", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filterParams = {
    year: toFilterParam(dateFilter.years),
    month: toFilterParam(dateFilter.months),
    day: toFilterParam(dateFilter.days),
  };

  const handleYearToggle = (year: string) => {
    setDateFilter((current) => ({
      years: toggleValue(current.years, year),
      months: [],
      days: [],
    }));
  };

  const handleMonthToggle = (month: string) => {
    setDateFilter((current) => ({
      ...current,
      months: toggleValue(current.months, month),
      days: [],
    }));
  };

  const handleDayToggle = (day: string) => {
    setDateFilter((current) => ({ ...current, days: toggleValue(current.days, day) }));
  };

  const resetFilter = () => {
    setDateFilter(DEFAULT_FILTER);
  };

  const clearYears = () => {
    setDateFilter(DEFAULT_FILTER);
  };

  const clearMonths = () => {
    setDateFilter((current) => ({
      ...current,
      months: [],
      days: [],
    }));
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8f5] text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 dark:bg-[#07110b] dark:text-slate-500">
        Checking Access...
      </div>
    );
  }

  const roleLabel = user.role === "admin" ? "Admin" : "User";
  const greetingName = user.name || roleLabel;
  const roleDescription =
    user.role === "admin"
      ? "Anda masuk sebagai admin dan memiliki akses penuh ke scraping, pemrosesan data, pelabelan, dan model AI."
      : "Anda masuk sebagai user dan dapat memantau dashboard serta video pertanian berdasarkan topik.";

  return (
    <div className="min-h-screen w-full max-w-full space-y-6 overflow-x-hidden bg-transparent font-sans transition-colors duration-300">
      <div className="group relative mb-6 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#166534_0%,#15803d_48%,#0f766e_100%)] p-6 shadow-xl shadow-emerald-950/15 dark:shadow-2xl dark:shadow-green-950/30">
        <div className="relative z-10">
          <h2 className="text-xl font-black uppercase tracking-tight text-white lg:text-2xl">
            Halo {roleLabel}, {greetingName}!
          </h2>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-green-100/80 lg:text-xs">
            {roleDescription}
          </p>
        </div>
        <div className="absolute right-0 top-0 -mr-10 -mt-20 h-64 w-64 rounded-full bg-white/5 blur-[80px]" />
      </div>

      <DashboardDateFilter
        filter={dateFilter}
        years={availableYears}
        onYearToggle={handleYearToggle}
        onMonthToggle={handleMonthToggle}
        onDayToggle={handleDayToggle}
        onClearYears={clearYears}
        onClearMonths={clearMonths}
        onReset={resetFilter}
      />

      <EcommerceMetrics year={filterParams.year} month={filterParams.month} day={filterParams.day} />

      <YearlyTrendChart year={filterParams.year} month={filterParams.month} day={filterParams.day} />

      <div className="grid min-w-0 grid-cols-1 items-stretch gap-6 pt-2 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-6">
          <StatisticsChart year={filterParams.year} month={filterParams.month} day={filterParams.day} />
        </div>
        <div className="min-w-0 xl:col-span-6">
          <TopChannelChart year={filterParams.year} month={filterParams.month} day={filterParams.day} />
        </div>
      </div>
    </div>
  );
}

function DashboardDateFilter({
  filter,
  years,
  onYearToggle,
  onMonthToggle,
  onDayToggle,
  onClearYears,
  onClearMonths,
  onReset,
}: {
  filter: DashboardFilter;
  years: number[];
  onYearToggle: (year: string) => void;
  onMonthToggle: (month: string) => void;
  onDayToggle: (day: string) => void;
  onClearYears: () => void;
  onClearMonths: () => void;
  onReset: () => void;
}) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const hasActiveFilter = filter.years.length > 0 || filter.months.length > 0 || filter.days.length > 0;
  const selectedYear = Number(filter.years[0]);
  const selectedMonth = Number(filter.months[0]);
  const isMonthDisabled = filter.years.length === 0;
  const isDayDisabled = filter.years.length === 0 || filter.months.length === 0;
  const monthName = !isDayDisabled && filter.months.length === 1 ? MONTH_OPTIONS[selectedMonth - 1] : "Tanggal";
  const selectedDayText =
    filter.days.length === 0 || isDayDisabled
      ? "Semua Tanggal"
      : filter.days.length === 1 && filter.months.length === 1 && filter.years.length === 1
        ? formatDayLabel(selectedYear, selectedMonth, Number(filter.days[0]))
        : `${filter.days.length} Tanggal`;
  const showExactCalendar = !isDayDisabled && filter.years.length === 1 && filter.months.length === 1;
  const firstDayOffset = showExactCalendar ? new Date(selectedYear, selectedMonth - 1, 1).getDay() : 0;
  const maxCalendarDay =
    !isDayDisabled && filter.months.length === 1
      ? Math.max(...filter.years.map((yearValue) => daysInMonth(Number(yearValue), selectedMonth)))
      : 31;
  const calendarDays = !isDayDisabled
    ? [
        ...Array.from({ length: firstDayOffset }, () => null),
        ...Array.from({ length: maxCalendarDay }, (_, index) => index + 1),
      ]
    : [];

  return (
    <section className="w-full max-w-full rounded-xl border border-emerald-900/10 bg-white/95 p-4 shadow-sm shadow-emerald-950/[0.025] dark:border-white/[0.07] dark:bg-white/[0.04]">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-green-600 dark:text-green-400">
            Filter Dashboard
          </p>
          <h3 className="mt-1 text-sm font-black uppercase tracking-[0.12em] text-gray-900 dark:text-white">
            Periode Publikasi
          </h3>
        </div>

        <button
          type="button"
          onClick={onReset}
          disabled={!hasActiveFilter}
          className="inline-flex min-h-9 items-center justify-center rounded-lg border border-gray-200 px-3 text-[10px] font-black uppercase tracking-[0.14em] text-gray-600 transition hover:border-green-300 hover:bg-green-50 hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-45 dark:border-white/10 dark:text-gray-300 dark:hover:bg-green-500/10 dark:hover:text-green-300"
        >
          Reset
        </button>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-[0.85fr_1fr_1.15fr]">
        <div className="block">
          <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
            Tahun
          </span>
          <MultiSelectPopover
            label={filter.years.length === 0 ? "Semua Tahun" : `${filter.years.length} Tahun`}
            options={years.map((year) => ({ value: String(year), label: String(year) }))}
            selectedValues={filter.years}
            onToggle={onYearToggle}
            onSelectAll={onClearYears}
            allLabel="Semua Tahun"
          />
        </div>

        <div className="block">
          <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
            Bulan
          </span>
          <MultiSelectPopover
            label={filter.months.length === 0 ? "Semua Bulan" : `${filter.months.length} Bulan`}
            options={MONTH_OPTIONS.map((month, index) => ({ value: String(index + 1), label: month }))}
            selectedValues={filter.months}
            onToggle={onMonthToggle}
            onSelectAll={onClearMonths}
            allLabel="Semua Bulan"
            disabled={isMonthDisabled}
          />
        </div>

        <div className="relative">
          <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
            Kalender
          </span>
          <button
            type="button"
            disabled={isDayDisabled}
            onClick={() => setIsCalendarOpen((current) => !current)}
            className="flex h-11 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 text-left text-xs font-bold uppercase tracking-[0.06em] text-gray-800 outline-none transition hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/15 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 dark:border-white/10 dark:bg-gray-950 dark:text-white dark:hover:border-green-500/40 dark:disabled:bg-white/[0.03] dark:disabled:text-gray-600"
          >
            <span className="truncate">{selectedDayText}</span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500">{isCalendarOpen ? "Tutup" : "Pilih"}</span>
          </button>

          {isCalendarOpen && !isDayDisabled && (
            <>
              <button
                type="button"
                aria-label="Tutup kalender"
                className="fixed inset-0 z-30 cursor-default"
                onClick={() => setIsCalendarOpen(false)}
              />
              <div className="absolute right-0 z-40 mt-2 w-full min-w-[280px] rounded-xl border border-gray-200 bg-white p-4 shadow-xl shadow-slate-950/10 dark:border-white/10 dark:bg-gray-950 dark:shadow-black/30">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-green-600 dark:text-green-400">
                      {monthName}
                    </p>
                    <p className="mt-1 text-sm font-black uppercase tracking-[0.08em] text-gray-900 dark:text-white">
                      {filter.years.length === 1 ? filter.years[0] : `${filter.years.length} Tahun`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      filter.days.forEach((day) => onDayToggle(day));
                      setIsCalendarOpen(false);
                    }}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-gray-600 transition hover:border-green-300 hover:bg-green-50 hover:text-green-700 dark:border-white/10 dark:text-gray-300 dark:hover:bg-green-500/10 dark:hover:text-green-300"
                  >
                    Semua
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {WEEKDAY_LABELS.map((dayName) => (
                    <div
                      key={dayName}
                      className="py-1 text-[10px] font-black uppercase tracking-[0.08em] text-gray-400 dark:text-gray-500"
                    >
                      {dayName}
                    </div>
                  ))}

                  {calendarDays.map((day, index) => {
                    const isSelected = day !== null && filter.days.includes(String(day));
                    return day === null ? (
                      <span key={`blank-${index}`} className="h-9" />
                    ) : (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          onDayToggle(String(day));
                        }}
                        className={`h-9 rounded-lg text-xs font-black transition ${
                          isSelected
                            ? "bg-green-600 text-white shadow-sm shadow-green-900/20 dark:bg-green-500 dark:text-gray-950"
                            : "text-gray-700 hover:bg-green-50 hover:text-green-700 dark:text-gray-200 dark:hover:bg-green-500/10 dark:hover:text-green-300"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function MultiSelectPopover({
  label,
  options,
  selectedValues,
  onToggle,
  onSelectAll,
  allLabel,
  disabled = false,
}: {
  label: string;
  options: Array<{ value: string; label: string }>;
  selectedValues: string[];
  onToggle: (value: string) => void;
  onSelectAll: () => void;
  allLabel: string;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-11 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 text-left text-xs font-bold uppercase tracking-[0.08em] text-gray-800 outline-none transition hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/15 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 dark:border-white/10 dark:bg-gray-950 dark:text-white dark:hover:border-green-500/40 dark:disabled:bg-white/[0.03] dark:disabled:text-gray-600"
      >
        <span className="truncate">{label}</span>
        <span className="text-[10px] text-gray-400 dark:text-gray-500">{isOpen ? "Tutup" : "Pilih"}</span>
      </button>

      {isOpen && !disabled && (
        <>
          <button
            type="button"
            aria-label="Tutup filter"
            className="fixed inset-0 z-30 cursor-default"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 z-40 mt-2 max-h-72 w-full min-w-[220px] overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-xl shadow-slate-950/10 dark:border-white/10 dark:bg-gray-950 dark:shadow-black/30">
            <button
              type="button"
              onClick={() => {
                onSelectAll();
                setIsOpen(false);
              }}
              className={`mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[11px] font-black uppercase tracking-[0.1em] transition ${
                selectedValues.length === 0
                  ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.05] dark:hover:text-white"
              }`}
            >
              <span>{allLabel}</span>
              <span
                className={`h-4 w-4 rounded border ${
                  selectedValues.length === 0
                    ? "border-green-600 bg-green-600 dark:border-green-400 dark:bg-green-400"
                    : "border-gray-300 dark:border-white/20"
                }`}
              />
            </button>

            {options.map((option) => {
              const isSelected = selectedValues.includes(option.value);

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onToggle(option.value)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[11px] font-black uppercase tracking-[0.1em] transition ${
                    isSelected
                      ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.05] dark:hover:text-white"
                  }`}
                >
                  <span>{option.label}</span>
                  <span
                    className={`h-4 w-4 rounded border ${
                      isSelected
                        ? "border-green-600 bg-green-600 dark:border-green-400 dark:bg-green-400"
                        : "border-gray-300 dark:border-white/20"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
