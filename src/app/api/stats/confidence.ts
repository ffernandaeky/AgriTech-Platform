import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

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

    // Fetch videos with engagement metrics to calculate confidence proxy
    const videosRaw = await db.hasil_prediksi_bert.findMany({
      select: {
        video_id: true,
        view_count: true,
        like_count: true,
        word_count: true,
        token_count: true,
        pred_label: true,
      },
      where: { ...where, pred_label: { not: null } },
    });

    // Calculate confidence score as proxy based on engagement and text metrics
    interface VideoWithConfidence {
      videoId: string;
      confidence: number;
      views: number;
      likes: number;
    }

     const videosWithConfidence: VideoWithConfidence[] = videosRaw.map((video: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      const views = Number(video.view_count ?? 0);
      const likes = Number(video.like_count ?? 0);
      const wordCount = Number(video.word_count ?? 0);

      // Calculate confidence as a composite score (0-1)
      const engagementScore = views > 0 ? Math.min(likes / views, 1) : 0;
      const textQualityScore = Math.min((wordCount / 100) * 0.5, 1);
      const confidence = Math.min((engagementScore * 0.6 + textQualityScore * 0.4) * 1.2, 1);

      return {
        videoId: video.video_id || "unknown",
        confidence: Number.isNaN(confidence) ? 0 : confidence,
        views,
        likes,
      };
    });

    // Group by confidence ranges
    const confidenceRanges = [
      { label: "0-50%", min: 0, max: 0.5, count: 0 },
      { label: "50-70%", min: 0.5, max: 0.7, count: 0 },
      { label: "70-90%", min: 0.7, max: 0.9, count: 0 },
      { label: "90-100%", min: 0.9, max: 1.0, count: 0 },
    ];

    videosWithConfidence.forEach((video) => {
      const range = confidenceRanges.find(
        (r) => video.confidence >= r.min && video.confidence <= r.max
      );
      if (range) {
        range.count += 1;
      }
    });

    const distribution = confidenceRanges.map((range) => ({
      range: range.label,
      count: range.count,
      percentage: videosWithConfidence.length > 0 
        ? Math.round((range.count / videosWithConfidence.length) * 100)
        : 0,
    }));

    // Calculate average confidence
    const averageConfidence = videosWithConfidence.length > 0
      ? videosWithConfidence.reduce((sum, v) => sum + v.confidence, 0) / videosWithConfidence.length
      : 0;

    const finalResponse = {
      distribution,
      stats: {
        totalVideos: videosWithConfidence.length,
        averageConfidence: Number.isNaN(averageConfidence) ? 0 : averageConfidence,
        confidenceRanges: confidenceRanges,
      },
      series: [
        {
          name: "Jumlah Video",
          data: distribution.map((d) => d.count),
        },
      ],
      categories: distribution.map((d) => d.range),
    };

    const serialized = JSON.stringify(finalResponse, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    );

    return new NextResponse(serialized, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error("Confidence API Error:", error);
    return NextResponse.json(
      { error: "Database error", message: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
