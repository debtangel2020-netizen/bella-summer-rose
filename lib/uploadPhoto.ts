/** Browser-side helper: shrinks a phone photo to max 1600px JPEG and uploads it. Returns the photo URL. */
async function shrink(file: File): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    if (blob) return blob;
  } catch {
    /* fall through and upload the original */
  }
  return file;
}

export async function uploadPhoto(file: File): Promise<string> {
  const blob = await shrink(file);
  if (blob.size > 4.4 * 1024 * 1024) throw new Error(`"${file.name}" is too large. Try a smaller photo.`);
  const fd = new FormData();
  fd.append("file", blob, file.name.replace(/\.\w+$/, "") + ".jpg");
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) throw new Error(data.error || "Upload failed.");
  return data.url as string;
}
