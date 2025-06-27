'use client&apos;;

import { useState, useCallback } from &apos;react&apos;;

interface ShareContent {
  title: string;
  description?: string;
  url: string;
  imageUrl?: string;
  type: &apos;post&apos; | &apos;portfolio&apos; | &apos;gallery&apos; | &apos;asset&apos;;
}

export function useSharingModal() {
  const [isOpen, setIsOpen] = useState(false);
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
      type: &apos;post&apos;
    });
  }, [openSharingModal]);

  const sharePortfolio = useCallback((title: string, description: string, portfolioId: string, imageUrl?: string) => {
    openSharingModal({
      title,
      description,
      url: `/portfolio/${portfolioId}`,
      imageUrl,
      type: &apos;portfolio&apos;
    });
  }, [openSharingModal]);

  const shareGallery = useCallback((title: string, description: string, galleryId: string, imageUrl?: string) => {
    openSharingModal({
      title,
      description,
      url: `/gallery/${galleryId}`,
      imageUrl,
      type: &apos;gallery&apos;
    });
  }, [openSharingModal]);

  const shareAsset = useCallback((title: string, description: string, assetId: string, imageUrl?: string) => {
    openSharingModal({
      title,
      description,
      url: `/asset/${assetId}`,
      imageUrl,
      type: &apos;asset&apos;
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