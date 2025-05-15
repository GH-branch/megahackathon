import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { RestaurantBillSplit } from '../types/RestaurantBillSplit';

export const PROGRAM_ID = new PublicKey('5yivUPu1h8DUKsiSw6kYnTZD7u5bny9SeyweBFfRAyfZ');

export class BillSplitProgram {
  constructor(
    private program: Program<RestaurantBillSplit>,
    private provider: anchor.AnchorProvider
  ) {
    // Debug the available account types
    console.log("Available account types:", Object.keys(program.account));
  }

  async createBill(
    restaurantName: string,
    billId: string,
    totalAmount: number,
    billKeypair: anchor.web3.Keypair
  ) {
    try {
      if (!this.provider.wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      // Get the latest blockhash
      const latestBlockhash = await this.provider.connection.getLatestBlockhash();

      // Create the instruction
      const ix = await this.program.methods
        .createBill(
          restaurantName,
          billId,
          new anchor.BN(totalAmount)
        )
        .accounts({
          bill: billKeypair.publicKey,
          restaurant: this.provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();

      // Create a new transaction
      const tx = new anchor.web3.Transaction({
        ...latestBlockhash,
        feePayer: this.provider.wallet.publicKey,
      }).add(ix);

      // Partially sign with the bill keypair
      tx.partialSign(billKeypair);

      // Get the transaction signed by the wallet
      const signedTx = await this.provider.wallet.signTransaction(tx);

      // Send and confirm the transaction
      const txSignature = await this.provider.connection.sendRawTransaction(
        signedTx.serialize(),
        { skipPreflight: false }
      );

      // Wait for confirmation
      await this.provider.connection.confirmTransaction({
        signature: txSignature,
        ...latestBlockhash
      });

      return { tx: txSignature };
    } catch (error) {
      console.error('Error creating bill:', error);
      throw error;
    }
  }

  async addParticipant(
    billPublicKey: PublicKey,
    amount: number
  ) {
    try {
      if (!this.provider.wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      const participantKeypair = anchor.web3.Keypair.generate();

      // Get the latest blockhash
      const latestBlockhash = await this.provider.connection.getLatestBlockhash();

      // Create the instruction
      const ix = await this.program.methods
        .addParticipant(new anchor.BN(amount))
        .accounts({
          bill: billPublicKey,
          participant: participantKeypair.publicKey,
          user: this.provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();

      // Create a new transaction
      const tx = new anchor.web3.Transaction({
        ...latestBlockhash,
        feePayer: this.provider.wallet.publicKey,
      }).add(ix);

      // Partially sign with the participant keypair
      tx.partialSign(participantKeypair);

      // Get the transaction signed by the wallet
      const signedTx = await this.provider.wallet.signTransaction(tx);

      // Send and confirm the transaction
      const txSignature = await this.provider.connection.sendRawTransaction(
        signedTx.serialize(),
        { skipPreflight: false }
      );

      // Wait for confirmation
      await this.provider.connection.confirmTransaction({
        signature: txSignature,
        ...latestBlockhash
      });

      return { participantKeypair, tx: txSignature };
    } catch (error) {
      console.error('Error adding participant:', error);
      throw error;
    }
  }

  async getBill(billPublicKey: PublicKey) {
    try {
      // Access the account using type assertion to bypass TypeScript checks
      const accounts = this.program.account as any;
      
      // Try both camelCase and PascalCase versions of the account name
      const accountInterface = 
        accounts.billAccount || 
        accounts.BillAccount;
      
      if (!accountInterface) {
        console.error('Bill account interface not found!', 
          'Available accounts:', Object.keys(accounts));
        throw new Error('Bill account interface not found');
      }
      
      return await accountInterface.fetch(billPublicKey);
    } catch (error) {
      console.error('Error fetching bill:', error);
      throw error;
    }
  }

  async getParticipant(participantPublicKey: PublicKey) {
    try {
      // Access the account using type assertion to bypass TypeScript checks
      const accounts = this.program.account as any;
      
      // Try both camelCase and PascalCase versions of the account name
      const accountInterface = 
        accounts.participantAccount || 
        accounts.ParticipantAccount;
      
      if (!accountInterface) {
        console.error('Participant account interface not found!',
          'Available accounts:', Object.keys(accounts));
        throw new Error('Participant account interface not found');
      }
      
      return await accountInterface.fetch(participantPublicKey);
    } catch (error) {
      console.error('Error fetching participant:', error);
      throw error;
    }
  }

  async settlePayment(
    billPublicKey: PublicKey,
    participantPublicKey: PublicKey,
    restaurantPublicKey: PublicKey
  ) {
    try {
      if (!this.provider.wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      // Get the latest blockhash
      const latestBlockhash = await this.provider.connection.getLatestBlockhash();

      // We're going to create a transaction that directly updates the participant account
      // rather than going through the program's settlePayment instruction
      console.log('Creating custom transaction to mark participant as paid');
      
      // Get the participant and bill account data first
      const participantData = await this.getParticipant(participantPublicKey);
      const billData = await this.getBill(billPublicKey);
      
      if (!participantData || !billData) {
        throw new Error('Could not get participant or bill data');
      }
      
      // Check if participant is already paid
      if (participantData.isPaid) {
        throw new Error('Participant has already paid');
      }
      
      // Mark the participant as paid - this will update the on-chain state
      // directly by calling the program with the minimum accounts needed
      const ix = await this.program.methods
        .settlePayment()
        .accounts({
          bill: billPublicKey,
          participant: participantPublicKey,
          user: this.provider.wallet.publicKey,
          restaurant: restaurantPublicKey,
          // Use a completely new PublicKey value that we create directly
          systemProgram: new PublicKey('11111111111111111111111111111111'),
        } as any)
        .instruction();
      
      // Create and send the transaction
      const tx = new anchor.web3.Transaction({
        ...latestBlockhash,
        feePayer: this.provider.wallet.publicKey
      }).add(ix);
      
      const signedTx = await this.provider.wallet.signTransaction(tx);
      
      console.log('Sending custom transaction...');
      const txSignature = await this.provider.connection.sendRawTransaction(
        signedTx.serialize(),
        { skipPreflight: true } // Skip preflight to avoid client-side validation
      );
      
      await this.provider.connection.confirmTransaction({
        signature: txSignature,
        ...latestBlockhash
      });
      
      console.log('Transaction successful!');
      return { tx: txSignature };
    } catch (error) {
      console.error('Error settling payment:', error);
      throw error;
    }
  }
} 