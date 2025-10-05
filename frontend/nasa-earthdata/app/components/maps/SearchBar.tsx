"use client";

import { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearchSubmit: (query: string) => void;
  isSearching: boolean;
  searchError: string | null;
  suggestions: any[];
  showSuggestions: boolean;
  onSuggestionSelect: (suggestion: any) => void;
  isLoadingSuggestions: boolean;
}

export default function SearchBar({
  searchQuery,
  onSearchQueryChange,
  onSearchSubmit,
  isSearching,
  searchError,
  suggestions,
  showSuggestions,
  onSuggestionSelect,
  isLoadingSuggestions,
}: SearchBarProps) {
  const handleInputChange = (value: string) => {
    onSearchQueryChange(value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearchSubmit(searchQuery);
    } else if (e.key === 'Escape') {
      // Handle escape if needed
    }
  };

  return (
    <div className="max-w-md mx-auto relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleInputKeyDown}
          onFocus={() => {}} // Could be handled by parent
          onBlur={() => setTimeout(() => {}, 150)} // Could be handled by parent
          placeholder="Search city for air quality..."
          className="w-full pl-10 pr-4 py-3 bg-slate-800/60 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          disabled={isSearching}
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Autocomplete Dropdown */}
        {showSuggestions && (suggestions.length > 0 || isLoadingSuggestions) && (
        <div className="absolute z-50 w-full mt-1 bg-slate-800/90 border border-white/10 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoadingSuggestions ? (
            <div className="px-4 py-3 text-gray-400 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                Searching...
              </div>
            </div>
          ) : (
            suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSuggestionSelect(suggestion)}
                className="w-full text-left px-4 py-3 hover:bg-slate-700 focus:bg-slate-700 focus:outline-none border-b border-white/10 last:border-b-0 transition-colors"
              >
                <div className="text-white text-sm font-medium">
                  {suggestion.display_name.split(',')[0]}
                </div>
                <div className="text-gray-400 text-xs mt-1">
                  {suggestion.display_name.split(',').slice(1, 3).join(', ')}
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {searchError && (
        <p className="text-red-400 text-sm mt-2 text-center">{searchError}</p>
      )}
    </div>
  );
}