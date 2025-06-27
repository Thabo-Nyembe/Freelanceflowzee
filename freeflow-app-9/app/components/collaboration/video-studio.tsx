import React from 'react';

interface VideoStudioProps {
  userId: string;
}

export const VideoStudio: React.FC<VideoStudioProps> = ({ userId }) => {
  return (
    <div className= "bg-white rounded-lg shadow-lg p-6">
      <div className= "flex items-center justify-between mb-6">
        <h3 className= "text-xl font-semibold">Video Studio</h3>
        <button className= "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          New Recording
        </button>
      </div>
      
      <div className= "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Video Projects Grid */}
        <div className= "bg-gray-50 rounded-lg p-4">
          <div className= "aspect-video bg-gray-200 rounded-lg mb-3"></div>
          <h4 className= "font-medium">Project Overview Video</h4>
          <p className= "text-sm text-gray-600">Last edited 2 days ago</p>
        </div>
        
        <div className= "bg-gray-50 rounded-lg p-4">
          <div className= "aspect-video bg-gray-200 rounded-lg mb-3"></div>
          <h4 className= "font-medium">Client Presentation</h4>
          <p className= "text-sm text-gray-600">Last edited 5 days ago</p>
        </div>
        
        <div className= "bg-gray-50 rounded-lg p-4">
          <div className= "aspect-video bg-gray-200 rounded-lg mb-3"></div>
          <h4 className= "font-medium">Team Update</h4>
          <p className= "text-sm text-gray-600">Last edited 1 week ago</p>
        </div>
      </div>
      
      <div className= "mt-6">
        <h4 className= "font-medium mb-3">Recent Recordings</h4>
        <div className= "space-y-3">
          <div className= "flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className= "font-medium">Weekly Standup</p>
              <p className= "text-sm text-gray-600">Duration: 45:20</p>
            </div>
            <button className= "text-blue-500 hover:text-blue-600">
              View
            </button>
          </div>
          
          <div className= "flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className= "font-medium">Feature Demo</p>
              <p className= "text-sm text-gray-600">Duration: 12:15</p>
            </div>
            <button className= "text-blue-500 hover:text-blue-600">
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 