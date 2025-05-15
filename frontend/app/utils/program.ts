import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { PublicKey, Keypair } from '@solana/web3.js';
import { RestaurantBillSplit } from '../types/RestaurantBillSplit';

export const PROGRAM_ID = new PublicKey('5yivUPu1h8DUKsiSw6kYnTZD7u5bny9SeyweBFfRAyfZ');

export class BillSplitProgram {
  constructor(private program: Program<RestaurantBillSplit>) {}

  async createBill(
    restaurantName: string,
    billId: string,
    totalAmount: number,
    billKeypair: Keypair
  ) {
    const tx = await this.program.methods
      .createBill(restaurantName, billId, new anchor.BN(totalAmount))
      .accounts({
        bill: billKeypair.publicKey,
        restaurant: this.program.provider.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([billKeypair])
      .rpc();

    return { tx, billKeypair };
  }

  async addParticipant(
    billPublicKey: PublicKey,
    amount: number
  ) {
    const participantKeypair = Keypair.generate();

    const tx = await this.program.methods
      .addParticipant(new anchor.BN(amount))
      .accounts({
        bill: billPublicKey,
        participant: participantKeypair.publicKey,
        user: this.program.provider.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([participantKeypair])
      .rpc();

    return { tx, participantKeypair };
  }

  async settlePayment(
    billPublicKey: PublicKey,
    participantPublicKey: PublicKey,
    restaurantPublicKey: PublicKey
  ) {
    const tx = await this.program.methods
      .settlePayment()
      .accounts({
        bill: billPublicKey,
        participant: participantPublicKey,
        user: this.program.provider.publicKey,
        restaurant: restaurantPublicKey,
      })
      .rpc();

    return { tx };
  }

  async getBill(billPublicKey: PublicKey) {
    try {
      return await this.program.account.BillAccount.fetch(billPublicKey);
    } catch (error) {
      console.error('Error fetching bill:', error);
      throw error;
    }
  }

  async getParticipant(participantPublicKey: PublicKey) {
    try {
      return await this.program.account.ParticipantAccount.fetch(participantPublicKey);
    } catch (error) {
      console.error('Error fetching participant:', error);
      throw error;
    }
  }
} 