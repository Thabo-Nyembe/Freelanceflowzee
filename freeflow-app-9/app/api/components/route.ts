import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('components')

// Component types matching the frontend interface
type ComponentCategory = 'ui' | 'layout' | 'animation' | 'data-display' | 'navigation' | 'feedback' | 'forms' | 'utilities'
type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'
type CodeLanguage = 'typescript' | 'javascript' | 'tsx' | 'jsx' | 'css' | 'html'

interface ComponentShowcase {
  id: string
  name: string
  description: string
  category: ComponentCategory
  difficulty: DifficultyLevel
  code: string
  preview: string
  language: CodeLanguage
  tags: string[]
  popularity: number
  examples: number
  downloads: number
  isFavorite: boolean
  isPremium: boolean
  createdAt: string
  updatedAt: string
  author: string
  version: string
  dependencies: string[]
}

// Sample showcase components for the component library
const sampleComponents: ComponentShowcase[] = [
  {
    id: 'comp-1',
    name: 'Liquid Glass Card',
    description: 'A stunning glass-morphism card with liquid animation effects and smooth transitions',
    category: 'ui',
    difficulty: 'intermediate',
    code: `import { motion } from 'framer-motion'

export const LiquidGlassCard = ({ children, className }) => {
  return (
    <motion.div
      className={\`backdrop-blur-xl bg-white/10 border border-white/20
        rounded-2xl shadow-xl \${className}\`}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {children}
    </motion.div>
  )
}`,
    preview: '/images/components/liquid-glass-card.png',
    language: 'tsx',
    tags: ['glass', 'animation', 'card', 'ui'],
    popularity: 12500,
    examples: 8,
    downloads: 8900,
    isFavorite: false,
    isPremium: false,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    author: 'Kazi Team',
    version: '1.2.0',
    dependencies: ['framer-motion', 'tailwindcss']
  },
  {
    id: 'comp-2',
    name: 'Number Flow',
    description: 'Animated number counter with smooth spring animations for statistics and metrics',
    category: 'animation',
    difficulty: 'beginner',
    code: `import { useSpring, animated } from '@react-spring/web'

export const NumberFlow = ({ value, className }) => {
  const { number } = useSpring({
    from: { number: 0 },
    number: value,
    config: { mass: 1, tension: 20, friction: 10 }
  })

  return (
    <animated.span className={className}>
      {number.to(n => n.toFixed(0))}
    </animated.span>
  )
}`,
    preview: '/images/components/number-flow.png',
    language: 'tsx',
    tags: ['animation', 'numbers', 'counter', 'statistics'],
    popularity: 9800,
    examples: 5,
    downloads: 6500,
    isFavorite: false,
    isPremium: false,
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-18T11:00:00Z',
    author: 'Kazi Team',
    version: '1.0.0',
    dependencies: ['@react-spring/web']
  },
  {
    id: 'comp-3',
    name: 'Scroll Reveal',
    description: 'Intersection observer-based component that reveals content with beautiful animations on scroll',
    category: 'animation',
    difficulty: 'intermediate',
    code: `import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

export const ScrollReveal = ({ children, delay = 0 }) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  )
}`,
    preview: '/images/components/scroll-reveal.png',
    language: 'tsx',
    tags: ['scroll', 'animation', 'reveal', 'intersection-observer'],
    popularity: 15200,
    examples: 12,
    downloads: 11300,
    isFavorite: false,
    isPremium: false,
    createdAt: '2024-01-05T08:00:00Z',
    updatedAt: '2024-01-22T16:00:00Z',
    author: 'Kazi Team',
    version: '2.1.0',
    dependencies: ['framer-motion', 'react-intersection-observer']
  },
  {
    id: 'comp-4',
    name: 'Data Table Pro',
    description: 'Feature-rich data table with sorting, filtering, pagination, and virtualization support',
    category: 'data-display',
    difficulty: 'advanced',
    code: `import { useTable, useSortBy, useFilters } from 'react-table'

export const DataTablePro = ({ columns, data }) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable({ columns, data }, useFilters, useSortBy)

  return (
    <table {...getTableProps()} className="w-full">
      <thead>
        {headerGroups.map(group => (
          <tr {...group.getHeaderGroupProps()}>
            {group.headers.map(column => (
              <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                {column.render('Header')}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map(row => {
          prepareRow(row)
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => (
                <td {...cell.getCellProps()}>
                  {cell.render('Cell')}
                </td>
              ))}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}`,
    preview: '/images/components/data-table.png',
    language: 'tsx',
    tags: ['table', 'data', 'sorting', 'filtering', 'pagination'],
    popularity: 18500,
    examples: 15,
    downloads: 14200,
    isFavorite: false,
    isPremium: true,
    createdAt: '2024-01-02T10:00:00Z',
    updatedAt: '2024-01-25T09:00:00Z',
    author: 'Kazi Team',
    version: '3.0.0',
    dependencies: ['react-table', '@tanstack/react-virtual']
  },
  {
    id: 'comp-5',
    name: 'Sidebar Navigation',
    description: 'Collapsible sidebar with nested menu items, tooltips, and keyboard navigation',
    category: 'navigation',
    difficulty: 'intermediate',
    code: `import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export const SidebarNavigation = ({ items, collapsed, onToggle }) => {
  const [activeItem, setActiveItem] = useState(null)

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 256 }}
      className="h-screen bg-slate-900 flex flex-col"
    >
      <nav className="flex-1 py-4">
        {items.map(item => (
          <NavItem
            key={item.id}
            item={item}
            collapsed={collapsed}
            active={activeItem === item.id}
            onClick={() => setActiveItem(item.id)}
          />
        ))}
      </nav>
    </motion.aside>
  )
}`,
    preview: '/images/components/sidebar-nav.png',
    language: 'tsx',
    tags: ['navigation', 'sidebar', 'menu', 'collapsible'],
    popularity: 11200,
    examples: 6,
    downloads: 8700,
    isFavorite: false,
    isPremium: false,
    createdAt: '2024-01-08T14:00:00Z',
    updatedAt: '2024-01-19T10:00:00Z',
    author: 'Kazi Team',
    version: '1.5.0',
    dependencies: ['framer-motion', 'lucide-react']
  },
  {
    id: 'comp-6',
    name: 'Toast Notifications',
    description: 'Elegant toast notification system with multiple variants, auto-dismiss, and stacking',
    category: 'feedback',
    difficulty: 'beginner',
    code: `import { toast } from 'sonner'

// Success toast
toast.success('Operation completed', {
  description: 'Your changes have been saved'
})

// Error toast
toast.error('Something went wrong', {
  description: 'Please try again later'
})

// Custom toast
toast.custom((t) => (
  <div className="bg-white rounded-lg shadow-lg p-4">
    <h4>Custom Notification</h4>
    <button onClick={() => toast.dismiss(t)}>Close</button>
  </div>
))`,
    preview: '/images/components/toast.png',
    language: 'tsx',
    tags: ['toast', 'notification', 'alert', 'feedback'],
    popularity: 22000,
    examples: 10,
    downloads: 18500,
    isFavorite: false,
    isPremium: false,
    createdAt: '2024-01-01T12:00:00Z',
    updatedAt: '2024-01-24T15:00:00Z',
    author: 'Kazi Team',
    version: '2.0.0',
    dependencies: ['sonner']
  },
  {
    id: 'comp-7',
    name: 'Form Builder',
    description: 'Dynamic form builder with validation, conditional fields, and custom input types',
    category: 'forms',
    difficulty: 'expert',
    code: `import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

export const FormBuilder = ({ fields, onSubmit }) => {
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(schema)
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {fields.map(field => (
        <FormField
          key={field.name}
          {...field}
          register={register}
          error={formState.errors[field.name]}
        />
      ))}
      <button type="submit">Submit</button>
    </form>
  )
}`,
    preview: '/images/components/form-builder.png',
    language: 'tsx',
    tags: ['form', 'validation', 'builder', 'dynamic'],
    popularity: 16800,
    examples: 20,
    downloads: 12400,
    isFavorite: false,
    isPremium: true,
    createdAt: '2024-01-03T11:00:00Z',
    updatedAt: '2024-01-23T13:00:00Z',
    author: 'Kazi Team',
    version: '2.5.0',
    dependencies: ['react-hook-form', 'zod', '@hookform/resolvers']
  },
  {
    id: 'comp-8',
    name: 'Responsive Grid Layout',
    description: 'CSS Grid-based layout system with responsive breakpoints and gap utilities',
    category: 'layout',
    difficulty: 'beginner',
    code: `export const GridLayout = ({
  children,
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 4
}) => {
  const colsClass = \`
    grid-cols-\${cols.sm}
    md:grid-cols-\${cols.md}
    lg:grid-cols-\${cols.lg}
    xl:grid-cols-\${cols.xl}
  \`

  return (
    <div className={\`grid \${colsClass} gap-\${gap}\`}>
      {children}
    </div>
  )
}`,
    preview: '/images/components/grid-layout.png',
    language: 'tsx',
    tags: ['grid', 'layout', 'responsive', 'css'],
    popularity: 8500,
    examples: 4,
    downloads: 6200,
    isFavorite: false,
    isPremium: false,
    createdAt: '2024-01-12T09:00:00Z',
    updatedAt: '2024-01-17T10:00:00Z',
    author: 'Kazi Team',
    version: '1.0.0',
    dependencies: ['tailwindcss']
  },
  {
    id: 'comp-9',
    name: 'Debounce Hook',
    description: 'Custom React hook for debouncing values, perfect for search inputs and API calls',
    category: 'utilities',
    difficulty: 'beginner',
    code: `import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

// Usage
const SearchInput = () => {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (debouncedQuery) {
      // Perform search
    }
  }, [debouncedQuery])

  return <input value={query} onChange={e => setQuery(e.target.value)} />
}`,
    preview: '/images/components/debounce-hook.png',
    language: 'typescript',
    tags: ['hook', 'debounce', 'utility', 'performance'],
    popularity: 14200,
    examples: 3,
    downloads: 10800,
    isFavorite: false,
    isPremium: false,
    createdAt: '2024-01-06T15:00:00Z',
    updatedAt: '2024-01-16T12:00:00Z',
    author: 'Kazi Team',
    version: '1.1.0',
    dependencies: []
  },
  {
    id: 'comp-10',
    name: 'Floating Action Button',
    description: 'Material-style floating action button with expandable menu and ripple effect',
    category: 'ui',
    difficulty: 'intermediate',
    code: `import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export const FloatingActionButton = ({ actions, icon: MainIcon }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6">
      <AnimatePresence>
        {isOpen && actions.map((action, i) => (
          <motion.button
            key={action.id}
            initial={{ scale: 0, y: 0 }}
            animate={{ scale: 1, y: -(i + 1) * 60 }}
            exit={{ scale: 0, y: 0 }}
            onClick={action.onClick}
            className="absolute bottom-0 right-0 p-3 rounded-full bg-slate-700"
          >
            <action.icon className="h-5 w-5" />
          </motion.button>
        ))}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 rounded-full bg-purple-500 shadow-lg"
      >
        <MainIcon className="h-6 w-6 text-white" />
      </motion.button>
    </div>
  )
}`,
    preview: '/images/components/fab.png',
    language: 'tsx',
    tags: ['fab', 'button', 'menu', 'material'],
    popularity: 7800,
    examples: 5,
    downloads: 5400,
    isFavorite: false,
    isPremium: false,
    createdAt: '2024-01-14T10:00:00Z',
    updatedAt: '2024-01-21T11:00:00Z',
    author: 'Kazi Team',
    version: '1.0.0',
    dependencies: ['framer-motion', 'lucide-react']
  }
]

