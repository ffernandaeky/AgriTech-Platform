import prisma from "@/lib/prisma";
import { slugifyTopic, uniqueTopics } from "@/lib/topics";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ topic: string }> }
) {
  try {
    const { topic: topicSlug } = await context.params;
    const db = prisma as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    const keywordTopics = await db.keyword_scraping.findMany({
      select: { topic: true },
      distinct: ["topic"],
    });

    const predictedTopics = await db.hasil_prediksi_bert.findMany({
      select: { pred_label: true },
      distinct: ["pred_label"],
      where: { pred_label: { not: null } },
    });

    const topics = uniqueTopics([
      ...keywordTopics.map((item: { topic?: string }) => item.topic),
      ...predictedTopics.map((item: { pred_label?: string }) => item.pred_label),
    ]);

    const topic = topics.find((item) => item.slug === topicSlug);
    if (!topic) {
      return NextResponse.json({ topVideos: [], allVideos: [], topic: null }, { status: 404 });
    }

    const topVideos = await db.hasil_prediksi_bert.findMany({
      where: {
        pred_label: { equals: topic.label, mode: "insensitive" },
      },
      take: 3,
      orderBy: { view_count: "desc" },
    });

    const allVideos = await db.hasil_prediksi_bert.findMany({
      where: {
        pred_label: { equals: topic.label, mode: "insensitive" },
      },
      orderBy: { published_at: "asc" },
    });

    const responseData = JSON.parse(
      JSON.stringify(
        { topic: { ...topic, slug: slugifyTopic(topic.label) }, topVideos, allVideos },
        (key, value) => (typeof value === "bigint" ? value.toString() : value)
      )
    );

    return NextResponse.json(responseData);
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error("Dynamic Topic API Error:", error);
    return NextResponse.json({ error: error?.message || "Gagal memuat data" }, { status: 500 });
  }
}
