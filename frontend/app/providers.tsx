'use client';

import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { toast } from 'react-hot-toast';

// Import all supported wallet adapters
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

interface ProvidersProps {
  children: ReactNode;
}

export const Providers: FC<ProvidersProps> = ({ children }) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Initialize all supported wallet adapters
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  // Ensure Buffer is available in the browser
  if (typeof window !== 'undefined') {
    const win = window as any;
    win.Buffer = win.Buffer || require('buffer').Buffer;
  }

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider 
        wallets={wallets} 
        autoConnect={true}
        onError={(error) => {
          console.error('Wallet error:', error);
          toast.error(`Wallet error: ${error.message}`);
        }}
      >
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}; 