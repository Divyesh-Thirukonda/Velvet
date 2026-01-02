// src/components/ui/Navbar.tsx
'use client';

import Link from 'next/link';
import { Box, Sparkles, LayoutGrid, BarChart3 } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path ? 'text-white bg-white/10' : 'text-muted-foreground hover:text-white hover:bg-white/5';

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-8">
            <div className="glass-panel max-w-7xl mx-auto flex items-center justify-between py-3 px-6 shadow-2xl">
                {/* Logo Area */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                        <div className="relative p-2 bg-gradient-to-br from-gray-900 to-black rounded-xl border border-white/10">
                            <Box className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                    <span className="font-bold text-lg tracking-tight font-outfit text-white">
                        Velvet<span className="text-primary">Console</span>
                    </span>
                </Link>

                {/* Nav Links */}
                <div className="hidden md:flex items-center gap-1 bg-black/20 p-1 rounded-full border border-white/5">
                    <Link href="/" className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${isActive('/')}`}>
                        <LayoutGrid className="w-4 h-4" />
                        Dashboard
                    </Link>
                    <Link href="/campaigns" className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${isActive('/campaigns')}`}>
                        <BarChart3 className="w-4 h-4" />
                        Intelligence
                    </Link>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <button className="btn btn-primary text-xs py-2 px-4 gap-2 shadow-lg shadow-primary/20">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Connect Store</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
