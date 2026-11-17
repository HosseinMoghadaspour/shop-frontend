import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ImagePlus, Loader2, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type ImageCropDialogProps = {
  files: File[];
  aspectRatio: number;
  outputWidth: number;
  title: string;
  onComplete: (files: File[]) => void;
  onCancel: () => void;
};

type ImageSize = { width: number; height: number };

export function ImageCropDialog({
  files,
  aspectRatio,
  outputWidth,
  title,
  onComplete,
  onCancel,
}: ImageCropDialogProps) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState<ImageSize | null>(null);
  const [frameSize, setFrameSize] = useState<ImageSize>({ width: 640, height: 640 / aspectRatio });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState<File[]>([]);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);
  const file = files[index];
  const previewUrl = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => () => URL.revokeObjectURL(previewUrl), [previewUrl]);

  useEffect(() => {
    const image = new Image();
    image.onload = () => setImageSize({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => setError("خواندن تصویر انتخاب‌شده ممکن نیست.");
    image.src = previewUrl;
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setImageSize(null);
    setError(null);
  }, [previewUrl]);

  const frameWidth = 640;
  const frameHeight = frameWidth / aspectRatio;
  const baseScale = imageSize
    ? Math.max(frameWidth / imageSize.width, frameHeight / imageSize.height)
    : 1;
  const renderedWidth = (imageSize?.width ?? 0) * baseScale * zoom;
  const renderedHeight = (imageSize?.height ?? 0) * baseScale * zoom;
  const maxX = Math.max(0, (renderedWidth - frameWidth) / 2);
  const maxY = Math.max(0, (renderedHeight - frameHeight) / 2);

  function moveImage(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return;
    const dx = event.clientX - dragRef.current.x;
    const dy = event.clientY - dragRef.current.y;
    setOffset({
      x: Math.max(-maxX, Math.min(maxX, dragRef.current.startX + dx)),
      y: Math.max(-maxY, Math.min(maxY, dragRef.current.startY + dy)),
    });
  }

  async function cropCurrent() {
    const frame = frameRef.current;
    if (!frame || !imageSize || !file) return;
    setBusy(true);
    setError(null);
    try {
      const scale = baseScale * zoom;
      const sourceX = Math.max(0, Math.min(imageSize.width, (frameWidth / 2 - offset.x - frameWidth / 2 + (renderedWidth - frameWidth) / 2) / scale));
      const sourceY = Math.max(0, Math.min(imageSize.height, (frameHeight / 2 - offset.y - frameHeight / 2 + (renderedHeight - frameHeight) / 2) / scale));
      const sourceWidth = Math.min(imageSize.width - sourceX, frameWidth / scale);
      const sourceHeight = Math.min(imageSize.height - sourceY, frameHeight / scale);
      const canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = Math.round(outputWidth / aspectRatio);
      const context = canvas.getContext("2d");
      if (!context) throw new Error("امکان پردازش تصویر وجود ندارد.");
      if (file.type !== "image/png") {
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
      const image = new Image();
      image.src = previewUrl;
      await image.decode();
      context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
      const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((value) => value ? resolve(value) : reject(new Error("ساخت تصویر برش‌خورده ناموفق بود.")), mimeType, 0.92);
      });
      const cropped = new File([blob], file.name.replace(/\\.[^.]+$/, "") + (mimeType === "image/png" ? ".png" : ".jpg"), {
        type: mimeType,
        lastModified: Date.now(),
      });
      const next = [...completed, cropped];
      if (index < files.length - 1) {
        setCompleted(next);
        setIndex((value) => value + 1);
      } else {
        onComplete(next);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "برش تصویر ناموفق بود.");
    } finally {
      setBusy(false);
    }
  }

  function changeZoom(value: number[]) {
    setZoom(value[0] ?? 1);
    setOffset({ x: 0, y: 0 });
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label="برش تصویر">
      <div dir="rtl" className="w-full max-w-3xl overflow-hidden rounded-2xl bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h2 className="font-bold">{title}</h2>
            <p className="mt-1 text-xs text-muted-foreground">تصویر {index + 1} از {files.length} · با کشیدن تصویر، کادر را تنظیم کنید</p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onCancel} disabled={busy} aria-label="بستن"><X className="size-5" /></Button>
        </div>
        <div className="space-y-4 p-4 sm:p-5">
          <div className="flex justify-center overflow-hidden rounded-xl bg-neutral-950 p-2">
            <div
              ref={frameRef}
              className="relative max-h-[55vh] w-full touch-none cursor-grab overflow-hidden bg-neutral-900 active:cursor-grabbing"
              style={{ aspectRatio: String(aspectRatio), maxWidth: 640 }}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                dragRef.current = { x: event.clientX, y: event.clientY, startX: offset.x, startY: offset.y };
              }}
              onPointerMove={moveImage}
              onPointerUp={() => { dragRef.current = null; }}
              onPointerCancel={() => { dragRef.current = null; }}
            >
              {imageSize && (
                <img
                  src={previewUrl}
                  alt="پیش‌نمایش برش"
                  draggable={false}
                  className="pointer-events-none absolute max-w-none select-none"
                  style={{
                    width: renderedWidth,
                    height: renderedHeight,
                    left: `calc(50% - ${renderedWidth / 2}px + ${offset.x}px)`,
                    top: `calc(50% - ${renderedHeight / 2}px + ${offset.y}px)`,
                  }}
                />
              )}
              {!imageSize && <div className="flex h-full items-center justify-center text-sm text-white"><Loader2 className="ml-2 size-5 animate-spin" /> در حال آماده‌سازی تصویر...</div>}
              <div className="pointer-events-none absolute inset-0 border-2 border-white/90 shadow-[0_0_0_999px_rgba(0,0,0,0.38)]" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" size="icon" variant="outline" onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }} aria-label="بازنشانی برش"><RotateCcw className="size-4" /></Button>
            <span className="shrink-0 text-xs text-muted-foreground">بزرگ‌نمایی</span>
            <Slider min={1} max={3} step={0.05} value={[zoom]} onValueChange={changeZoom} />
            <span className="w-10 text-left text-xs tabular-nums">{zoom.toFixed(1)}×</span>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
            <p className="text-xs text-muted-foreground">نسبت تصویر: {aspectRatio === 1 ? "۱:۱ مربع" : aspectRatio === 3 ? "۳:۱ افقی" : aspectRatio.toFixed(2)}</p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>انصراف</Button>
              <Button type="button" onClick={() => void cropCurrent()} disabled={!imageSize || busy}>
                {busy ? <Loader2 className="ml-2 size-4 animate-spin" /> : index === files.length - 1 ? <Check className="ml-2 size-4" /> : <ImagePlus className="ml-2 size-4" />}
                {index === files.length - 1 ? "تأیید و ادامه آپلود" : "تأیید و تصویر بعدی"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
