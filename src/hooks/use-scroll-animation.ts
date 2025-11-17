import { type UseInViewOptions, useInView } from 'motion/react';
import { useRef } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number;
  margin?: UseInViewOptions['margin'];
  once?: boolean;
}

export function useScrollAnimation({
  threshold = 0.1,
  margin = '0px 0px -100px 0px',
  once = true,
}: UseScrollAnimationOptions = {}) {
  const elementRef = useRef<HTMLElement>(null);
  const isInView = useInView(elementRef, {
    amount: threshold,
    margin,
    once,
  });

  return { ref: elementRef, isVisible: isInView };
}
