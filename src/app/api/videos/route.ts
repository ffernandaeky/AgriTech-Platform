import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

const TOPIC_IDS: Record<string, number> = {
  "pengendalian hama": 0,
  pemupukan: 1,
  irigasi: 2,
  "budidaya organik": 3,
  hidroponik: 4,
};

const toBigIntOrNull = (value: unknown) => {
  if (value === null || value === undefined || value === "") return null;
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return null;
  return BigInt(Math.max(0, Math.trunc(numericValue)));
};

const toIntOrNull = (value: unknown) => {
  if (value === null || value === undefined || value === "") return null;
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return null;
  return Math.trunc(numericValue);
};

const toDateOrNull = (value: unknown) => {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeTopicKey = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

export async function GET() {
  try {
    const db = prisma as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    const videos = await db.hasil_prediksi_bert.findMany({
      orderBy: { published_at: "asc" },
    });
    const totalVideos = await db.hasil_prediksi_bert.count();

    const responseData = JSON.parse(
      JSON.stringify(
        { videos, totalVideos },
        (key, value) => (typeof value === "bigint" ? value.toString() : value)
      )
    );

    return NextResponse.json(responseData);
  } catch (error: unknown) {
    console.error("Videos API Error:", error);
    const message = error instanceof Error ? error.message : "Gagal memuat data";
    return NextResponse.json(
      { videos: [], totalVideos: 0, error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const video = body?.video ?? body;
    const videoId = String(video?.video_id ?? "").trim();
    const videoUrl = String(video?.video_url ?? (videoId ? `https://www.youtube.com/watch?v=${videoId}` : "")).trim();

    if (!videoId) {
      return NextResponse.json(
        { status: "error", message: "Video ID tidak ditemukan, data tidak bisa disimpan." },
        { status: 400 }
      );
    }

    const topic = normalizeTopicKey(
      body?.pred_label ?? video?.pred_label ?? video?.topic ?? video?.topic_raw
    );
    const predId =
      body?.pred_id !== null && body?.pred_id !== undefined && body?.pred_id !== ""
        ? Number(body.pred_id)
        : TOPIC_IDS[topic] ?? null;

    const db = prisma as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    const existingVideo = await db.hasil_prediksi_bert.findFirst({
      where: {
        OR: [
          { video_id: videoId },
          ...(videoUrl ? [{ video_url: videoUrl }] : []),
        ],
      },
    });

    if (existingVideo) {
      const responseData = JSON.parse(
        JSON.stringify(
          {
            status: "exists",
            message: "Video sudah ada di database, data tidak disimpan ulang.",
            video: existingVideo,
          },
          (_key, value) => (typeof value === "bigint" ? value.toString() : value)
        )
      );

      return NextResponse.json(responseData, { status: 200 });
    }

    const payload = {
      video_id: videoId,
      video_url: videoUrl || null,
      channel_name: video?.channel_name ?? null,
      published_at: toDateOrNull(video?.published_at),
      view_count: toBigIntOrNull(video?.view_count),
      like_count: toBigIntOrNull(video?.like_count),
      title: video?.title ?? null,
      description: video?.description ?? null,
      clean_text: video?.clean_text ?? `${video?.title ?? ""} ${video?.description ?? ""}`.trim(),
      word_count: toIntOrNull(video?.word_count),
      token_count: toIntOrNull(video?.token_count),
      topic_raw: topic || null,
      created_at: new Date(),
      label_id: toIntOrNull(video?.label_id),
      label_model: toIntOrNull(video?.label_model),
      label_source: video?.label_source ?? "direct_url_topic_mapping",
      pred_id: Number.isFinite(predId) ? predId : null,
      true_id: toIntOrNull(video?.true_id ?? video?.label_model),
      pred_label: topic || null,
      true_label: (video?.true_label ?? topic) || null,
    };

    const savedVideo = await db.hasil_prediksi_bert.create({ data: payload });

    const responseData = JSON.parse(
      JSON.stringify(
        {
          status: "success",
          message: "Video berhasil disimpan ke database.",
          video: savedVideo,
        },
        (_key, value) => (typeof value === "bigint" ? value.toString() : value)
      )
    );

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: unknown) {
    console.error("Save Video API Error:", error);
    const message = error instanceof Error ? error.message : "Gagal menyimpan video";
    return NextResponse.json(
      { status: "error", message },
      { status: 500 }
    );
  }
}
