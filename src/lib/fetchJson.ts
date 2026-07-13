export async function readJsonResponse<T = unknown>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") || "";
  const bodyText = await response.text();

  if (!contentType.includes("application/json")) {
    throw new Error(
      `Expected JSON response but received ${contentType || "unknown content type"} with status ${response.status}.`
    );
  }

  if (!bodyText.trim()) {
    return null as T;
  }

  try {
    return JSON.parse(bodyText) as T;
  } catch {
    throw new Error(`Invalid JSON response with status ${response.status}.`);
  }
}

export async function fetchJson<T = unknown>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const json = await readJsonResponse<T>(response);

  if (!response.ok) {
    const message =
      typeof json === "object" && json && "message" in json
        ? String((json as { message?: unknown }).message)
        : `Request failed with status ${response.status}.`;
    throw new Error(message);
  }

  return json;
}
