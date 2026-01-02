// src/components/ui/Navbar.tsx
'use client';

import Link from 'next/link';
import { Box, LayoutGrid, BarChart3, Plus, LogOut } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import ConnectStoreModal from '../ConnectStoreModal';
import { saveShopifyConfig, disconnectStore } from '@/app/actions';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isActive = (path: string) => pathname === path ? 'text-white' : 'text-[#888888] hover:text-white';

    const handleConnect = async (domain: string, token: string) => {
        await saveShopifyConfig(domain, token);
        router.refresh(); // Refresh Server Components
    };

    const handleDisconnect = async () => {
        await disconnectStore();
        router.refresh();
    };

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
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn btn-primary h-8 text-xs"
                    >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Connect Store
                    </button>
                    <button
                        onClick={handleDisconnect}
                        className="btn h-8 text-xs bg-[#111] hover:bg-red-900/20 text-muted-foreground hover:text-red-500 border border-[#333]"
                        title="Disconnect Store"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                    </button>
                </div>

                <ConnectStoreModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConnect={handleConnect}
                />
            </div>
        </nav>
    );
}
