"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Search, Loader2, Folder } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { semanticSearchProjects } from '@/app/(app)/projects/actions'
import { useDebounce } from 'use-debounce'
import { useRouter } from 'next/navigation'

interface SearchResult {
  id: string;
  title: string;
  description: string;
  similarity: number;
}

export function GlobalSearch() {
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [activeResultIndex, setActiveResultIndex] = useState(-1);
  const [debouncedQuery] = useDebounce(query, 500);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length > 2) {
      setLoading(true);
      setActiveResultIndex(-1);
      const { projects, error } = await semanticSearchProjects(searchQuery);
      if (error) {
        console.error('Search error:', error);
        setResults([]);
      } else {
        setResults(projects || []);
      }
      setLoading(false);
    } else {
      setResults([]);
    }
  }, []);

  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  // Handle clicks outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveResultIndex((prevIndex) => (prevIndex + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveResultIndex((prevIndex) => (prevIndex - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeResultIndex >= 0 && activeResultIndex < results.length) {
        const project = results[activeResultIndex];
        router.push(`/projects/${project.id}`);
        setQuery('');
        setIsFocused(false);
      }
    }
  };
  
  const handleResultClick = (projectId: string) => {
    router.push(`/projects/${projectId}`);
    setQuery('');
    setIsFocused(false);
  };

  return (
    <div className="relative w-64" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        <Input 
          placeholder="Semantic Search..." 
          className="pl-10 w-full"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />}
      </div>
      
      {isFocused && query.length > 0 && (
        <div className="absolute top-full mt-2 w-96 rounded-md bg-white shadow-lg border z-50">
          {!loading && results.length === 0 && debouncedQuery.length > 2 ? (
            <div className="p-4 text-sm text-center text-gray-500">No results found.</div>
          ) : (
            <ul className="py-1">
              {results.map((project, index) => (
                <li 
                  key={project.id} 
                  className={`px-4 py-2 cursor-pointer ${index === activeResultIndex ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                  onMouseDown={() => handleResultClick(project.id)}
                  onMouseEnter={() => setActiveResultIndex(index)}
                >
                  <div className="flex items-center">
                    <Folder className="h-4 w-4 mr-3 text-gray-500" />
                    <div>
                      <div className="font-medium text-sm">{project.title}</div>
                      <p className="text-xs text-gray-600 truncate">{project.description}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
