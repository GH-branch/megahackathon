import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import { RestaurantBillSplit } from '../types/restaurant_bill_split';

export const PROGRAM_ID = new PublicKey("5yivUPu1h8DUKsiSw6kYnTZD7u5bny9SeyweBFfRAyfZ");

const IDL: RestaurantBillSplit = {
  version: "0.1.0",
  name: "restaurant_bill_split",
  instructions: [
    {
      name: "createBill",
      accounts: [
        { name: "bill", isMut: true, isSigner: true },
        { name: "restaurant", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "restaurantName", type: "string" },
        { name: "billId", type: "string" },
        { name: "totalAmount", type: "u64" },
      ],
    },
    {
      name: "addParticipant",
      accounts: [
        { name: "bill", isMut: true, isSigner: false },
        { name: "participant", isMut: true, isSigner: true },
        { name: "user", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [{ name: "amount", type: "u64" }],
    },
    {
      name: "settlePayment",
      accounts: [
        { name: "bill", isMut: true, isSigner: false },
        { name: "participant", isMut: true, isSigner: false },
        { name: "user", isMut: true, isSigner: true },
        { name: "restaurant", isMut: true, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "billAccount",
      type: {
        kind: "struct",
        fields: [
          { name: "restaurant", type: "publicKey" },
          { name: "billId", type: "string" },
          { name: "totalAmount", type: "u64" },
          { name: "paidAmount", type: "u64" },
          { name: "isSettled", type: "bool" },
          { name: "participantsCount", type: "u8" },
        ],
      },
    },
    {
      name: "participantAccount",
      type: {
        kind: "struct",
        fields: [
          { name: "user", type: "publicKey" },
          { name: "bill", type: "publicKey" },
          { name: "amount", type: "u64" },
          { name: "isPaid", type: "bool" },
        ],
      },
    },
  ],
  errors: [
    { code: 6000, name: "AmountOverflow", msg: "Amount would overflow" },
    { code: 6001, name: "BillSettled", msg: "Bill already settled" },
    { code: 6002, name: "AlreadyPaid", msg: "Participant already paid" },
  ],
};

export function getProgram(provider: anchor.AnchorProvider) {
  return new Program<RestaurantBillSplit>(IDL, PROGRAM_ID, provider);
}

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
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    return { tx };
  }

  async getBill(billPublicKey: PublicKey) {
    try {
      return await this.program.account.billAccount.fetch(billPublicKey);
    } catch (error) {
      console.error('Error fetching bill:', error);
      throw error;
    }
  }

  async getParticipant(participantPublicKey: PublicKey) {
    try {
      return await this.program.account.participantAccount.fetch(participantPublicKey);
    } catch (error) {
      console.error('Error fetching participant:', error);
      throw error;
    }
  }
} 