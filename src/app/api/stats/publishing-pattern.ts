import prisma from "@/lib/prisma";
import { normalizeTopic } from "@/lib/topics";
import { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const db = prisma as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    const { searchParams } = new URL(request.url);
    const selectedYear = searchParams.get("year");
    const yearValue = selectedYear ? Number(selectedYear) : null;

    const where: Prisma.hasil_prediksi_bertWhereInput = {};

    if (yearValue && !Number.isNaN(yearValue)) {
      where.published_at = {
        gte: new Date(Date.UTC(yearValue, 0, 1)),
        lt: new Date(Date.UTC(yearValue + 1, 0, 1)),
      };
    }

    // Fetch all videos with publish date and topic
    const videosRaw = await db.hasil_prediksi_bert.findMany({
      select: {
        published_at: true,
        pred_label: true,
      },
      where: { ...where, pred_label: { not: null }, published_at: { not: null } },
    });

    // Day names for radar chart
    const dayNames = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

    // Initialize data structure: [topic][dayOfWeek] = count
    const dayOfWeekCounts: Record<string, number[]> = {};

    // Get unique topics
    const topics = new Set<string>();

    videosRaw.forEach((video: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      const topic = normalizeTopic(video.pred_label || "Unknown");
      topics.add(topic);
    });

    // Initialize counters for each topic (7 days)
    topics.forEach((topic) => {
      dayOfWeekCounts[topic] = [0, 0, 0, 0, 0, 0, 0];
    });

    // Count videos by day of week for each topic
    videosRaw.forEach((video: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!video.published_at) return;

      const publishedAt = new Date(video.published_at);
      // getDay: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      // We want: 0 = Monday, ..., 6 = Sunday
      let dayOfWeek = publishedAt.getDay() - 1;
      if (dayOfWeek === -1) dayOfWeek = 6; // Sunday becomes index 6

      const topic = normalizeTopic(video.pred_label || "Unknown");
      if (dayOfWeekCounts[topic]) {
        dayOfWeekCounts[topic][dayOfWeek]++;
      }
    });

    // Convert to ApexCharts radar format
    const series = Object.entries(dayOfWeekCounts).map(([topic, counts]) => ({
      name: topic.charAt(0).toUpperCase() + topic.slice(1),
      data: counts,
    }));

    const finalResponse = {
      series,
      categories: dayNames,
      stats: {
        totalVideos: videosRaw.length,
        topicCount: topics.size,
      },
      dayOfWeekCounts,
    };

    const serialized = JSON.stringify(finalResponse, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    );

    return new NextResponse(serialized, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error("Publishing Pattern API Error:", error);
    return NextResponse.json(
      { error: "Database error", message: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
