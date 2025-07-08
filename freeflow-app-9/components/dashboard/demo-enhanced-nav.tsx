'use client'

import { useDemoContent } from './demo-content-provider';
import { Menu, Search, Bell, Settings } from 'lucide-react';

export function DemoEnhancedNav() {
  const { content, loading } = useDemoContent();
  
  const currentUser = content?.users?.[0] || {
    name: 'Demo User',
    email: 'demo@freeflowzee.com',
    picture: { thumbnail: '/images/demo-avatar.jpg' }
  };

  return (
    <nav className="demo-enhanced-nav bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="lg:hidden">
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold">FreeflowZee Dashboard</h1>
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
            🎭 Demo Mode
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search features..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Bell className="h-6 w-6 text-gray-600 cursor-pointer hover:text-gray-800" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </div>

          <div className="flex items-center gap-3">
            <img src={currentUser.picture?.thumbnail || '/images/demo-avatar.jpg'} alt={currentUser.name} />
            <div>
              <p>{currentUser.name}</p>
              <p>Demo Account</p>
            </div>
          </div>

          <Settings />
        </div>
      </div>
    </nav>
  );
}