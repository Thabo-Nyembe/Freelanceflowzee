'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
                  alert('Comments section opened!');
                }}
              >
                <MessageCircle className= "w-5 h-5" />
                <span>{post.comments}</span>
              </button>
              
              <button 
                data-testid= "share-btn"
                className= "flex items-center gap-2 text-sm text-gray-600 hover:text-green-500 transition-colors"
                onClick={() => sharePost(
                  `${post.author.name}'s Post`,
                  post.content,
                  post.id.toString(),
                  post.mediaUrl
                )}
              >
                <Share className= "w-5 h-5" />
                <span>Share Post</span>
                <span className= "text-xs text-gray-500">({post.shares})</span>
              </button>
            </div>
            
            <button className={`text-gray-600 hover:text-yellow-500 transition-colors ${post.bookmarked ? 'text-yellow-500&apos; : '&apos;}`}>'
              <Bookmark className={`w-5 h-5 ${post.bookmarked ? 'fill-current&apos; : '&apos;}`} />'
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleCreatePost = async (postData: FormData) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newPost: Post = {
        id: Date.now().toString(),
        author: {
          name: 'Current User',
          avatar: '/avatars/default.jpg',
          rating: 4.5
        },
        title: postData.get('title') as string,
        content: postData.get('content') as string,
        media: Array.from(postData.getAll('media')).map(file => ({
          type: (file as File).type.startsWith('image/') ? 'image' : 'video',
          url: URL.createObjectURL(file as File)
        })),
        likes: 0,
        comments: 0,
        shares: 0,
        createdAt: new Date().toISOString()
      }
      
      setPosts(prev => [newPost, ...prev])
    } catch (error) {
      console.error('Failed to create post:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className= "min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
      <div className= "max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className= "mb-8">
          <h1 className= "text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Community Hub
          </h1>
          <p className= "text-gray-600 text-lg">
            Connect with top creators and share your creative journey
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className= "grid w-full grid-cols-4 mb-8 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value= "feed" className= "flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <Instagram className= "w-4 h-4" />
              Feed
            </TabsTrigger>
            <TabsTrigger value= "creators" className= "flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <Users className= "w-4 h-4" />
              Creators
            </TabsTrigger>
            <TabsTrigger value= "showcase" className= "flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <Star className= "w-4 h-4" />
              Showcase
            </TabsTrigger>
            <TabsTrigger value= "events" className= "flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <Calendar className= "w-4 h-4" />
              Events
            </TabsTrigger>
          </TabsList>

          {/* Feed Tab (Social Wall) */}
          <TabsContent value= "feed">
            <div className= "grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Feed */}
              <div className= "lg:col-span-2">
                {/* Create Post */}
                <Card className= "mb-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className= "p-4">
                    <div className= "flex items-center gap-3 mb-4">
                      <Avatar className= "w-10 h-10">
                        <AvatarImage src= "/avatars/current-user.jpg" alt= "You" />
                        <AvatarFallback className= "bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                          YU
                        </AvatarFallback>
                      </Avatar>
                      <Input 
                        placeholder= "Share your creative journey..."
                        className= "flex-1 bg-white/80"
                        onClick={() => setShowCreatePost(true)}
                      />
                    </div>
                    <div className= "flex items-center gap-4">
                      <Button 
                        data-testid= "create-post-btn"
                        variant= "default"
                        size= "sm" 
                        className= "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                        onClick={() => {
                          console.log('Creating post');
                          setShowCreatePost(true);
                        }}
                      >
                        <Plus className= "w-4 h-4 mr-2" />
                        Create Post
                      </Button>
                      <Button 
                        variant= "ghost" 
                        size= "sm" 
                        className= "text-purple-600 hover:text-purple-700"
                        onClick={() => {
                          console.log('Opening photo upload');
                          alert('Photo upload coming soon!');
                        }}
                      >
                        <Image className= "w-4 h-4 mr-2" />
                        Photo
                      </Button>
                      <Button 
                        variant= "ghost" 
                        size= "sm" 
                        className= "text-blue-600 hover:text-blue-700"
                        onClick={() => {
                          console.log('Opening video upload');
                          alert('Video upload coming soon!');
                        }}
                      >
                        <Video className= "w-4 h-4 mr-2" />
                        Video
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Posts Feed */}
                <div className= "space-y-6">
                  {socialPosts.map(post => (
                    <SocialPost key={post.id} post={post} />
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div className= "space-y-6">
                {/* Trending Tags */}
                <Card className= "bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className= "flex items-center gap-2 text-lg">
                      <TrendingUp className= "w-5 h-5 text-purple-600" />
                      Trending Tags
                    </CardTitle>
                  </CardHeader>
                  <CardContent className= "space-y-3">
                    {['#photography', '#design', '#videoediting', '#branding', '#webdev', '#content', '#marketing', '#ui', '#creative', '#portfolio'].map((tag, index) => (
                      <div key={index} className= "flex items-center justify-between">
                        <span className= "text-blue-600 hover:underline cursor-pointer">{tag}</span>
                        <Badge variant= "secondary" className= "text-xs">
                          {Math.floor(Math.random() * 1000) + 100}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Featured Creators */}
                <Card className= "bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className= "flex items-center gap-2 text-lg">
                      <Sparkles className= "w-5 h-5 text-yellow-500" />
                      Featured Creators
                    </CardTitle>
                  </CardHeader>
                  <CardContent className= "space-y-4">
                    {topCreators.slice(0, 3).map(creator => (
                      <div key={creator.id} className= "flex items-center gap-3">
                        <Avatar className= "w-10 h-10">
                          <AvatarImage src={creator.avatar} alt={creator.name} />
                          <AvatarFallback>{creator.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className= "flex-1 min-w-0">
                          <div className= "flex items-center gap-1">
                            <span className= "font-semibold text-sm truncate">{creator.name}</span>
                            {creator.verified && (
                              <CheckCircle className= "w-3 h-3 text-blue-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className= "text-xs text-gray-600">{creator.category}</p>
                        </div>
                        <Button 
                          data-testid= "follow-creator-btn"
                          size= "sm" 
                          variant= "outline" 
                          className= "text-xs hover:bg-purple-50 hover:border-purple-200"
                          onClick={() => {
                            console.log(`Following ${creator.name}`);
                            alert(`Now following ${creator.name}!`);
                          }}
                        >
                          Follow Creator
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Creators Tab */}
          <TabsContent value= "creators">
            <div className= "space-y-6">
              {/* Search and Filters */}
              <Card className= "p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <div className= "flex flex-col md:flex-row gap-4">
                  <div className= "flex-1 relative">
                    <Search className= "absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder= "Search creators by name or specialty..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className= "pl-10 bg-white/80"
                    />
                  </div>
                  <div className= "flex gap-2">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className= "px-4 py-2 border border-gray-200 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </option>
                      ))}
                    </select>
                    <Button variant= "outline" size= "sm">
                      <Filter className= "w-4 h-4 mr-2" />
                      Filters
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Stats */}
              <div className= "grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className= "p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                  <div className= "flex items-center gap-3">
                    <Users className= "w-8 h-8" />
                    <div>
                      <div className= "text-2xl font-bold">2,847</div>
                      <div className= "text-sm opacity-90">Active Creators</div>
                    </div>
                  </div>
                </Card>
                
                <Card className= "p-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
                  <div className= "flex items-center gap-3">
                    <Briefcase className= "w-8 h-8" />
                    <div>
                      <div className= "text-2xl font-bold">12,456</div>
                      <div className= "text-sm opacity-90">Projects Completed</div>
                    </div>
                  </div>
                </Card>
                
                <Card className= "p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                  <div className= "flex items-center gap-3">
                    <Star className= "w-8 h-8" />
                    <div>
                      <div className= "text-2xl font-bold">4.8</div>
                      <div className= "text-sm opacity-90">Average Rating</div>
                    </div>
                  </div>
                </Card>
                
                <Card className= "p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                  <div className= "flex items-center gap-3">
                    <TrendingUp className= "w-8 h-8" />
                    <div>
                      <div className= "text-2xl font-bold">98%</div>
                      <div className= "text-sm opacity-90">Success Rate</div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Creators Grid */}
              <div className= "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCreators.map(creator => (
                  <CreatorCard key={creator.id} creator={creator} />
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Showcase Tab */}
          <TabsContent value= "showcase">
            <div className= "space-y-6">
              <Card className= "p-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                <CardHeader>
                  <CardTitle className= "text-2xl font-bold flex items-center gap-3">
                    <Star className= "w-8 h-8" />
                    Featured Work Showcase
                  </CardTitle>
                  <CardDescription className= "text-purple-100">
                    Discover amazing work from our top creators
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Featured Projects Grid */}
              <div className= "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topCreators.slice(0, 6).map(creator => (
                  <Card key={creator.id} className= "group hover:shadow-xl transition-all duration-300 overflow-hidden bg-white/80 backdrop-blur-sm border-0">
                    <div className= "aspect-video bg-gradient-to-br from-purple-100 to-pink-100 relative overflow-hidden">
                      <div className= "absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                        <div className= "text-center text-purple-700">
                          <Sparkles className= "w-12 h-12 mx-auto mb-2" />
                          <p className= "font-semibold">{creator.category}</p>
                        </div>
                      </div>
                    </div>
                    <CardContent className= "p-4">
                      <div className= "flex items-center gap-3 mb-3">
                        <Avatar className= "w-8 h-8">
                          <AvatarImage src={creator.avatar} alt={creator.name} />
                          <AvatarFallback>{creator.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className= "font-semibold text-sm">{creator.name}</h3>
                          <p className= "text-xs text-gray-600">{creator.category}</p>
                        </div>
                      </div>
                      <div className= "flex items-center justify-between">
                        <div className= "flex items-center gap-1">
                          <Star className= "w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className= "text-sm font-medium">{creator.rating}</span>
                          <span className= "text-xs text-gray-500">({creator.reviews})</span>
                        </div>
                        <Button size= "sm" variant= "outline" className= "text-xs">
                          View Work
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value= "events">
            <div className= "space-y-6">
              <Card className= "p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                <CardHeader>
                  <CardTitle className= "text-2xl font-bold flex items-center gap-3">
                    <Calendar className= "w-8 h-8" />
                    Community Events
                  </CardTitle>
                  <CardDescription className= "text-blue-100">
                    Join workshops, networking events, and creative challenges
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Events Grid */}
              <div className= "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    id: 1,
                    title: 'Design Masterclass',
                    date: '2024-03-15',
                    time: '2:00 PM EST',
                    type: 'Workshop',
                    attendees: 156,
                    price: 'Free',
                    instructor: 'Sarah Chen'
                  },
                  {
                    id: 2,
                    title: 'Freelancer Networking',
                    date: '2024-03-18',
                    time: '7:00 PM EST',
                    type: 'Networking',
                    attendees: 89,
                    price: 'Free',
                    instructor: 'Community'
                  },
                  {
                    id: 3,
                    title: '30-Day Photo Challenge',
                    date: '2024-03-20',
                    time: 'All Day',
                    type: 'Challenge',
                    attendees: 342,
                    price: 'Free',
                    instructor: 'Marcus Rodriguez'
                  },
                  {
                    id: 4,
                    title: 'Video Editing Bootcamp',
                    date: '2024-03-22',
                    time: '1:00 PM EST',
                    type: 'Workshop',
                    attendees: 78,
                    price: '$29',
                    instructor: 'Video Pro'
                  },
                  {
                    id: 5,
                    title: 'Portfolio Review Session',
                    date: '2024-03-25',
                    time: '3:00 PM EST',
                    type: 'Review',
                    attendees: 45,
                    price: 'Free',
                    instructor: 'Emily Watson'
                  },
                  {
                    id: 6,
                    title: 'Creative Collaboration Mixer',
                    date: '2024-03-28',
                    time: '6:00 PM EST',
                    type: 'Social',
                    attendees: 123,
                    price: 'Free',
                    instructor: 'Community'
                  }
                ].map(event => (
                  <Card key={event.id} className= "group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-0">
                    <CardContent className= "p-6">
                      <div className= "flex items-start justify-between mb-4">
                        <Badge 
                          variant= "outline" 
                          className={`text-xs ${
                            event.type === 'Workshop' ? 'border-purple-200 text-purple-700 bg-purple-50' :
                            event.type === 'Networking' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                            event.type === 'Challenge' ? 'border-green-200 text-green-700 bg-green-50' :
                            event.type === 'Review' ? 'border-orange-200 text-orange-700 bg-orange-50' :
                            'border-pink-200 text-pink-700 bg-pink-50'
                          }`}
                        >
                          {event.type}
                        </Badge>
                        <span className= "text-sm font-semibold text-green-600">{event.price}</span>
                      </div>
                      
                      <h3 className= "font-bold text-lg mb-2">{event.title}</h3>
                      
                      <div className= "space-y-2 text-sm text-gray-600 mb-4">
                        <div className= "flex items-center gap-2">
                          <Calendar className= "w-4 h-4" />
                          {event.date}
                        </div>
                        <div className= "flex items-center gap-2">
                          <Clock className= "w-4 h-4" />
                          {event.time}
                        </div>
                        <div className= "flex items-center gap-2">
                          <Users className= "w-4 h-4" />
                          {event.attendees} attending
                        </div>
                        <div className= "flex items-center gap-2">
                          <User className= "w-4 h-4" />
                          {event.instructor}
                        </div>
                      </div>
                      
                      <Button className= "w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                        Join Event
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Sharing Modal */}
      {shareContent && (
        <EnhancedSharingModal
          isOpen={isOpen}
          onClose={closeSharingModal}
          title={shareContent.title}
          description={shareContent.description}
          url={shareContent.url}
          imageUrl={shareContent.imageUrl}
          type={shareContent.type}
        />
      )}

      <CreatePostDialog
        open={isPostDialogOpen}
        onOpenChange={setIsPostDialogOpen}
        onSubmit={handleCreatePost}
      />
    </div>
  )
}

export default EnhancedCommunityHub