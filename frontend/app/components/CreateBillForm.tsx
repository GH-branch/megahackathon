'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useBillSplitProgram } from '../hooks/useBillSplitProgram';
import { toast } from 'react-hot-toast';
import { Keypair } from '@solana/web3.js';

export default function CreateBillForm() {
  const { connected, publicKey } = useWallet();
  const program = useBillSplitProgram();
  const [formData, setFormData] = useState({
    restaurantName: '',
    billId: '',
    totalAmount: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!program || !publicKey) return;

    try {
      setLoading(true);
      const amount = parseFloat(formData.totalAmount) * 1e9; // Convert to lamports
      const billKeypair = Keypair.generate();
      
      const { tx } = await program.createBill(
        formData.restaurantName,
        formData.billId,
        amount,
        billKeypair
      );

      toast.success(`Bill created successfully! Bill ID: ${billKeypair.publicKey.toString()}`);
      console.log('Transaction:', tx);
      console.log('Bill address:', billKeypair.publicKey.toString());
      console.log('Restaurant address:', publicKey.toString());

      // Reset form
      setFormData({
        restaurantName: '',
        billId: '',
        totalAmount: '',
      });
    } catch (error: any) {
      console.error('Error creating bill:', error);
      toast.error(error.message || 'Failed to create bill');
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="card w-96 bg-forest-light shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-forest-dark">Connect Wallet</h2>
          <p className="text-forest-dark">Please connect your wallet to create a bill.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card w-96 bg-forest-light shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-forest-dark">Create New Bill</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text text-forest-dark">Restaurant Name</span>
            </label>
            <input
              type="text"
              placeholder="Enter restaurant name"
              className="input input-bordered w-full"
              value={formData.restaurantName}
              onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text text-forest-dark">Bill ID</span>
            </label>
            <input
              type="text"
              placeholder="Enter bill ID"
              className="input input-bordered w-full"
              value={formData.billId}
              onChange={(e) => setFormData({ ...formData, billId: e.target.value })}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text text-forest-dark">Total Amount (SOL)</span>
            </label>
            <input
              type="number"
              step="0.001"
              placeholder="Enter total amount"
              className="input input-bordered w-full"
              value={formData.totalAmount}
              onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
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
              {loading ? 'Creating...' : 'Create Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 