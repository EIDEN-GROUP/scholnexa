/**
 * OptimizedImage - Smart image component with WebP support and lazy loading
 * 
 * Features:
 * - WebP with PNG/JPG fallback
 * - Responsive srcSet
 * - Native lazy loading
 * - Proper aspect ratio preservation
 * - SEO-friendly alt text
 * 
 * Usage:
 *   <OptimizedImage 
 *     src="/logos/essor-mark"
 *     alt="Essor logo"
 *     width={256}
 *     height={256}
 *     sizes="(max-width: 768px) 64px, 256px"
 *   />
 */

import { type ImgHTMLAttributes } from 'react';
import { BRAND } from '@/lib/brand';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  /** Base path without extension (e.g., "/logos/essor-mark") */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
  /** Sizes attribute for responsive images */
  sizes?: string;
  /** Available image sizes */
  variants?: number[];
  /** Enable lazy loading (default: true) */
  lazy?: boolean;
  /** Priority loading (disables lazy load for above-fold images) */
  priority?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  sizes,
  variants = [64, 128, 256, 512],
  lazy = true,
  priority = false,
  className,
  ...props
}: OptimizedImageProps) {
  // Generate srcSet for WebP
  const webpSrcSet = variants
    .map((size) => `${src}-${size}.webp ${size}w`)
    .join(', ');

  // Generate srcSet for fallback (PNG/JPG)
  const fallbackExt = src.includes('/logos/') ? 'png' : 'jpg';
  const fallbackSrcSet = variants
    .map((size) => `${src}-${size}.${fallbackExt} ${size}w`)
    .join(', ');

  // Default fallback image
  const fallbackSrc = `${src}-${Math.max(...variants)}.${fallbackExt}`;

  const loadingStrategy = priority ? 'eager' : lazy ? 'lazy' : undefined;

  return (
    <picture>
      {/* WebP source */}
      <source
        type="image/webp"
        srcSet={webpSrcSet}
        sizes={sizes}
      />
      
      {/* Fallback source */}
      <source
        type={`image/${fallbackExt === 'jpg' ? 'jpeg' : fallbackExt}`}
        srcSet={fallbackSrcSet}
        sizes={sizes}
      />
      
      {/* Actual img element */}
      <img
        src={fallbackSrc}
        alt={alt}
        width={width}
        height={height}
        loading={loadingStrategy}
        decoding="async"
        className={className}
        {...props}
      />
    </picture>
  );
}

/**
 * LogoImage - Specialized component for Essor logo
 */
export function LogoImage({
  size = 64,
  variant = 'mark',
  alt = 'Essor',
  className,
  ...props
}: {
  size?: 64 | 128 | 256 | 512;
  variant?: 'mark' | 'wordmark' | 'wordmark-light';
  alt?: string;
  className?: string;
} & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width' | 'height' | 'alt'>) {
  // Use SVG for logos (better quality, smaller file size)
  const svgSrc = variant === 'mark' 
    ? BRAND.logoMarkPath
    : variant === 'wordmark'
    ? BRAND.logoPath
    : BRAND.logoDarkPath;

  return (
    <img
      src={svgSrc}
      alt={alt}
      width={size}
      height={size}
      className={className}
      {...props}
    />
  );
}

/**
 * HeroImage - Component for hero section images with optimization
 */
export function HeroImage({
  src,
  alt,
  priority = true,
  className,
  ...props
}: Omit<OptimizedImageProps, 'width' | 'height'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={1200}
      height={800}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
      variants={[640, 960, 1200, 1920]}
      priority={priority}
      className={className}
      {...props}
    />
  );
}

/**
 * Example usage in components:
 * 
 * // In brand-loader.tsx - use SVG logo
 * import { LogoImage } from '@/components/optimized-image';
 * <LogoImage size={128} variant="mark" />
 * 
 * // In landing page hero
 * import { HeroImage } from '@/components/optimized-image';
 * <HeroImage 
 *   src="/dashboard-preview"
 *   alt="Essor dashboard interface"
 *   priority
 * />
 * 
 * // For other images
 * import { OptimizedImage } from '@/components/optimized-image';
 * <OptimizedImage
 *   src="/features/planning"
 *   alt="Planning interface"
 *   width={600}
 *   height={400}
 *   sizes="(max-width: 768px) 100vw, 600px"
 * />
 */
