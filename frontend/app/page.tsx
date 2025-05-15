'use client';

import dynamic from 'next/dynamic';
import { Toaster } from 'react-hot-toast';
import CreateBillForm from './components/CreateBillForm';
import JoinBill from './components/JoinBill';
import SettlePayment from './components/SettlePayment';

// This is the way to properly import the WalletMultiButton in Next.js
const WalletMultiButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <Toaster position="top-right" />
      
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-forest-light">AA Go</h1>
          <WalletMultiButton />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-8">
            <div className="prose">
              <h2 className="text-forest-light">Restaurant Owner</h2>
              <p className="text-forest-light">Create a new bill for your customers to split.</p>
            </div>
            <CreateBillForm />
          </div>

          <div className="space-y-8">
            <div className="prose">
              <h2 className="text-forest-light">Customer</h2>
              <p className="text-forest-light">Join an existing bill and contribute your share.</p>
            </div>
            <JoinBill />
          </div>

          <div className="space-y-8">
            <div className="prose">
              <h2 className="text-forest-light">Settle Payment</h2>
              <p className="text-forest-light">Complete your payment for the bill.</p>
            </div>
            <SettlePayment />
          </div>
        </div>
      </div>
    </main>
  );
} 