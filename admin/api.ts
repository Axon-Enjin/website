export type Person = { id: string; email: string; name: string };

export type MediaItem = {
  id: string;
  kind: "image" | "video";
  mime: string;
  bytes: number;
  width: number | null;
  height: number | null;
  alt: string;
  originalName: string;
  createdAt: string;
};

let csrf = "";

export class ApiError extends Error {
  errors: string[];
  status: number;
  constructor(message: string, status: number, errors: string[] = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export function setCsrf(value: string) {
  csrf = value;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const body = init.body;
  if (body && !(body instanceof FormData) && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  if (csrf && init.method && init.method !== "GET" && init.method !== "HEAD") headers.set("x-csrf", csrf);
  const response = await fetch(path, { ...init, headers });
  const text = await response.text();
  const data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  if (typeof data.csrf === "string") csrf = data.csrf;
  if (!response.ok) {
    const errors = Array.isArray(data.errors) ? data.errors.map(String) : [];
    throw new ApiError(typeof data.error === "string" ? data.error : "Request failed", response.status, errors);
  }
  return data as T;
}

export async function uploadImage(file: File, alt: string) {
  const prepared = await prepareImage(file);
  const form = new FormData();
  form.set("file", prepared.display, prepared.name);
  if (prepared.thumb) form.set("thumb", prepared.thumb, "thumb.webp");
  form.set("alt", alt);
  form.set("width", String(prepared.width));
  form.set("height", String(prepared.height));
  return api<{ media: MediaItem }>("/api/admin/media", { method: "POST", body: form });
}

export async function uploadVideo(file: File) {
  return api<{ media: MediaItem }>("/api/admin/media/video", {
    method: "POST",
    headers: { "content-type": "video/mp4", "x-filename": file.name },
    body: file,
  });
}

async function prepareImage(file: File) {
  if (file.type === "image/gif" || file.name.toLowerCase().endsWith(".gif")) {
    const size = await measure(file);
    const thumb = await resize(file, 480, "image/webp");
    return { display: file, thumb: thumb.blob, width: size.width, height: size.height, name: file.name };
  }
  const display = await resize(file, 1600, "image/webp");
  const thumb = await resize(file, 480, "image/webp");
  return { display: display.blob, thumb: thumb.blob, width: display.width, height: display.height, name: "image.webp" };
}

function measure(file: File) {
  return draw(file, Number.POSITIVE_INFINITY, "image/png");
}

async function resize(file: File, max: number, type: string) {
  try {
    return await draw(file, max, type);
  } catch {
    return draw(file, max, "image/jpeg");
  }
}

function draw(file: File, max: number, type: string) {
  return new Promise<{ blob: Blob; width: number; height: number }>((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      const scale = Math.min(1, max / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * (Number.isFinite(scale) ? scale : 1)));
      const height = Math.max(1, Math.round(image.height * (Number.isFinite(scale) ? scale : 1)));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        reject(new Error("Could not read that image."));
        return;
      }
      context.drawImage(image, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) reject(new Error("Could not prepare that image."));
          else resolve({ blob, width, height });
        },
        type,
        0.86,
      );
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image."));
    };
    image.src = url;
  });
}
