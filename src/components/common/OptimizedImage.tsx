import { useState, useEffect, useRef, ImgHTMLAttributes } from "react";

interface OptimizedImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "loading"> {
  src: string;
  alt: string;
  placeholder?: string;
  fallback?: string;
  sizes?: string;
  priority?: boolean;
}

export const OptimizedImage = ({
  src,
  alt,
  placeholder = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg==",
  fallback,
  sizes = "100vw",
  priority = false,
  className = "",
  ...props
}: OptimizedImageProps) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority) {
      setImageSrc(src);
    }
  }, [src, priority]);

  useEffect(() => {
    if (!priority && imgRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setImageSrc(src);
              observer.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: "50px",
        }
      );

      observer.observe(imgRef.current);
      return () => observer.disconnect();
    }
  }, [src, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    if (fallback && !hasError) {
      setHasError(true);
      setImageSrc(fallback);
    }
  };

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      sizes={sizes}
      className={`transition-opacity duration-300 ${
        isLoaded ? "opacity-100" : "opacity-0"
      } ${className}`}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
};

// WebP support detection and fallback
export const useWebPSupport = () => {
  const [supportsWebP, setSupportsWebP] = useState(false);

  useEffect(() => {
    const checkWebPSupport = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const dataURL = canvas.toDataURL("image/webp");
        setSupportsWebP(dataURL.indexOf("data:image/webp") === 0);
      }
    };

    checkWebPSupport();
  }, []);

  return supportsWebP;
};

// Utility function to get optimized image URL
export const getOptimizedImageUrl = (
  originalSrc: string
  //   width: number,
  //   height?: number,
  //   format: "webp" | "jpeg" | "png" = "webp"
) => {
  // If using a CDN like Cloudinary, you can implement image transformation here
  // For now, return the original source
  return originalSrc;
};
