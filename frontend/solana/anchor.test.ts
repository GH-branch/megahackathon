import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { PublicKey, Keypair, SystemProgram } from '@solana/web3.js';
import { RestaurantBillSplit } from '../target/types/restaurant_bill_split';
import assert from 'assert';

describe('restaurant-bill-split', () => {
  // Get provider from anchor
  const provider = anchor.Provider.env();
  
  // Set provider
  anchor.setProvider(provider);

  // Get program
  const program = anchor.workspace.RestaurantBillSplit as Program<RestaurantBillSplit>;

  // Generate keypairs for testing
  const restaurantKeypair = Keypair.generate();
  const user1Keypair = Keypair.generate();
  const billKeypair = Keypair.generate();
  const participant1Keypair = Keypair.generate();

  // Constants
  const billId = "BILL123";
  const restaurantName = "Crypto Cafe";
  const totalAmount = new anchor.BN(100000000); // 100 tokens

  it('Creates a bill', async () => {
    try {
      // Create bill
      await program.methods.createBill(
        restaurantName,
        billId,
        totalAmount
      )
      .accounts({
        bill: billKeypair.publicKey,
        restaurant: provider.wallet.publicKey, // Use provider's wallet instead
        systemProgram: SystemProgram.programId,
      })
      .signers([billKeypair])
      .rpc();

      // Fetch and verify bill account
      const billAccount = await program.account.billAccount.fetch(billKeypair.publicKey);
      
      console.log("Bill created:", {
        billId: billAccount.billId,
        totalAmount: billAccount.totalAmount.toString(),
        isSettled: billAccount.isSettled
      });

      assert.strictEqual(billAccount.billId, billId);
      assert.strictEqual(billAccount.totalAmount.toString(), totalAmount.toString());
      assert.strictEqual(billAccount.isSettled, false);
    } catch (error) {
      console.error("Error creating bill:", error);
      throw error;
    }
  });

  it('Adds a participant to the bill', async () => {
    try {
      const participantAmount = new anchor.BN(50000000); // 50 tokens

      await program.methods.addParticipant(participantAmount)
      .accounts({
        bill: billKeypair.publicKey,
        participant: participant1Keypair.publicKey,
        user: provider.wallet.publicKey, // Use provider's wallet instead
        systemProgram: SystemProgram.programId,
      })
      .signers([participant1Keypair])
      .rpc();

      const participantAccount = await program.account.participantAccount.fetch(
        participant1Keypair.publicKey
      );

      console.log("Participant added:", {
        amount: participantAccount.amount.toString(),
        isPaid: participantAccount.isPaid
      });

      assert.strictEqual(participantAccount.amount.toString(), participantAmount.toString());
      assert.strictEqual(participantAccount.isPaid, false);
    } catch (error) {
      console.error("Error adding participant:", error);
      throw error;
    }
  });
});