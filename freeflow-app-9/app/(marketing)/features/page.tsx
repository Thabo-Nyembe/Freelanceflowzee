'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
{testimonials[selectedTestimonial].content}&rdquo;
                  </p>
                  <div className= "flex items-center justify-center">
                    <div className= "w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                      {testimonials[selectedTestimonial].avatar}
                    </div>
                    <div>
                      <p className= "font-semibold text-gray-900">{testimonials[selectedTestimonial].name}</p>
                      <p className= "text-sm text-gray-600">
                        {testimonials[selectedTestimonial].role}, {testimonials[selectedTestimonial].company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Testimonial Navigation */}
            <div className= "flex justify-center space-x-2 mb-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    selectedTestimonial === index ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* All Testimonials Grid */}
            <div className= "grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card 
                  key={index} 
                  className={`bg-white hover:shadow-lg transition-all cursor-pointer ${
                    selectedTestimonial === index ? 'ring-2 ring-blue-500' : '
                  }`}
                  onClick={() => setSelectedTestimonial(index)}
                >
                  <CardContent className= "p-6">
                    <div className= "flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className= "w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className= "text-gray-600 mb-6 italic">&ldquo;{testimonial.content}&rdquo;</p>
                    <div className= "flex items-center">
                      <div className= "w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className= "font-semibold text-gray-900">{testimonial.name}</p>
                        <p className= "text-sm text-gray-600">{testimonial.role}, {testimonial.company}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className= "py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className= "max-w-4xl mx-auto text-center">
            <h2 className= "text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Experience All These Features?
            </h2>
            <p className= "text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                             Join thousands of creative professionals who've already transformed their workflow with FreeflowZee.
            </p>
            <div className= "flex flex-col sm:flex-row gap-4 justify-center">
              <Link href= "/signup">
                <Button size= "lg" className= "bg-white text-blue-600 hover:bg-gray-100">
                  <Target className= "w-5 h-5 mr-2" />
                  Start Free Trial
                </Button>
              </Link>
              <Link href= "/contact">
                <Button size= "lg" variant= "outline" className= "border-white text-white hover:bg-white hover:text-blue-600">
                  <Headphones className= "w-5 h-5 mr-2" />
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
} 