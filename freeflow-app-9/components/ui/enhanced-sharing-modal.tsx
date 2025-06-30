'use client'

import React, { useState } from 'react';
import { X, Copy, Share2, Facebook, Twitter, Linkedin, Instagram, Mail, Link, Code, Download } from 'lucide-react';

interface SharingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  url: string;
  imageUrl?: string;
  type: 'post' | 'portfolio' | 'gallery' | 'asset';
}

export function EnhancedSharingModal({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  url, 
  imageUrl,
  type 
}: SharingModalProps) {
  const [copied, setCopied] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}${url}`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || '');

  const socialPlatforms = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'bg-blue-600 hover:bg-blue-700
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'bg-sky-500 hover:bg-sky-600
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'bg-blue-700 hover:bg-blue-800
    },
    {
      name: 'Instagram',
      icon: Instagram,
      url: '#',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600
    },
    {
      name: 'Email',
      icon: Mail,
      url: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
      color: 'bg-gray-600 hover:bg-gray-700
    }
  ];

  const embedCode = `<iframe src= "${shareUrl}" width= "800" height= "600" frameborder="0" allowfullscreen></iframe>`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setEmbedCopied(true);
      setTimeout(() => setEmbedCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy embed code:', err);
    }
  };

  const handleSocialShare = (platform: typeof socialPlatforms[0]) => {
    if (platform.name === 'Instagram') {
      // Instagram doesn't support direct URL sharing, show instructions
      alert('To share on Instagram, save the image and post it manually with the link in your bio or story.');
      return;
    }
    window.open(platform.url, '_blank', 'width=600,height=400');
  };

  return (
    <div className= "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className= "bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className= "flex items-center justify-between p-6 border-b">
          <div className= "flex items-center space-x-2">
            <Share2 className= "w-5 h-5 text-blue-600" />
            <h2 className= "text-lg font-semibold">Share {type}</h2>
          </div>
          <button
            onClick={onClose}
            className= "p-1 hover:bg-gray-100 rounded-full transition-colors
          >
            <X className= "w-5 h-5" />
          </button>
        </div>

        {/* Content Preview */}
        <div className= "p-6 border-b">
          <div className= "flex space-x-3">
            {imageUrl && (
              <img src={imageUrl} alt={title}>
            )}
            <div >
              <h3 >{title}</h3>
              {description && (
                <p >{description}</p>
              )}
              <p >{shareUrl}</p>
            </div>
          </div>
        </div>

        {/* Social Media Platforms */}
        <div >
          <h3 >Share on social media</h3>
          <div >
            {socialPlatforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <button key={platform.name}> handleSocialShare(platform)}
                  className={`${platform.color} text-white p-3 rounded-lg flex flex-col items-center space-y-1 transition-colors`}
                >
                  <Icon >
                  <span >{platform.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Copy Link */}
        <div >
          <h3 >Copy link</h3>
          <div >
            <div >
              {shareUrl}
            </div>
            <button onClick={handleCopyLink} className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                copied 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700
              }>
              {copied ? &apos;Copied!&apos; : <Copy >}
            </button>
          </div>
        </div>

        {/* Embed Code (for portfolio/gallery items) */}
        {(type === 'portfolio' || type === 'gallery') && (
          <div >
            <h3 >Embed code</h3>
            <div >
              <textarea value={embedCode}>
              <button onClick={handleCopyEmbed} className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  embedCopied 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-600 text-white hover:bg-gray-700
                }>
                {embedCopied ? 'Embed Code Copied!' : 'Copy Embed Code'}
              </button>
            </div>
          </div>
        )}

        {/* Additional Options */}
        <div >
          <div >
            <button >
              <Download >
              <span >Download</span>
            </button>
            <button >
              <Link >
              <span >Get QR Code</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 