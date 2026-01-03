// src/components/ConnectStoreModal.tsx
'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, ShoppingBag, Key } from 'lucide-react';

interface ConnectStoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConnect: (domain: string, token: string) => void;
}

export default function ConnectStoreModal({ isOpen, onClose, onConnect }: ConnectStoreModalProps) {
    const [domain, setDomain] = useState('');
    const [token, setToken] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!domain.includes('.myshopify.com')) {
            setError('Domain must look like "your-store.myshopify.com"');
            return;
        }
        if (!token.startsWith('shpat_')) {
            setError('Access Token usually starts with "shpat_"');
            return;
        }

        onConnect(domain, token);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md p-6 bg-[#111] border border-[#333] rounded-lg shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex gap-4 border-b border-[#333] mb-6">
                    <button
                        className={`pb-2 text-sm font-medium border-b-2 transition-colors ${!token ? 'border-primary text-white' : 'border-transparent text-muted-foreground'}`}
                        onClick={() => { setToken(''); setError(''); }}
                    >
                        Auto (OAuth)
                    </button>
                    <button
                        className={`pb-2 text-sm font-medium border-b-2 transition-colors ${token ? 'border-primary text-white' : 'border-transparent text-muted-foreground'}`}
                        onClick={() => { setToken('manual'); setError(''); }}
                    >
                        Manual Token
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Store Domain</label>
                        <div className="relative">
                            <ShoppingBag className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="brand-name.myshopify.com"
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                                className="input pl-9"
                                required
                            />
                        </div>
                    </div>

                    {token && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <label className="text-sm font-medium text-muted-foreground">Admin API Access Token</label>
                            <div className="relative">
                                <Key className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="password"
                                    placeholder="shpat_xxxxxxxxxxxxxxxx"
                                    value={token === 'manual' ? '' : token}
                                    onChange={(e) => setToken(e.target.value)}
                                    className="input pl-9"
                                    required={token !== 'manual'}
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                Settings -{'>'} Apps -{'>'} Develop apps -{'>'} API Credentials
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded flex items-center gap-2 text-red-500 text-xs">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn w-full bg-[#222] hover:bg-[#333]">
                            Cancel
                        </button>
                        {token ? (
                            <button type="submit" className="btn btn-primary w-full">
                                Connect Manually
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    if (!domain.includes('.myshopify.com')) {
                                        setError('Enter a valid myshopify.com domain');
                                        return;
                                    }
                                    window.location.href = `/api/shopify/auth?shop=${domain}`;
                                }}
                                className="btn btn-primary w-full"
                            >
                                Connect with Shopify
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
