'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Header() {
  return (
    <div className="navbar bg-forest-primary text-forest-light shadow-lg">
      <div className="flex-1">
        <a className="btn btn-ghost normal-case text-xl">Forest Dining</a>
      </div>
      <div className="flex-none">
        <WalletMultiButton className="btn btn-accent" />
      </div>
    </div>
  );
} 