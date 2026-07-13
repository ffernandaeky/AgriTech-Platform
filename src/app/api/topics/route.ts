import prisma from "@/lib/prisma";
import { slugifyTopic, uniqueTopics } from "@/lib/topics";
import { NextResponse } from "next/server";

export async function GET() {
  try {
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

    return NextResponse.json({
      topics,
      topicBySlug: Object.fromEntries(topics.map((topic) => [slugifyTopic(topic.label), topic.label])),
    });
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error("Topics API Error:", error);
    return NextResponse.json({ topics: [], error: error?.message || "Database error" }, { status: 500 });
  }
}
