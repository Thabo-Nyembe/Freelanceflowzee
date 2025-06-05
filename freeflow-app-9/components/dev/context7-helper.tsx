"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Book, Code, Copy, RefreshCw } from 'lucide-react';
import { context7Client, type LibraryDoc, type CodeSnippet } from '@/lib/context7/client';

interface Context7HelperProps {
  isVisible?: boolean;
  onToggle?: () => void;
}

export function Context7Helper({ isVisible = false, onToggle }: Context7HelperProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLibrary, setSelectedLibrary] = useState('next.js');
  const [libraryDoc, setLibraryDoc] = useState<LibraryDoc | null>(null);
  const [loading, setLoading] = useState(false);
  const [quickHelp, setQuickHelp] = useState<CodeSnippet[]>([]);

  const libraries = [
    'next.js',
    'react',
    'supabase',
    'tailwindcss',
    '@radix-ui/react-dialog',
    'react-hook-form',
    'zod'
  ];

  const quickHelpTasks = [
    'authentication',
    'routing',
    'forms',
    'styling',
    'state',
    'database',
    'api'
  ];

  useEffect(() => {
    if (isVisible && selectedLibrary) {
      loadLibraryDocs(selectedLibrary);
    }
  }, [isVisible, selectedLibrary]);

  const loadLibraryDocs = async (library: string, topic?: string) => {
    setLoading(true);
    try {
      const doc = await context7Client.getLibraryDocs(library, topic);
      setLibraryDoc(doc);
    } catch (error) {
      console.error('Failed to load library docs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickHelp = async (task: string) => {
    setLoading(true);
    try {
      const snippets = await context7Client.getQuickHelp(task);
      setQuickHelp(snippets);
    } catch (error) {
      console.error('Failed to get quick help:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  if (!isVisible) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-4 right-4 z-50 shadow-lg"
        size="sm"
      >
        <Book className="h-4 w-4 mr-2" />
        Context7 Docs
      </Button>
    );
  }

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-background border-l shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Book className="h-5 w-5" />
          <h2 className="font-semibold">Context7 Docs</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onToggle}>
          ×
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="library" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
            <TabsTrigger value="library">Library</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="help">Quick Help</TabsTrigger>
          </TabsList>

          {/* Library Tab */}
          <TabsContent value="library" className="flex-1 overflow-hidden px-4">
            <div className="space-y-4 h-full flex flex-col">
              {/* Library Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Library:</label>
                <select
                  value={selectedLibrary}
                  onChange={(e) => setSelectedLibrary(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {libraries.map((lib) => (
                    <option key={lib} value={lib}>
                      {lib}
                    </option>
                  ))}
                </select>
              </div>

              {/* Topic Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Topic (optional):</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. authentication, routing..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        loadLibraryDocs(selectedLibrary, searchQuery);
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => loadLibraryDocs(selectedLibrary, searchQuery)}
                    disabled={loading}
                  >
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Documentation Display */}
              {libraryDoc && (
                <div className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between text-lg">
                          {libraryDoc.name}
                          <Badge variant="secondary">
                            {libraryDoc.lastUpdated.toLocaleDateString()}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          ID: {libraryDoc.id}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Documentation */}
                        <div>
                          <h4 className="font-medium mb-2">Documentation:</h4>
                          <div className="prose prose-sm max-w-none">
                            <pre className="whitespace-pre-wrap text-xs bg-muted p-3 rounded">
                              {libraryDoc.documentation}
                            </pre>
                          </div>
                        </div>

                        {/* Code Snippets */}
                        {libraryDoc.codeSnippets.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Code Examples:</h4>
                            <div className="space-y-3">
                              {libraryDoc.codeSnippets.map((snippet, index) => (
                                <Card key={index} className="bg-muted/50">
                                  <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                      <CardTitle className="text-sm">{snippet.title}</CardTitle>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => copyToClipboard(snippet.code)}
                                      >
                                        <Copy className="h-3 w-3" />
                                      </Button>
                                    </div>
                                    <CardDescription className="text-xs">
                                      {snippet.description}
                                    </CardDescription>
                                  </CardHeader>
                                  <CardContent className="pt-0">
                                    <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
                                      <code>{snippet.code}</code>
                                    </pre>
                                    <div className="flex gap-1 mt-2">
                                      {snippet.tags.map((tag) => (
                                        <Badge key={tag} variant="outline" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </ScrollArea>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search" className="flex-1 overflow-hidden px-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search across all libraries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button size="sm" disabled={loading}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Search functionality would search across all configured libraries using Context7.
              </p>
            </div>
          </TabsContent>

          {/* Quick Help Tab */}
          <TabsContent value="help" className="flex-1 overflow-hidden px-4">
            <div className="space-y-4 h-full flex flex-col">
              <div>
                <h4 className="font-medium mb-2">Common Development Tasks:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {quickHelpTasks.map((task) => (
                    <Button
                      key={task}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickHelp(task)}
                      disabled={loading}
                      className="justify-start"
                    >
                      {task}
                    </Button>
                  ))}
                </div>
              </div>

              {quickHelp.length > 0 && (
                <div className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="space-y-3">
                      {quickHelp.map((snippet, index) => (
                        <Card key={index}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm">{snippet.title}</CardTitle>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(snippet.code)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <CardDescription className="text-xs">
                              {snippet.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                              <code>{snippet.code}</code>
                            </pre>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 