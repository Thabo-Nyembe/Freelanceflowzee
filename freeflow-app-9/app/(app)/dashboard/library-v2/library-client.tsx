'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { BookOpen, Plus, Search, Book, Users, Clock, Star, CheckCircle, XCircle } from 'lucide-react'

const books = [
  { id: 1, title: 'The Lean Startup', author: 'Eric Ries', isbn: '978-0307887894', category: 'Business', status: 'available', borrowedBy: null, dueDate: null, rating: 4.5 },
  { id: 2, title: 'Clean Code', author: 'Robert Martin', isbn: '978-0132350884', category: 'Technology', status: 'borrowed', borrowedBy: 'Sarah Chen', dueDate: '2024-02-10', rating: 4.8 },
  { id: 3, title: 'Atomic Habits', author: 'James Clear', isbn: '978-0735211292', category: 'Self-Help', status: 'available', borrowedBy: null, dueDate: null, rating: 4.7 },
  { id: 4, title: 'Deep Work', author: 'Cal Newport', isbn: '978-1455586691', category: 'Productivity', status: 'borrowed', borrowedBy: 'Mike Johnson', dueDate: '2024-02-05', rating: 4.6 },
  { id: 5, title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', isbn: '978-1449373320', category: 'Technology', status: 'available', borrowedBy: null, dueDate: null, rating: 4.9 },
  { id: 6, title: 'The Phoenix Project', author: 'Gene Kim', isbn: '978-0988262508', category: 'Business', status: 'borrowed', borrowedBy: 'Emily Davis', dueDate: '2024-02-08', rating: 4.4 },
]

export default function LibraryClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const stats = useMemo(() => ({
    totalBooks: books.length,
    available: books.filter(b => b.status === 'available').length,
    borrowed: books.filter(b => b.status === 'borrowed').length,
    avgRating: (books.reduce((sum, b) => sum + b.rating, 0) / books.length).toFixed(1),
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      available: 'bg-green-100 text-green-700',
      borrowed: 'bg-blue-100 text-blue-700',
      reserved: 'bg-yellow-100 text-yellow-700',
    }
    return <Badge className={styles[status]}>{status}</Badge>
  }

  const categories = ['all', ...new Set(books.map(b => b.category))]

  const filteredBooks = useMemo(() => books.filter(b =>
    (categoryFilter === 'all' || b.category === categoryFilter) &&
    (b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.author.toLowerCase().includes(searchQuery.toLowerCase()))
  ), [searchQuery, categoryFilter])

  const insights = [
    { icon: Book, title: `${stats.totalBooks}`, description: 'Total books' },
    { icon: CheckCircle, title: `${stats.available}`, description: 'Available' },
    { icon: Users, title: `${stats.borrowed}`, description: 'Borrowed' },
    { icon: Star, title: stats.avgRating, description: 'Avg rating' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><BookOpen className="h-8 w-8 text-primary" />Library</h1>
          <p className="text-muted-foreground mt-1">Browse and manage book collection</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Add Book</Button>
      </div>

      <CollapsibleInsightsPanel title="Library Overview" insights={insights} defaultExpanded={true} />

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search books..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <select className="border rounded-md px-3 py-2" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          {categories.map(cat => <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBooks.map((book) => (
          <Card key={book.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold">{book.title}</h4>
                  <p className="text-sm text-muted-foreground">{book.author}</p>
                  <p className="text-xs text-muted-foreground mt-1">ISBN: {book.isbn}</p>
                </div>
                {getStatusBadge(book.status)}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{book.category}</Badge>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{book.rating}</span>
                  </div>
                </div>

                {book.borrowedBy && (
                  <div className="text-sm">
                    <p className="text-muted-foreground">Borrowed by: <span className="font-medium text-foreground">{book.borrowedBy}</span></p>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />Due: {book.dueDate}
                    </p>
                  </div>
                )}
              </div>

              <Button className="w-full mt-3" disabled={book.status === 'borrowed'}>
                {book.status === 'borrowed' ? 'Currently Borrowed' : 'Borrow Book'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
