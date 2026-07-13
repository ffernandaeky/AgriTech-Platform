import { NextResponse } from "next/server";
import { readJsonResponse } from "@/lib/fetchJson";

const FLASK_BASE_URL = process.env.FLASK_BACKEND_URL || "http://localhost:8000";

export async function GET() {
  try {
    const [statusResponse, reportResponse] = await Promise.all([
      fetch(`${FLASK_BASE_URL}/bert-status`, { cache: "no-store" }),
      fetch(`${FLASK_BASE_URL}/bert-report`, { cache: "no-store" }),
    ]);

    const statusResult = await readJsonResponse<{ data?: unknown }>(statusResponse);
    const reportResult = await readJsonResponse<{ data?: unknown }>(reportResponse);

    return NextResponse.json({
      status: statusResult?.data || null,
      report: reportResult?.data || null,
    });
  } catch (error) {
    console.error("Gagal mengambil report BERT:", error);
    return NextResponse.json(
      { status: null, report: null, message: "Server Flask mati atau report belum tersedia" },
      { status: 500 }
    );
  }
}
