import prisma from "@/lib/prisma";
import { normalizeTopic, uniqueTopics } from "@/lib/topics";
import { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type TimelineRow = {
  published_at: Date | string | null;
};

type EngagementRow = {
  view_count?: bigint | number | string | null;
  like_count?: bigint | number | string | null;
};

type TopChannelByAvgLikes = {
  name: string;
  avgLikes: number;
  videoCount: number;
};

type TopChannelByAvgViews = {
  name: string;
  avgViews: number;
  videoCount: number;
};

const parseNumberList = (value: string | null, min: number, max: number) => {
  if (!value || value === "all") return [];

  return value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item) && item >= min && item <= max);
};

export async function GET(request: NextRequest) {
  try {
    const db = prisma as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    const { searchParams } = new URL(request.url);
    const selectedYear = searchParams.get("year");
    const selectedMonth = searchParams.get("month");
    const selectedDay = searchParams.get("day");
    const selectedTopic = searchParams.get("topic");
    const yearValues = parseNumberList(selectedYear, 1900, 2100);
    const monthValues = parseNumberList(selectedMonth, 1, 12);
    const dayValues = parseNumberList(selectedDay, 1, 31);

    const baseFilters: Prisma.hasil_prediksi_bertWhereInput[] = [];

    if (selectedTopic && selectedTopic !== "all") {
      baseFilters.push({ pred_label: { equals: selectedTopic, mode: "insensitive" } });
    }

    if (yearValues.length > 0) {
      const dateFilters: Prisma.hasil_prediksi_bertWhereInput[] = [];

      yearValues.forEach((yearValue) => {
        const monthsToFilter = monthValues.length > 0 ? monthValues : [null];

        monthsToFilter.forEach((monthValue) => {
          const daysToFilter = monthValue && dayValues.length > 0 ? dayValues : [null];

          daysToFilter.forEach((dayValue) => {
            const startMonth = monthValue ? monthValue - 1 : 0;
            const startDay = dayValue ?? 1;
            const startDate = new Date(Date.UTC(yearValue, startMonth, startDay));
            const endDate = dayValue
              ? new Date(Date.UTC(yearValue, startMonth, startDay + 1))
              : monthValue
                ? new Date(Date.UTC(yearValue, startMonth + 1, 1))
                : new Date(Date.UTC(yearValue + 1, 0, 1));

            if (dayValue && startDate.getUTCMonth() !== startMonth) return;

            dateFilters.push({
              published_at: {
                gte: startDate,
                lt: endDate,
              },
            });
          });
        });
      });

      if (dateFilters.length > 0) {
        baseFilters.push({ OR: dateFilters });
      }
    }

    const buildWhere = (...extraFilters: Prisma.hasil_prediksi_bertWhereInput[]): Prisma.hasil_prediksi_bertWhereInput => {
      const filters = [...baseFilters, ...extraFilters];
      return filters.length > 0 ? { AND: filters } : {};
    };

    const where = buildWhere();

    const recentVideosRaw = await db.hasil_prediksi_bert.findMany({
      take: 5,
      orderBy: { published_at: "desc" },
      where,
    });

    const totalVideos = await db.hasil_prediksi_bert.count({ where });
    const channelsGroup = await db.hasil_prediksi_bert.groupBy({
      by: ["channel_name"],
      where,
    });

    const keywordTopics = await db.keyword_scraping.findMany({
      select: { topic: true },
      distinct: ["topic"],
    });

    const counts = await db.hasil_prediksi_bert.groupBy({
      by: ["pred_label"],
      _count: { pred_label: true },
      where: buildWhere({ pred_label: { not: null } }),
    });

    const topics = uniqueTopics([
      ...keywordTopics.map((item: { topic?: string }) => item.topic),
      ...counts.map((item: { pred_label?: string }) => item.pred_label),
    ]);

    const countByTopic = new Map<string, number>();
    counts.forEach((item: { pred_label?: string; _count: { pred_label: number } }) => {
      if (!item.pred_label) return;
      countByTopic.set(normalizeTopic(item.pred_label), item._count.pred_label);
    });

    const topicStats = topics.map((topic) => ({
      ...topic,
      value: countByTopic.get(normalizeTopic(topic.label)) || 0,
    }));

    const statsSummary: Record<string, string> = {
      totalVideos: String(totalVideos),
      totalChannels: String(channelsGroup.length),
    };

    topicStats.forEach((topic) => {
      statsSummary[topic.label] = String(topic.value);
    });

    const topChannelsRaw = await db.hasil_prediksi_bert.groupBy({
      by: ["channel_name"],
      _count: { channel_name: true },
      where: buildWhere({ channel_name: { not: null } }),
      orderBy: { _count: { channel_name: "desc" } },
      take: 5,
    });

    const topChannels = (topChannelsRaw || []).map((channel: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
      name: channel.channel_name || "Unknown",
      count: channel._count.channel_name,
    }));

    const channelsWithAverageViews = await db.hasil_prediksi_bert.groupBy({
      by: ["channel_name"],
      _avg: { view_count: true },
      _count: { channel_name: true },
      where: buildWhere({ channel_name: { not: null } }),
    });

    const topChannelsByAvgViews = (channelsWithAverageViews || [])
      .map((channel: any): TopChannelByAvgViews => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
        name: channel.channel_name || "Unknown",
        avgViews: Number(channel._avg.view_count || 0),
        videoCount: channel._count.channel_name,
      }))
      .sort((a: TopChannelByAvgViews, b: TopChannelByAvgViews) => b.avgViews - a.avgViews)
      .slice(0, 5);

    // Get top channels by average likes
    const channelsWithAverageLikes = await db.hasil_prediksi_bert.groupBy({
      by: ["channel_name"],
      _avg: { like_count: true },
      _count: { channel_name: true },
      where: buildWhere({ channel_name: { not: null } }),
    });

    const topChannelsByAvgLikes = (channelsWithAverageLikes || [])
      .map((channel: any): TopChannelByAvgLikes => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
        name: channel.channel_name || "Unknown",
        avgLikes: Number(channel._avg.like_count || 0),
        videoCount: channel._count.channel_name,
      }))
      .sort((a: TopChannelByAvgLikes, b: TopChannelByAvgLikes) => b.avgLikes - a.avgLikes)
      .slice(0, 5);

    const timelineRaw = await db.hasil_prediksi_bert.findMany({
      select: { published_at: true },
      where: buildWhere({ published_at: { not: null } }),
      orderBy: { published_at: "asc" },
    });

    const monthlyCounts: Record<string, Array<{ month: number; count: number }>> = {};
    const dailyCounts: Record<string, Array<{ day: number; count: number }>> = {};
    const yearlyCountsMap = new Map<number, number>();

    (timelineRaw as TimelineRow[] || []).forEach((item) => {
      if (!item.published_at) return;
      const publishedAt = new Date(item.published_at);
      const year = publishedAt.getFullYear();
      const monthValue = publishedAt.getMonth() + 1;
      const dayValue = publishedAt.getDate();
      const yearKey = String(year);
      const monthKey = `${year}-${monthValue}`;

      if (!monthlyCounts[yearKey]) monthlyCounts[yearKey] = [];
      const existingMonth = monthlyCounts[yearKey].find((month) => month.month === monthValue);
      if (existingMonth) {
        existingMonth.count += 1;
      } else {
        monthlyCounts[yearKey].push({ month: monthValue, count: 1 });
      }

      if (!dailyCounts[monthKey]) dailyCounts[monthKey] = [];
      const existingDay = dailyCounts[monthKey].find((day) => day.day === dayValue);
      if (existingDay) {
        existingDay.count += 1;
      } else {
        dailyCounts[monthKey].push({ day: dayValue, count: 1 });
      }

      yearlyCountsMap.set(year, (yearlyCountsMap.get(year) || 0) + 1);
    });

    Object.keys(dailyCounts).forEach((key) => {
      dailyCounts[key].sort((a, b) => a.day - b.day);
    });

    const yearlyCounts = Array.from(yearlyCountsMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([year, count]) => ({ year, count }));

    const engagementRows = await db.hasil_prediksi_bert.findMany({
      select: { view_count: true, like_count: true },
      where,
    });

    const engagement = (engagementRows as EngagementRow[]).reduce(
      (summary, item) => {
        const views = Number(item.view_count ?? 0);
        const likes = Number(item.like_count ?? 0);

        return {
          totalViews: summary.totalViews + (Number.isNaN(views) ? 0 : views),
          totalLikes: summary.totalLikes + (Number.isNaN(likes) ? 0 : likes),
          totalVideos: summary.totalVideos + 1,
        };
      },
      { totalViews: 0, totalLikes: 0, totalVideos: 0 }
    );

    const finalResponse = {
      summary: statsSummary,
      topics,
      topicStats,
      chartData: topicStats,
      topChannels,
      topChannelsByAvgViews,
      topChannelsByAvgLikes,
      recentVideos: recentVideosRaw,
      engagement: {
        ...engagement,
        averageLikes: engagement.totalVideos > 0 ? Math.round(engagement.totalLikes / engagement.totalVideos) : 0,
      },
      timeline: {
        yearlyCounts,
        monthlyCounts,
        dailyCounts,
      },
    };

    const serialized = JSON.stringify(finalResponse, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    );

    return new NextResponse(serialized, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error("Stats API Error:", error);
    return NextResponse.json(
      { error: "Database error", message: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
