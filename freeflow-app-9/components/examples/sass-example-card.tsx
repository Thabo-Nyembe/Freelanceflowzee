'use client'

import React from 'react'
import styles from './sass-example-card.module.scss'
import { Star, Heart, Share2 } from 'lucide-react'

interface SassExampleCardProps {
  title: string
  description: string
  image?: string
  rating?: number
  likes?: number
  className?: string
}

export function SassExampleCard({
  title,
  description,
  image,
  rating = 4.5,
  likes = 24,
  className
}: SassExampleCardProps) {
  return (
    <div className={`${styles.card} ${className || ''}`}>
      {image && (
        <div className={styles.imageContainer}>
          <img src={image} alt={title} className={styles.image} />
          <div className={styles.overlay}>
            <button className={styles.actionButton}>
              <Heart className="w-5 h-5" />
            </button>
            <button className={styles.actionButton}>
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
        
        <div className={styles.footer}>
          <div className={styles.rating}>
            <Star className="w-4 h-4" />
            <span>{rating}</span>
          </div>
          
          <div className={styles.likes}>
            <Heart className="w-4 h-4" />
            <span>{likes}</span>
          </div>
          
          <button className={styles.primaryButton}>
            View Details
          </button>
        </div>
      </div>
    </div>
  )
} 