export async function GET(request: NextRequest) {
  try {
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const search = searchParams.get('search')
    const favoritesOnly = searchParams.get('favoritesOnly') === 'true'

    // Try to get user-specific data from Supabase
    let userFavorites: string[] = []

    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Try to fetch user favorites from database
        const { data: favorites } = await supabase
          .from('component_favorites')
          .select('component_id')
          .eq('user_id', user.id)

        if (favorites) {
          userFavorites = favorites.map(f => f.component_id)
        }
      }
    } catch {
      // If Supabase table doesn't exist or other error, continue with empty favorites
    }

    // Apply user favorites to components
    let components = sampleComponents.map(comp => ({
      ...comp,
      isFavorite: userFavorites.includes(comp.id)
    }))

    // Apply filters
    if (category && category !== 'all') {
      components = components.filter(c => c.category === category)
    }

    if (difficulty && difficulty !== 'all') {
      components = components.filter(c => c.difficulty === difficulty)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      components = components.filter(c =>
        c.name.toLowerCase().includes(searchLower) ||
        c.description.toLowerCase().includes(searchLower) ||
        c.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    if (favoritesOnly) {
      components = components.filter(c => c.isFavorite)
    }

    // Calculate stats
    const stats = {
      total: sampleComponents.length,
      categories: new Set(sampleComponents.map(c => c.category)).size,
      totalExamples: sampleComponents.reduce((sum, c) => sum + c.examples, 0),
      totalDownloads: sampleComponents.reduce((sum, c) => sum + c.downloads, 0),
      favorites: userFavorites.length,
      premium: sampleComponents.filter(c => c.isPremium).length,
      mostPopular: Math.max(...sampleComponents.map(c => c.popularity))
    }

    return NextResponse.json({
      success: true,
      data: {
        components,
        stats
      }
    })
  } catch (error) {
    logger.error('Error fetching components:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch components',
        data: {
          components: [],
          stats: {
            total: 0,
            categories: 0,
            totalExamples: 0,
            totalDownloads: 0,
            favorites: 0,
            premium: 0,
            mostPopular: 0
          }
        }
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { componentId, action } = body

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (action === 'favorite') {
      // Toggle favorite
      const { data: existing } = await supabase
        .from('component_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('component_id', componentId)
        .single()

      if (existing) {
        // Remove favorite
        await supabase
          .from('component_favorites')
          .delete()
          .eq('id', existing.id)

        return NextResponse.json({ success: true, action: 'unfavorited' })
      } else {
        // Add favorite
        await supabase
          .from('component_favorites')
          .insert({ user_id: user.id, component_id: componentId })

        return NextResponse.json({ success: true, action: 'favorited' })
      }
    }

    if (action === 'download') {
      // Log download (could be stored in analytics)
      return NextResponse.json({ success: true, action: 'downloaded' })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    logger.error('Error processing component action:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process action' },
      { status: 500 }
    )
  }
}
