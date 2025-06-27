import UniversalMediaPreviewsEnhanced from '@/components/collaboration/universal-media-previews-enhanced'

export default function MediaPreviewDemo() {
  return (
    <div className= "min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className= "max-w-7xl mx-auto space-y-6">
        <div className= "text-center space-y-4">
          <h1 className= "text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Universal Media Previews Demo
          </h1>
          <p className= "text-gray-600 text-lg max-w-2xl mx-auto">
            Experience the comprehensive media feedback system with click-to-pin comments, 
            video time-code annotations, audio waveform interactions, and more.
          </p>
        </div>
        
        <UniversalMediaPreviewsEnhanced />
      </div>
    </div>
  )
} 