import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";

const CRIMSON = "#800020";
const GOLD    = "#C5A059";
const STONE   = "#F5F0E6";
const SANS    = "'Inter', system-ui, sans-serif";

interface Props {
  imageSrc: string;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}

async function getCroppedBlob(imageSrc: string, pixelCrop: Area, rotation: number): Promise<Blob> {
  const image = await createImageBitmap(await fetch(imageSrc).then(r => r.blob()));
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  const rad = (rotation * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));
  const rotW = Math.floor(image.width * cos + image.height * sin);
  const rotH = Math.floor(image.width * sin + image.height * cos);

  // Intermediate canvas for rotation
  const rotCanvas = document.createElement("canvas");
  rotCanvas.width  = rotW;
  rotCanvas.height = rotH;
  const rotCtx = rotCanvas.getContext("2d")!;
  rotCtx.translate(rotW / 2, rotH / 2);
  rotCtx.rotate(rad);
  rotCtx.drawImage(image, -image.width / 2, -image.height / 2);

  canvas.width  = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.drawImage(
    rotCanvas,
    pixelCrop.x, pixelCrop.y,
    pixelCrop.width, pixelCrop.height,
    0, 0,
    pixelCrop.width, pixelCrop.height,
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(b => b ? resolve(b) : reject(new Error("Canvas empty")), "image/jpeg", 0.92);
  });
}

export default function CropModal({ imageSrc, onConfirm, onCancel }: Props) {
  const [crop, setCrop]           = useState({ x: 0, y: 0 });
  const [zoom, setZoom]           = useState(1);
  const [rotation, setRotation]   = useState(0);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [processing, setProcessing]   = useState(false);

  const onCropComplete = useCallback((_: Area, pixelCrop: Area) => {
    setCroppedArea(pixelCrop);
  }, []);

  const handleConfirm = async () => {
    if (!croppedArea) return;
    setProcessing(true);
    try {
      const blob = await getCroppedBlob(imageSrc, croppedArea, rotation);
      onConfirm(blob);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.85)",
      display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 20px", flexShrink: 0,
      }}>
        <button onClick={onCancel} style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, fontFamily: SANS }}>
          Cancel
        </button>
        <span style={{ color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: SANS }}>
          Adjust Photo
        </span>
        <button
          onClick={handleConfirm}
          disabled={processing}
          style={{
            color: processing ? "rgba(255,255,255,0.4)" : GOLD,
            fontSize: 14, fontWeight: 700, fontFamily: SANS,
          }}
        >
          {processing ? "Saving…" : "Use Photo"}
        </button>
      </div>

      {/* Crop area */}
      <div style={{ flex: 1, position: "relative" }}>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCropComplete={onCropComplete}
          style={{
            containerStyle: { background: "transparent" },
            cropAreaStyle: { border: `2px solid ${GOLD}` },
          }}
        />
      </div>

      {/* Controls */}
      <div style={{
        padding: "20px 24px 36px", flexShrink: 0,
        display: "flex", flexDirection: "column", gap: 16,
      }}>
        {/* Zoom */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", fontFamily: SANS, width: 52, letterSpacing: "0.06em" }}>
            ZOOM
          </span>
          <input
            type="range" min={1} max={3} step={0.01}
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            style={{ flex: 1, accentColor: CRIMSON, cursor: "pointer" }}
          />
        </div>

        {/* Rotation */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", fontFamily: SANS, width: 52, letterSpacing: "0.06em" }}>
            ROTATE
          </span>
          <input
            type="range" min={-180} max={180} step={1}
            value={rotation}
            onChange={e => setRotation(Number(e.target.value))}
            style={{ flex: 1, accentColor: CRIMSON, cursor: "pointer" }}
          />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: SANS, width: 36, textAlign: "right" }}>
            {rotation}°
          </span>
        </div>

        {/* Quick rotate buttons */}
        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          {[
            { label: "↺ 90°", delta: -90 },
            { label: "Reset",  delta: null },
            { label: "↻ 90°", delta: 90 },
          ].map(({ label, delta }) => (
            <button
              key={label}
              onClick={() => delta === null ? setRotation(0) : setRotation(r => Math.max(-180, Math.min(180, r + delta)))}
              style={{
                padding: "8px 18px",
                background: STONE,
                borderRadius: 8, fontSize: 13,
                fontWeight: 600, fontFamily: SANS,
                color: "#1a140e",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
