// src/components/ui/Navbar.tsx
'use client';

import Link from 'next/link';
import { Box, Sparkles } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
            <div className="glass-panel container flex items-center justify-between py-3 px-6">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <Box className="w-6 h-6 text-primary" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">
                        Shopify<span className="text-primary">3D</span>
                    </span>
                </Link>

                <div className="flex items-center gap-6">
                    <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Dashboard
                    </Link>
                    <Link href="/campaigns" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Campaigns
                    </Link>
                    <button className="btn btn-primary text-sm py-2 px-4 gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span>Connect New Store</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
