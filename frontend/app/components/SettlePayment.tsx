'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useBillSplitProgram } from '../hooks/useBillSplitProgram';
import { toast } from 'react-hot-toast';
import { PublicKey, SystemProgram } from '@solana/web3.js';

export default function SettlePayment() {
  const { connected } = useWallet();
  const program = useBillSplitProgram();
  const [billId, setBillId] = useState('');
  const [participantId, setParticipantId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!program) return;

    try {
      setLoading(true);
      const billPublicKey = new PublicKey(billId);
      const participantPublicKey = new PublicKey(participantId);

      // First verify the bill and participant exist
      const billAccount = await program.getBill(billPublicKey);
      if (!billAccount) {
        throw new Error('Bill not found');
      }

      const participantAccount = await program.getParticipant(participantPublicKey);
      if (!participantAccount) {
        throw new Error('Participant not found');
      }

      const tx = await program.settlePayment(
        billPublicKey,
        participantPublicKey,
        billAccount.restaurant
      );

      toast.success('Payment settled successfully!');
      console.log('Transaction:', tx);

      // Reset form
      setBillId('');
      setParticipantId('');
    } catch (error) {
      console.error('Error settling payment:', error);
      toast.error('Failed to settle payment');
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="card w-96 bg-forest-light shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-forest-dark">Connect Wallet</h2>
          <p className="text-forest-dark">Please connect your wallet to settle a payment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card w-96 bg-forest-light shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-forest-dark">Settle Payment</h2>
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
              <span className="label-text text-forest-dark">Participant ID</span>
            </label>
            <input
              type="text"
              placeholder="Enter participant public key"
              className="input input-bordered w-full"
              value={participantId}
              onChange={(e) => setParticipantId(e.target.value)}
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
              {loading ? 'Settling...' : 'Settle Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 