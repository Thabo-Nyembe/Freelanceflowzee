'use client

import React, { useState } from 'react
import { Button } from '@/components/ui/button'
 </span>
                        <span className= "text-purple-400">from</span>
                        <span className= "text-green-400"> &apos;react&apos;</span>
                      </div>
                      
                      <div className= "flex">
                        <span className= "text-gray-500 w-8">2</span>
                        <span className= "text-purple-400">import</span>
                        <span className= "text-gray-100"> &#123; Button &#125; </span>
                        <span className= "text-purple-400">from</span>
                        <span className= "text-green-400"> &apos;@/components/ui/button&apos;</span>
                      </div>
                      
                      <div className= "flex">
                        <span className= "text-gray-500 w-8">3</span>
                        <span></span>
                      </div>
                      
                      <div className= "flex group relative">
                        <span className= "text-gray-500 w-8">23</span>
                        <span className= "bg-yellow-900/30 px-1 rounded">
                          <span className= "text-purple-400">const</span>
                          <span className= "text-blue-400"> handleClick</span>
                          <span className= "text-gray-100"> = () {`=>`} {`{`}</span>
                        </span>
                        {/* Comment indicator */}
                        <div className= "absolute right-0 top-0 w-3 h-3 bg-orange-500 rounded-full border border-gray-700 group-hover:bg-orange-400 transition-colors"></div>
                        <div className= "absolute right-6 top-0 bg-gray-800 border border-gray-600 rounded-lg shadow-lg p-3 w-72 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <div className= "flex items-start gap-2">
                            <Avatar className= "h-6 w-6">
                              <AvatarFallback className= "text-xs">DT</AvatarFallback>
                            </Avatar>
                            <div className= "flex-1">
                              <p className= "text-sm text-gray-100">Consider using useCallback for better performance</p>
                              <div className= "flex items-center justify-between mt-2">
                                <span className= "text-xs text-gray-400">Dev Team</span>
                                <Badge variant= "secondary" className= "text-xs">open</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className= "flex">
                        <span className= "text-gray-500 w-8">24</span>
                        <span className= "text-gray-100 ml-4">console.log(</span>
                        <span className= "text-green-400">'Button clicked!&apos;</span>
                        <span className= "text-gray-100">)</span>
                      </div>
                      
                      <div className= "flex">
                        <span className= "text-gray-500 w-8">25</span>
                        <span className= "text-gray-100">{`}`}</span>
                      </div>
                      
                      <div className= "flex">
                        <span className= "text-gray-500 w-8">26</span>
                        <span></span>
                      </div>
                      
                      <div className= "flex group relative">
                        <span className= "text-gray-500 w-8">45</span>
                        <span className= "bg-green-900/30 px-1 rounded">
                          <span className= "text-purple-400">return</span>
                          <span className= "text-gray-100"> (</span>
                        </span>
                        <div className= "absolute right-0 top-0 w-3 h-3 bg-green-500 rounded-full border border-gray-700"></div>
                        <div className= "absolute right-6 top-0 bg-gray-800 border border-gray-600 rounded-lg shadow-lg p-3 w-64 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <div className= "flex items-start gap-2">
                            <Avatar className= "h-6 w-6">
                              <AvatarFallback className= "text-xs">CR</AvatarFallback>
                            </Avatar>
                            <div className= "flex-1">
                              <p className= "text-sm text-gray-100">Great component structure!</p>
                              <div className= "flex items-center justify-between mt-2">
                                <span className= "text-xs text-gray-400">Code Review</span>
                                <Badge className= "text-xs bg-green-600">resolved</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className= "flex">
                        <span className= "text-gray-500 w-8">46</span>
                        <span className= "text-gray-100 ml-4">{`<`}</span>
                        <span className= "text-red-400">div</span>
                        <span className= "text-gray-100"> </span>
                        <span className= "text-blue-400">className</span>
                        <span className= "text-gray-100">=</span>
                        <span className= "text-green-400">"container"</span>
                        <span className= "text-gray-100">{`>`}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className= "flex items-center gap-4 text-sm text-gray-600">
                  <span>{selectedFile.format} • {selectedFile.size}</span>
                  <span>•</span>
                  <span>{selectedFile.lines} lines</span>
                  <span>•</span>
                  <span>{sampleComments.code.length} code comments</span>
                </div>
              </div>
            </TabsContent>

            {/* Screenshot Preview */}
            <TabsContent value= "screenshot" className= "space-y-4">
              <div className= "space-y-4">
                <div className= "flex items-center justify-between">
                  <h3 className= "text-lg font-semibold">{selectedFile.name}</h3>
                  <div className= "flex items-center gap-2">
                    <Button variant= "outline" size= "sm">
                      <Pencil className= "h-4 w-4" />
                      Annotate
                    </Button>
                    <Button variant= "outline" size= "sm">
                      <Square className= "h-4 w-4" />
                      Rectangle
                    </Button>
                    <Button variant= "outline" size= "sm">
                      <Circle className= "h-4 w-4" />
                      Circle
                    </Button>
                    <Button variant= "outline" size= "sm">
                      <Eraser className= "h-4 w-4" />
                      Eraser
                    </Button>
                  </div>
                </div>
                
                <div className= "relative border rounded-lg overflow-hidden bg-white" onClick={handleImageClick}>
                  <div className= "aspect-video flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    {/* Mock UI Screenshot */}
                    <div className= "w-full h-full bg-white flex flex-col">
                      {/* Header */}
                      <div className= "h-16 bg-gradient-to-r from-purple-600 to-pink-600 flex items-center px-6">
                        <div className= "text-white font-bold text-lg">FreeflowZee</div>
                        <div className= "ml-auto flex gap-4">
                          <div className= "w-20 h-8 bg-white/20 rounded"></div>
                          <div className= "w-8 h-8 bg-white/20 rounded-full"></div>
                        </div>
                      </div>
                      
                      {/* Sidebar and Content */}
                      <div className= "flex-1 flex">
                        <div className= "w-64 bg-gray-50 p-4">
                          <div className= "space-y-2">
                            <div className= "h-8 bg-purple-100 rounded px-3 flex items-center text-sm">Dashboard</div>
                            <div className= "h-8 bg-gray-200 rounded px-3 flex items-center text-sm">Projects</div>
                            <div className= "h-8 bg-gray-200 rounded px-3 flex items-center text-sm">Team</div>
                          </div>
                        </div>
                        
                        <div className= "flex-1 p-6">
                          <div className= "grid grid-cols-3 gap-4 mb-6">
                            <div className= "h-20 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className= "text-sm text-blue-800">Metrics</span>
                            </div>
                            <div className= "h-20 bg-green-100 rounded-lg flex items-center justify-center">
                              <span className= "text-sm text-green-800">Revenue</span>
                            </div>
                            <div className= "h-20 bg-purple-100 rounded-lg flex items-center justify-center relative">
                              <span className= "text-sm text-purple-800">Projects</span>
                              {/* Annotation rectangle */}
                              <div className= "absolute inset-0 border-2 border-red-500 border-dashed rounded-lg"></div>
                            </div>
                          </div>
                          
                          <div className= "h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className= "text-gray-500">Main Content Area</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comment Pins */}
                  {showingComments && sampleComments.screenshot.map((comment) => (
                    <div
                      key={comment.id}
                      className= "absolute transform -translate-x-1/2 -translate-y-1/2 group
                      style={{ left: `${comment.x}%`, top: `${comment.y}%` }}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold shadow-lg cursor-pointer ${
                        comment.status === 'resolved' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white
                      }`}>
                        {comment.id}
                      </div>
                      <div className= "absolute top-8 left-1/2 transform -translate-x-1/2 bg-white border rounded-lg shadow-lg p-3 w-64 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <div className= "flex items-start gap-2">
                          <Avatar className= "h-6 w-6">
                            <AvatarFallback className= "text-xs">{comment.author.split(&apos; ')[0][0]}</AvatarFallback>
                          </Avatar>
                          <div className= "flex-1">
                            <p className= "text-sm">{comment.content}</p>
                            <div className= "flex items-center justify-between mt-2">
                              <span className= "text-xs text-gray-500">{comment.author}</span>
                              <Badge variant={comment.status === 'resolved' ? &apos;default&apos; : &apos;secondary&apos;} className= "text-xs">
                                {comment.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className= "flex items-center gap-4 text-sm text-gray-600">
                  <span>{selectedFile.format} • {selectedFile.size}</span>
                  <span>•</span>
                  <span>{selectedFile.dimensions?.width} × {selectedFile.dimensions?.height}</span>
                  <span>•</span>
                  <span>{sampleComments.screenshot.length} annotations</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Comment Controls */}
          <div className= "flex items-center justify-between border-t pt-4">
            <div className= "flex items-center gap-2">
              <Button 
                variant={showingComments ? "default" : "outline"} 
                size= "sm
                onClick={() => setShowingComments(!showingComments)}
              >
                <MessageSquare className= "h-4 w-4 mr-2" />
                {showingComments ? 'Hide Comments' : 'Show Comments'}
              </Button>
              <Button variant= "outline" size= "sm">
                <Send className= "h-4 w-4 mr-2" />
                Add Comment
              </Button>
            </div>
            
            <div className= "flex items-center gap-2 text-sm text-gray-500">
              <span>Total: {sampleComments[selectedMediaType as keyof typeof sampleComments]?.length || 0} comments</span>
              <span>•</span>
              <span>{sampleComments[selectedMediaType as keyof typeof sampleComments]?.filter(c => c.status === 'resolved')?.length || 0} resolved</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}