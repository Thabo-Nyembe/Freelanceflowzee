"use client";

import React, { useState } from 'react';
import { Context7Helper } from '@/components/dev/context7-helper';

interface Context7ProviderProps {
  children: React.ReactNode;
}

export function Context7Provider({ children }: Context7ProviderProps) {
  const [isContext7Visible, setIsContext7Visible] = useState(false);
  
  // Only show Context7 helper in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';

  const toggleContext7 = () => {
    setIsContext7Visible(prev => !prev);
  };

  return (
    <>
      {children}
      {isDevelopment && (
        <Context7Helper 
          isVisible={isContext7Visible} 
          onToggle={toggleContext7} 
        />
      )}
    </>
  );
} 