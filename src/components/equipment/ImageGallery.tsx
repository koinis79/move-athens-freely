import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  images: string[];
  alt: string;
}

const ImageGallery = ({ images, alt }: Props) => {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
        <img
          src={images[active] ?? "/placeholder.svg"}
          alt={alt}
          className="h-full w-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
        />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={cn(
              "shrink-0 aspect-[4/3] w-20 overflow-hidden rounded-lg border-2 bg-muted transition-all",
              active === i
                ? "border-primary ring-2 ring-primary/20"
                : "border-transparent opacity-70 hover:opacity-100"
            )}
          >
            <img
              src={src}
              alt={`${alt} thumbnail ${i + 1}`}
              className="h-full w-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
