import { NextResponse } from "next/server";
import { readJsonResponse } from "@/lib/fetchJson";

const FLASK_BASE_URL = process.env.FLASK_BACKEND_URL || "http://localhost:8000";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(`${FLASK_BASE_URL}/predict-youtube-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const result = await readJsonResponse(response);
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error("Gagal klasifikasi link YouTube:", error);
    return NextResponse.json(
      { status: "error", message: "Server Flask mati atau tidak terjangkau" },
      { status: 500 }
    );
  }
}
