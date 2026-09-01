/**
 * Standardized Button Components
 * Based on Essor Brand Book and design reference
 */

import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  | 'onDrag'
  | 'onDragEnd'
  | 'onDragStart'
  | 'onAnimationStart'
  | 'onAnimationEnd'
  | 'onAnimationIteration'
>;

interface ButtonProps extends NativeButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wider transition-all duration-250 ease-out disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-gradient-to-br from-[#2563EB] to-[#1E40AF] text-white shadow-[0_8px_30px_-10px_rgba(37,99,235,0.4)] hover:shadow-[0_20px_60px_-20px_rgba(37,99,235,0.5)] hover:-translate-y-0.5 hover:scale-[1.02]',
    secondary: 'bg-white text-[#0B1220] border border-[#0B1220]/15 shadow-sm hover:border-[#2563EB]/30 hover:bg-[#F8FAFC]',
    ghost: 'bg-transparent text-[#0B1220] hover:bg-[#2563EB]/5',
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-xs rounded-full',
    md: 'px-6 py-3 text-sm rounded-full',
    lg: 'px-8 py-4 text-sm rounded-full',
  };
  
  return (
    <motion.button
      whileHover={{ scale: variant === 'primary' ? 1.02 : 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}

/**
 * Feature Card Component
 * Standardized card design matching reference
 */
interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  iconColor?: string;
  className?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  iconColor = '#2563EB',
  className,
}: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn(
        'group relative rounded-3xl bg-white p-6 sm:p-8',
        'border border-[#0B1220]/8',
        'shadow-[0_4px_20px_-4px_rgba(11,18,32,0.1)]',
        'hover:border-[#2563EB]/30 hover:shadow-[0_20px_40px_-10px_rgba(11,18,32,0.15)]',
        'transition-all duration-250',
        className
      )}
    >
      {/* Icon */}
      <div 
        className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{ 
          background: `linear-gradient(135deg, ${iconColor}15 0%, ${iconColor}08 100%)`,
          border: `1px solid ${iconColor}20`,
        }}
      >
        <div style={{ color: iconColor }}>
          {icon}
        </div>
      </div>
      
      {/* Title */}
      <h3 className="mb-2 text-lg font-bold text-[#0B1220]">
        {title}
      </h3>
      
      {/* Description */}
      <p className="text-sm leading-relaxed text-[#0B1220]/70">
        {description}
      </p>
    </motion.div>
  );
}

/**
 * Section Container
 * Standardized section wrapper
 */
interface SectionProps {
  children: ReactNode;
  background?: 'white' | 'mist' | 'gradient';
  className?: string;
}

export function Section({
  children,
  background = 'white',
  className,
}: SectionProps) {
  const bgClasses = {
    white: 'bg-white',
    mist: 'bg-[#F7F9FC]',
    gradient: 'bg-gradient-to-b from-white via-[#F7F9FC] to-white',
  };
  
  return (
    <section className={cn('py-12 sm:py-20 lg:py-32', bgClasses[background], className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}

/**
 * Section Header
 * Standardized section title and description
 */
interface SectionHeaderProps {
  badge?: string;
  title: string;
  description?: string;
  centered?: boolean;
  className?: string;
}

export function SectionHeader({
  badge,
  title,
  description,
  centered = true,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn(
      'mb-12 sm:mb-16',
      centered && 'mx-auto max-w-3xl text-center',
      className
    )}>
      {badge && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#2563EB]/20 bg-[#2563EB]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#2563EB]">
          {badge}
        </div>
      )}
      
      <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-[#0B1220] sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      
      {description && (
        <p className="mt-4 text-base leading-relaxed text-[#0B1220]/70 sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}

/**
 * Testimonial Card
 * Standardized testimonial design
 */
interface TestimonialCardProps {
  quote: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  rating?: number;
  className?: string;
}

export function TestimonialCard({
  quote,
  author,
  rating = 5,
  className,
}: TestimonialCardProps) {
  return (
    <div className={cn(
      'rounded-3xl bg-white p-6 sm:p-8',
      'border border-[#0B1220]/8',
      'shadow-[0_4px_20px_-4px_rgba(11,18,32,0.1)]',
      className
    )}>
      {/* Rating */}
      {rating && (
        <div className="mb-4 flex gap-1">
          {Array.from({ length: rating }).map((_, i) => (
            <svg key={i} className="h-5 w-5 fill-[#FF6B4A]" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      )}
      
      {/* Quote */}
      <p className="mb-6 text-base leading-relaxed text-[#0B1220]">
        "{quote}"
      </p>
      
      {/* Author */}
      <div className="flex items-center gap-3">
        {author.avatar ? (
          <img 
            src={author.avatar} 
            alt={author.name}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#1E40AF] text-sm font-bold text-white">
            {author.name.charAt(0)}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-[#0B1220]">{author.name}</p>
          <p className="text-xs text-[#0B1220]/60">{author.role}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Stats Display
 * Standardized stats card
 */
interface StatsProps {
  value: string;
  label: string;
  icon?: ReactNode;
  className?: string;
}

export function StatCard({ value, label, icon, className }: StatsProps) {
  return (
    <div className={cn(
      'rounded-2xl bg-white p-6',
      'border border-[#0B1220]/8',
      'text-center',
      className
    )}>
      {icon && (
        <div className="mb-2 flex justify-center text-[#2563EB]">
          {icon}
        </div>
      )}
      <div className="text-3xl font-extrabold text-[#0B1220] sm:text-4xl">
        {value}
      </div>
      <div className="mt-1 text-sm font-medium text-[#0B1220]/60">
        {label}
      </div>
    </div>
  );
}
