import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const topVideos = await prisma.hasil_prediksi_bert.findMany({
      where: {
        pred_label: { equals: "pengendalian hama", mode: "insensitive" },
      },
      take: 3,
      orderBy: { view_count: "desc" },
    });

    const allVideos = await prisma.hasil_prediksi_bert.findMany({
      where: {
        pred_label: { equals: "pengendalian hama", mode: "insensitive" },
      },
      orderBy: { published_at: "asc" },
    });

    const responseData = JSON.parse(
      JSON.stringify({ topVideos, allVideos }, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    return NextResponse.json(responseData);
  } catch {
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}
