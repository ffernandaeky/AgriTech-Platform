import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Ambil 3 video terpopuler kategori Hidroponik
    const topVideos = await prisma.hasil_prediksi_bert.findMany({
      where: {
        pred_label: { equals: "hidroponik", mode: "insensitive" },
      },
      take: 3,
      orderBy: { view_count: "desc" },
    });

    // 2. Ambil semua video kategori Hidroponik
    const allVideos = await prisma.hasil_prediksi_bert.findMany({
      where: {
        pred_label: { equals: "hidroponik", mode: "insensitive" },
      },
      orderBy: { published_at: "asc" },
    });

    const responseData = JSON.parse(
      JSON.stringify({ topVideos, allVideos }, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("API Error Hidroponik:", error);
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}
