'use client';
import {
  motion,
  type Transition,
  type UseInViewOptions,
  useInView,
} from 'motion/react';

import * as React from 'react';

const ENTRY_ANIMATION = {
  initial: { rotateX: 0 },
  animate: { rotateX: 90 },
};

const EXIT_ANIMATION = {
  initial: { rotateX: 90 },
  animate: { rotateX: 0 },
};

const formatCharacter = (char: string) => (char === ' ' ? '\u00A0' : char);

type RollingTextProps = Omit<React.ComponentProps<'span'>, 'children'> & {
  transition?: Transition;
  inView?: boolean;
  inViewMargin?: UseInViewOptions['margin'];
  inViewOnce?: boolean;
  text: string;
};

function RollingText({
  ref,
  transition = { duration: 0.5, delay: 0.1, ease: 'easeOut' },
  inView = false,
  inViewMargin = '0px',
  inViewOnce = true,
  text,
  className,
  style,
  ...props
}: RollingTextProps) {
  const localRef = React.useRef<HTMLSpanElement>(null);
  if (ref) {
    React.useImperativeHandle(ref, () => localRef.current as HTMLSpanElement);
  }

  const inViewResult = useInView(localRef, {
    once: inViewOnce,
    margin: inViewMargin,
  });
  const isInView = !inView || inViewResult;

  const characters = React.useMemo(() => text.split(''), [text]);

  // Extract gradient-related classes that need to be on text elements
  const gradientClasses = React.useMemo(() => {
    if (!className) return '';
    return className
      .split(' ')
      .filter(
        (cls) =>
          cls &&
          (cls.includes('bg-clip-text') ||
            cls.includes('text-transparent') ||
            cls.includes('bg-size') ||
            cls.includes('animate-') ||
            cls.includes('drop-shadow')),
      )
      .join(' ')
      .trim();
  }, [className]);

  // Get other classes for root span
  const rootClasses = React.useMemo(() => {
    if (!className) return '';
    return className
      .split(' ')
      .filter(
        (cls) =>
          cls &&
          !cls.includes('bg-clip-text') &&
          !cls.includes('text-transparent') &&
          !cls.includes('bg-size') &&
          !cls.includes('animate-') &&
          !cls.includes('drop-shadow'),
      )
      .join(' ')
      .trim();
  }, [className]);

  return (
    <span
      data-slot="rolling-text"
      className={rootClasses}
      ref={localRef}
      {...props}
    >
      {characters.map((char, idx) => (
        <span
          key={idx}
          className="relative inline-block perspective-[9999999px] transform-3d w-auto"
          aria-hidden="true"
        >
          <motion.span
            className={`absolute inline-block backface-hidden origin-[50%_25%]${gradientClasses ? ` ${gradientClasses}` : ''}`}
            style={style}
            initial={ENTRY_ANIMATION.initial}
            animate={isInView ? ENTRY_ANIMATION.animate : undefined}
            transition={{
              ...transition,
              delay: idx * (transition?.delay ?? 0),
            }}
          >
            {formatCharacter(char)}
          </motion.span>
          <motion.span
            className={`absolute inline-block backface-hidden origin-[50%_100%]${gradientClasses ? ` ${gradientClasses}` : ''}`}
            style={style}
            initial={EXIT_ANIMATION.initial}
            animate={isInView ? EXIT_ANIMATION.animate : undefined}
            transition={{
              ...transition,
              delay: idx * (transition?.delay ?? 0) + 0.3,
            }}
          >
            {formatCharacter(char)}
          </motion.span>
          <span className="invisible">{formatCharacter(char)}</span>
        </span>
      ))}

      <span className="sr-only">{text}</span>
    </span>
  );
}

export { RollingText, type RollingTextProps };
