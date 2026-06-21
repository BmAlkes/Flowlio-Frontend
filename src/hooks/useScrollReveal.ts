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
    duration = 0.7,
    distance = 30,
    stagger = 0,
  } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = stagger > 0 ? el.children : el;

    const fromVars: gsap.TweenVars = { opacity: 0 };
    const toVars: gsap.TweenVars = {
      opacity: 1,
      duration,
      delay,
      ease: "power2.out",
      ...(stagger > 0 && { stagger }),
    };

    switch (direction) {
      case "up":
        fromVars.y = distance;
        toVars.y = 0;
        break;
      case "left":
        fromVars.x = distance;
        toVars.x = 0;
        break;
      case "right":
        fromVars.x = -distance;
        toVars.x = 0;
        break;
      case "scale":
        fromVars.scale = 0.95;
        toVars.scale = 1;
        break;
    }

    gsap.set(targets, fromVars);

    gsap.to(targets, {
      ...toVars,
      scrollTrigger: {
        trigger: el,
        start: "top 90%",
        end: "top 20%",
        toggleActions: "play none none none",
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
