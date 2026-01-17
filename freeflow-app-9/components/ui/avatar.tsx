import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import Image from "next/image"
import { cn } from "@/lib/utils"

// Default blur placeholder for avatars - small gray placeholder
const DEFAULT_AVATAR_BLUR_DATA_URL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAME/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDBBEhABIxBQYTQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAgP/xAAYEQEBAQEBAAAAAAAAAAAAAAABAgADEf/aAAwDAQACEQMRAD8AyRU9NL06aKjqzBUxNulkZQWBJYEA+xYfPmtaKpqa6ljqqaZopozlHXkHTWk0w5JOp//Z"

interface OptimizedAvatarImageProps
  extends Omit<React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>, 'src'> {
  src?: string | null
  alt?: string
  size?: number
  blurDataURL?: string
  priority?: boolean
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

/**
 * Optimized Avatar Image using next/image with blur placeholder support
 * Use this component for avatar images that come from external sources (Supabase, etc.)
 *
 * @example
 * <Avatar>
 *   <OptimizedAvatarImage
 *     src={user.avatarUrl}
 *     alt={user.name}
 *     size={40}
 *   />
 *   <AvatarFallback>{user.initials}</AvatarFallback>
 * </Avatar>
 */
const OptimizedAvatarImage = React.forwardRef<
  HTMLImageElement,
  OptimizedAvatarImageProps
>(({
  className,
  src,
  alt = "Avatar",
  size = 40,
  blurDataURL = DEFAULT_AVATAR_BLUR_DATA_URL,
  priority = false,
  ...props
}, ref) => {
  const [imgError, setImgError] = React.useState(false)

  // If no src or error loading, return null (fallback will show)
  if (!src || imgError) {
    return null
  }

  // Check if it's a local/relative path
  const isLocalPath = src.startsWith('/') && !src.startsWith('//')

  return (
    <Image
      ref={ref}
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn("aspect-square h-full w-full object-cover", className)}
      placeholder="blur"
      blurDataURL={blurDataURL}
      priority={priority}
      unoptimized={isLocalPath && src.endsWith('.svg')}
      onError={() => setImgError(true)}
      {...props}
    />
  )
})
OptimizedAvatarImage.displayName = "OptimizedAvatarImage"

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

// Export blur data URL for use in other components
export const AVATAR_BLUR_PLACEHOLDER = DEFAULT_AVATAR_BLUR_DATA_URL

export { Avatar, AvatarImage, AvatarFallback, OptimizedAvatarImage }
