import prisma from "@/lib/prisma";
import { normalizeTopic } from "@/lib/topics";
import { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface ScatterDataPoint {
  x: number;
  y: number;
  topic: string;
  title: string;
}

export async function GET(request: NextRequest) {
  try {
    const db = prisma as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    const { searchParams } = new URL(request.url);
    const selectedYear = searchParams.get("year");
    const selectedTopic = searchParams.get("topic");
    const yearValue = selectedYear ? Number(selectedYear) : null;

    const where: Prisma.hasil_prediksi_bertWhereInput = {};

    if (selectedTopic && selectedTopic !== "all") {
      where.pred_label = { equals: selectedTopic, mode: "insensitive" };
    }

    if (yearValue && !Number.isNaN(yearValue)) {
      where.published_at = {
        gte: new Date(Date.UTC(yearValue, 0, 1)),
        lt: new Date(Date.UTC(yearValue + 1, 0, 1)),
      };
    }

    // Fetch all videos with engagement data
    const videosRaw = await db.hasil_prediksi_bert.findMany({
      select: {
        video_id: true,
        title: true,
        pred_label: true,
        view_count: true,
        like_count: true,
      },
      where: { ...where, pred_label: { not: null } },
    });

    // Process data for scatter plot
    const scatterData: ScatterDataPoint[] = videosRaw.map((video: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      const views = Number(video.view_count ?? 0);
      const likes = Number(video.like_count ?? 0);
      const engagementRatio = views > 0 ? (likes / views) * 100 : 0; // Likes as percentage of views

      return {
        x: views,
        y: Number.isNaN(engagementRatio) ? 0 : engagementRatio,
        topic: video.pred_label || "Unknown",
        title: video.title || "Untitled",
      };
    });

    // Group by topic for series
    const topicGroups: Record<string, ScatterDataPoint[]> = {};
    const topicColors: Record<string, string> = {
      irigasi: "#16A34A",
      hidroponik: "#0EA5E9",
      pemupukan: "#F59E0B",
      "budidaya-organik": "#EF4444",
      "pengendalian-hama": "#8B5CF6",
    };

    scatterData.forEach((point) => {
      const normalizedTopic = normalizeTopic(point.topic);
      if (!topicGroups[normalizedTopic]) {
        topicGroups[normalizedTopic] = [];
      }
      topicGroups[normalizedTopic].push(point);
    });

    // Convert to ApexCharts series format
    const series = Object.entries(topicGroups).map(([topic, points]) => ({
      name: topic.charAt(0).toUpperCase() + topic.slice(1),
      data: points.map((p) => ({
        x: p.x,
        y: p.y,
        title: p.title,
      })),
    }));

    const finalResponse = {
      scatterData,
      series,
      topicColors,
      stats: {
        totalVideos: scatterData.length,
        topicCount: Object.keys(topicGroups).length,
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
    console.error("Scatter API Error:", error);
    return NextResponse.json(
      { error: "Database error", message: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
