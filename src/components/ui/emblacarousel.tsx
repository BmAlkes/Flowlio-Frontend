import React, {
  Fragment,
  useCallback,
  type ReactNode,
  type CSSProperties,
} from "react";
import {
  EmblaOptionsType,
  EmblaCarouselType,
  type EmblaPluginType,
} from "embla-carousel";
import { DotButton, useDotButton } from "./emblacarouseldotbutton";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";
import { Flex } from "./flex";
import { Box } from "./box";

type EmblaCarouselProps = {
  children?: (emblaApi: EmblaCarouselType) => ReactNode;
  slidesContainerClassName?: string;
  dotContainerClassName?: string;
  dotInActiveClassName?: string;
  dotActiveClassName?: string;
  plugins?: EmblaPluginType[];
  carouselClassName?: string;
  options?: EmblaOptionsType;
  withOutDots?: boolean;
  style?: CSSProperties;
  slides: ReactNode[];
};

export const EmblaCarousel: React.FC<EmblaCarouselProps> = ({
  slidesContainerClassName,
  dotContainerClassName,
  dotInActiveClassName,
  withOutDots = false,
  dotActiveClassName,
  carouselClassName,
  children,
  options,
  plugins,
  slides,
  style,
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(options as any, plugins as any);

  const onNavButtonClick = useCallback((emblaApi: EmblaCarouselType) => {
    const autoplay = emblaApi?.plugins()?.autoplay as any;
    if (!autoplay) return;
    if ((autoplay.options as any)?.stopOnInteraction === false) {
      (autoplay as any).reset();
    } else {
      (autoplay as any).stop();
    }
  }, []);

  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(
    emblaApi as any,
    onNavButtonClick
  );

  return (
    <Box className={carouselClassName} style={style}>
      <Box className="overflow-hidden size-full" ref={emblaRef}>
        <Flex className={cn("flex h-full", slidesContainerClassName)}>
          {slides.map((node, key) => (
            <Fragment key={key}>{node}</Fragment>
          ))}
        </Flex>
      </Box>
      {!withOutDots && (
        <Flex className={cn("flex justify-center", dotContainerClassName)}>
          {scrollSnaps.map((_, key) => (
            <DotButton
              key={key}
              onClick={() => onDotButtonClick(key)}
              className={`size-2.5 rounded-full transition-colors ${
                key === selectedIndex
                  ? dotActiveClassName
                  : dotInActiveClassName
              }`}
            />
          ))}
        </Flex>
      )}
      {emblaApi && children && children(emblaApi as any)}
    </Box>
  );
};
