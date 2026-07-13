import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Ambil 3 video terpopuler kategori Irigasi
    const topVideos = await prisma.hasil_prediksi_bert.findMany({
      where: {
        pred_label: { equals: "irigasi", mode: "insensitive" },
      },
      take: 3,
      orderBy: { view_count: "desc" },
    });

    // 2. Ambil semua video kategori Irigasi
    const allVideos = await prisma.hasil_prediksi_bert.findMany({
      where: {
        pred_label: { equals: "irigasi", mode: "insensitive" },
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
    console.error("API Error Irigasi:", error);
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}
