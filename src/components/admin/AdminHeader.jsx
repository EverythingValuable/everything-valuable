import React, { useState, useEffect } from 'react';
import { Search, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function AdminHeader({ pageTitle, pageSubtitle }) {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-8 py-6">
        {/* Top Row */}
        <div className="flex items-center justify-between mb-6">
          {/* Left: Title & Subtitle */}
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">{pageTitle}</h1>
            {pageSubtitle && (
              <p className="text-sm text-muted-foreground mt-1">{pageSubtitle}</p>
            )}
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-3">
            {/* Global Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users, listings, invoices…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                className="pl-10 pr-4 py-2 border border-input rounded-lg text-sm bg-secondary/30 placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring w-64"
              />
            </div>

            {/* Date Range */}
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">Last 30 days</span>
            </Button>

            {/* Export */}
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              <span className="text-xs">Export</span>
            </Button>

            {/* Admin Profile */}
            {user && (
              <div className="flex items-center gap-2 pl-3 border-l border-border">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-foreground/20 to-foreground/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-foreground">
                    {user.full_name?.charAt(0)}
                  </span>
                </div>
                <span className="text-xs font-medium text-muted-foreground">{user.full_name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}