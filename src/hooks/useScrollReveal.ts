import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Direction = "up" | "left" | "right" | "scale";

interface ScrollRevealOptions {
  direction?: Direction;
  delay?: number;
  duration?: number;
  distance?: number;
  stagger?: number;
}

export function useScrollReveal<T extends HTMLElement>(
  options: ScrollRevealOptions = {}
) {
  const ref = useRef<T>(null);
  const {
    direction = "up",
    delay = 0,
    duration = 0.8,
    distance = 40,
    stagger = 0,
  } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = stagger > 0 ? el.children : el;

    const from: gsap.TweenVars = {
      opacity: 0,
      duration,
      delay,
      ease: "power3.out",
      ...(stagger > 0 && { stagger }),
    };

    switch (direction) {
      case "up":
        from.y = distance;
        break;
      case "left":
        from.x = distance;
        break;
      case "right":
        from.x = -distance;
        break;
      case "scale":
        from.scale = 0.92;
        break;
    }

    gsap.from(targets, {
      ...from,
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        once: true,
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill();
      });
    };
  }, [direction, delay, duration, distance, stagger]);

  return ref;
}

export function useParallax<T extends HTMLElement>(speed: number = 0.15) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    gsap.to(el, {
      yPercent: speed * 100,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill();
      });
    };
  }, [speed]);

  return ref;
}
