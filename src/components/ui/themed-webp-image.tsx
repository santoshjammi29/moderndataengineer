"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  type DiagramTheme,
  getThemedWebpVariants,
  getWebpThemeClass,
} from "@/lib/diagram-theme";

interface ThemedWebpImageProps {
  src: string;
  alt: string;
  theme: DiagramTheme;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
  useNextImage?: boolean;
}

/**
 * Renders pre-rendered -dark.webp and -light.webp variants switched synchronously
 * via `html[data-diagram-theme]` CSS rules (zero SSR/hydration flash) while
 * maintaining lazy loading, dimensions, alt text, and theme classes.
 */
export function ThemedWebpImage({
  src,
  alt,
  theme,
  fill = false,
  width,
  height,
  sizes,
  className,
  style,
  priority = false,
  useNextImage = true,
}: ThemedWebpImageProps) {
  const variants = getThemedWebpVariants(src);
  const isDark = theme === "dark";
  const darkThemeClass = isDark ? getWebpThemeClass("dark", src) : undefined;
  const lightThemeClass = !isDark ? getWebpThemeClass("light", src) : undefined;

  if (!useNextImage) {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={variants.dark}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          aria-hidden={!isDark}
          style={style}
          className={cn(className, "diagram-variant-dark", darkThemeClass)}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={variants.light}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          aria-hidden={isDark}
          style={style}
          className={cn(className, "diagram-variant-light", lightThemeClass)}
        />
      </>
    );
  }

  return (
    <>
      <Image
        src={variants.dark}
        alt={alt}
        fill={fill || undefined}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        sizes={sizes}
        loading="lazy"
        aria-hidden={!isDark}
        style={style}
        className={cn(className, "diagram-variant-dark", darkThemeClass)}
      />
      <Image
        src={variants.light}
        alt={alt}
        fill={fill || undefined}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        sizes={sizes}
        loading="lazy"
        aria-hidden={isDark}
        style={style}
        className={cn(className, "diagram-variant-light", lightThemeClass)}
      />
    </>
  );
}
