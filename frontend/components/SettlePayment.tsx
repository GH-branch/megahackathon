import { FC, useState } from 'react';
import { useProgram } from '../hooks/useProgram';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import toast from 'react-hot-toast';

export const SettlePayment: FC = () => {
  const program = useProgram();
  const { publicKey } = useWallet();
  const [billPublicKey, setBillPublicKey] = useState('');
  const [participantPublicKey, setParticipantPublicKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!program || !publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      const billPubkey = new PublicKey(billPublicKey);
      const participantPubkey = new PublicKey(participantPublicKey);

      // First fetch the bill to get the restaurant's public key
      const billAccount = await program.account.billAccount.fetch(billPubkey);
      
      const tx = await program.methods
        .settlePayment()
        .accounts({
          bill: billPubkey,
          participant: participantPubkey,
          user: publicKey,
          restaurant: billAccount.restaurant,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('Transaction signature:', tx);
      console.log('View transaction: https://explorer.solana.com/tx/' + tx + '?cluster=devnet');
      
      toast.success('Payment settled successfully!');
      setBillPublicKey('');
      setParticipantPublicKey('');
    } catch (error: any) {
      console.error('Error settling payment:', error);
      toast.error(`Failed to settle payment: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl p-6">
      <h2 className="text-2xl font-bold mb-4 text-forest-dark">Settle Payment</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">
            <span className="label-text">Bill Public Key</span>
          </label>
          <input
            type="text"
            value={billPublicKey}
            onChange={(e) => setBillPublicKey(e.target.value)}
            className="input input-bordered w-full"
            placeholder="Enter the bill's public key"
            required
          />
        </div>
        <div>
          <label className="label">
            <span className="label-text">Participant Public Key</span>
          </label>
          <input
            type="text"
            value={participantPublicKey}
            onChange={(e) => setParticipantPublicKey(e.target.value)}
            className="input input-bordered w-full"
            placeholder="Enter your participant public key"
            required
          />
        </div>
        <button
          type="submit"
          className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
          disabled={loading || !publicKey}
        >
          {loading ? 'Settling...' : 'Settle Payment'}
        </button>
      </form>
    </div>
  );
}; 