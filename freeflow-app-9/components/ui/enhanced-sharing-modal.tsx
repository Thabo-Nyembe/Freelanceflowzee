'use client'

import { useState } from 'react';
import { X, Copy, Share2, Facebook, Twitter, Linkedin, Instagram, Mail, Link, Download } from 'lucide-react';
import { toast } from 'sonner'

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
  isOpen, onClose, title, description, url, imageUrl, type 
}: SharingModalProps) {
  const [copied, setCopied] = useState<any>(false);
  const [embedCopied, setEmbedCopied] = useState<any>(false);

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
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'bg-sky-500 hover:bg-sky-600'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'bg-blue-700 hover:bg-blue-800'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      url: '#',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
    },
    {
      name: 'Email',
      icon: Mail,
      url: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
      color: 'bg-gray-600 hover:bg-gray-700'
    }
  ];

  const embedCode = `<iframe src="${shareUrl}" width="800" height="600" frameborder="0" allowfullscreen></iframe>`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleCopyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setEmbedCopied(true);
      setTimeout(() => setEmbedCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy embed code: ', err);
    }
  };

  const handleSocialShare = (platform: typeof socialPlatforms[0]) => {
    if (platform.name === 'Instagram') {
      // Instagram doesn't support direct URL sharing, show instructions
      toast.info('Instagram sharing', {
        description: 'Save the image and post manually with the link in your bio or story'
      });
      return;
    }
    window.open(platform.url, '_blank', 'width=600,height=400');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Share {type}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Preview */}
        <div className="p-6 border-b">
          <div className="flex space-x-3">
            {imageUrl && (
              <img src={imageUrl} alt={title} className="w-24 h-24 object-cover rounded-lg" loading="lazy" />
            )}
            <div>
              <h3 className="font-semibold">{title}</h3>
              {description && (
                <p className="text-sm text-gray-500">{description}</p>
              )}
              <p className="text-sm text-blue-600 mt-2 truncate">{shareUrl}</p>
            </div>
          </div>
        </div>

        {/* Social Media Platforms */}
        <div className="p-6 border-b">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Share on social media</h3>
          <div className="grid grid-cols-5 gap-4">
            {socialPlatforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <button 
                  key={platform.name}
                  onClick={() => handleSocialShare(platform)}
                  className={`${platform.color} text-white p-3 rounded-lg flex flex-col items-center space-y-1 transition-transform hover:scale-105`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs">{platform.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Copy Link */}
        <div className="p-6 border-b">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Copy link</h3>
          <div className="flex space-x-2">
            <div className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg text-sm truncate">
              {shareUrl}
            </div>
            <button 
              onClick={handleCopyLink} 
              className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center ${
                copied 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {copied ? 'Copied!' : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Embed Code (for portfolio/gallery items) */}
        {(type === 'portfolio' || type === 'gallery') && (
          <div className="p-6 border-b">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Embed code</h3>
            <div className="space-y-2">
              <textarea 
                readOnly
                className="w-full p-3 bg-gray-100 text-gray-700 rounded-lg text-xs" 
                rows={3} 
                value={embedCode} 
              />
              <button 
                onClick={handleCopyEmbed} 
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  embedCopied 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {embedCopied ? 'Embed Code Copied!' : 'Copy Embed Code'}
              </button>
            </div>
          </div>
        )}

        {/* Additional Options */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 p-3 rounded-lg transition-colors">
              <Download className="w-5 h-5 text-gray-700" />
              <span className="text-sm font-medium">Download</span>
            </button>
            <button className="flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 p-3 rounded-lg transition-colors">
              <Link className="w-5 h-5 text-gray-700" />
              <span className="text-sm font-medium">Get QR Code</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 