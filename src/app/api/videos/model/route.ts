import { NextResponse } from "next/server";
import { readJsonResponse } from "@/lib/fetchJson";

const FLASK_BASE_URL = process.env.FLASK_BACKEND_URL || "http://localhost:8000";

export async function GET() {
  try {
    const response = await fetch(`${FLASK_BASE_URL}/get-bert-predictions`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    const result = await readJsonResponse<{ status?: string; data?: unknown }>(response);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Gagal terhubung ke Flask", detail: result },
        { status: response.status }
      );
    }

    if (result.status === "success" && Array.isArray(result.data)) {
      return NextResponse.json(result.data);
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error("Gagal koneksi ke Flask:", error);
    return NextResponse.json({ error: "Server Flask mati atau tidak terjangkau" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const response = await fetch(`${FLASK_BASE_URL}/run-bert-model`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    const result = await readJsonResponse(response);
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error("Gagal menjalankan model BERT:", error);
    return NextResponse.json(
      { status: "error", message: "Server Flask mati atau tidak terjangkau" },
      { status: 500 }
    );
  }
}
