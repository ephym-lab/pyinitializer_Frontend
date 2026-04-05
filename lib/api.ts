import type { ProjectConfig, PreviewResponse, SearchResponse } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
console.log("API_URL:", API_URL);

export async function searchPackages(
  query: string,
  limit: number = 20
): Promise<SearchResponse> {
  const res = await fetch(
    `${API_URL}/search/packages?q=${encodeURIComponent(query)}&limit=${limit}`
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Search failed");
  }
  return res.json();
}

export async function getPreview(
  config: ProjectConfig
): Promise<PreviewResponse> {
  const res = await fetch(`${API_URL}/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Preview failed");
  }
  return res.json();
}

export async function downloadZip(
  config: ProjectConfig
): Promise<{ blob: Blob; venvExcluded: boolean }> {
  const res = await fetch(`${API_URL}/api/v1/projects/zip`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Generation failed");
  }
  const venvExcluded = res.headers.get("X-Venv-Excluded") === "true";
  const blob = await res.blob();
  return { blob, venvExcluded };
}

export async function downloadScript(
  config: ProjectConfig
): Promise<string> {
  const res = await fetch(`${API_URL}/api/v1/projects/script`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Script generation failed");
  }
  return res.text();
}
