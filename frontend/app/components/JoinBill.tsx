'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useBillSplitProgram } from '../hooks/useBillSplitProgram';
import { toast } from 'react-hot-toast';
import { PublicKey } from '@solana/web3.js';

export default function JoinBill() {
  const { connected } = useWallet();
  const program = useBillSplitProgram();
  const [billId, setBillId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!program) return;

    try {
      setLoading(true);
      const billPublicKey = new PublicKey(billId);
      const amountLamports = parseFloat(amount) * 1e9; // Convert to lamports

      // First verify the bill exists
      const billAccount = await program.getBill(billPublicKey);
      if (!billAccount) {
        throw new Error('Bill not found');
      }

      const { participantKeypair, tx } = await program.addParticipant(
        billPublicKey,
        amountLamports
      );

      toast.success('Successfully joined the bill!');
      console.log('Transaction:', tx);
      console.log('Participant address:', participantKeypair.publicKey.toString());

      // Reset form
      setBillId('');
      setAmount('');
    } catch (error) {
      console.error('Error joining bill:', error);
      toast.error('Failed to join bill');
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="card w-96 bg-forest-light shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-forest-dark">Connect Wallet</h2>
          <p className="text-forest-dark">Please connect your wallet to join a bill.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card w-96 bg-forest-light shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-forest-dark">Join Existing Bill</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text text-forest-dark">Bill ID</span>
            </label>
            <input
              type="text"
              placeholder="Enter bill public key"
              className="input input-bordered w-full"
              value={billId}
              onChange={(e) => setBillId(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text text-forest-dark">Your Share (SOL)</span>
            </label>
            <input
              type="number"
              step="0.001"
              placeholder="Enter your share amount"
              className="input input-bordered w-full"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="card-actions justify-end">
            <button 
              type="submit" 
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Joining...' : 'Join Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 