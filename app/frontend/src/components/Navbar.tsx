'use client';

import React from 'react';
import Link from 'next/link';
import { WalletConnect } from './WalletConnect';
import { useWalletStore } from '@/lib/walletStore';
import { HealthBadge } from './HealthBadge';
import { ThemeToggle } from './ThemeToggle';
import { EnvironmentIndicator } from './EnvironmentIndicator';

export const Navbar: React.FC = () => {
  const { publicKey } = useWalletStore();

  return (
    <nav className="bg-white dark:bg-slate-900 text-blue-900 dark:text-slate-50 border-b border-slate-200 dark:border-slate-700 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Soter
        </Link>
        <div className="flex items-center gap-4 flex-wrap">
          <EnvironmentIndicator />
          {publicKey && (
            <span className="text-sm">
              Wallet: {publicKey.substring(0, 6)}...
              {publicKey.substring(publicKey.length - 6)}
            </span>
          )}
          <HealthBadge />
          <ThemeToggle />
          <WalletConnect />
        </div>
      </div>
    </nav>
  );
};
