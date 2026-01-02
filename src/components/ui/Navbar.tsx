// src/components/ui/Navbar.tsx
'use client';

import Link from 'next/link';
import { Box, LayoutGrid, BarChart3, Plus } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path ? 'text-white' : 'text-[#888888] hover:text-white';

    return (
        <nav className="border-b border-[#333333] bg-black">
            <div className="container flex items-center justify-between h-14">
                <div className="flex items-center gap-8">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <Box className="w-5 h-5" />
                        <span>Velvet</span>
                    </Link>

                    {/* Links */}
                    <div className="flex items-center gap-6 text-sm">
                        <Link href="/" className={isActive('/')}>Overview</Link>
                        <Link href="/campaigns" className={isActive('/campaigns')}>Intelligence</Link>
                    </div>
                </div>

                {/* Actions */}
                <button className="btn btn-primary h-8 text-xs">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Connect Store
                </button>
            </div>
        </nav>
    );
}
