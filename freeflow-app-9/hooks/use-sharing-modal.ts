'use client';

import { useState, useCallback } from 'react';

interface ShareContent {
  title: string;
  description?: string;
  url: string;
  imageUrl?: string;
  type: 'post' | 'portfolio' | 'gallery' | 'asset';
}

export function useSharingModal() {
  const [isOpen, setIsOpen] = useState<any>(false);
  const [shareContent, setShareContent] = useState<ShareContent | null>(null);

  const openSharingModal = useCallback((content: ShareContent) => {
    setShareContent(content);
    setIsOpen(true);
  }, []);

  const closeSharingModal = useCallback(() => {
    setIsOpen(false);
    setShareContent(null);
  }, []);

  // Helper functions for different content types
  const sharePost = useCallback((title: string, description: string, postId: string, imageUrl?: string) => {
    openSharingModal({
      title,
      description,
      url: `/community/post/${postId}`,
      imageUrl,
      type: 'post'
    });
  }, [openSharingModal]);

  const sharePortfolio = useCallback((title: string, description: string, portfolioId: string, imageUrl?: string) => {
    openSharingModal({
      title,
      description,
      url: `/portfolio/${portfolioId}`,
      imageUrl,
      type: 'portfolio'
    });
  }, [openSharingModal]);

  const shareGallery = useCallback((title: string, description: string, galleryId: string, imageUrl?: string) => {
    openSharingModal({
      title,
      description,
      url: `/gallery/${galleryId}`,
      imageUrl,
      type: 'gallery'
    });
  }, [openSharingModal]);

  const shareAsset = useCallback((title: string, description: string, assetId: string, imageUrl?: string) => {
    openSharingModal({
      title,
      description,
      url: `/asset/${assetId}`,
      imageUrl,
      type: 'asset'
    });
  }, [openSharingModal]);

  return {
    isOpen,
    shareContent,
    openSharingModal,
    closeSharingModal,
    sharePost,
    sharePortfolio,
    shareGallery,
    shareAsset
  };
} 