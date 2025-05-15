import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { RestaurantBillSplit } from "../types/restaurant_bill_split";

const PROGRAM_ID = new PublicKey("5yivUPu1h8DUKsiSw6kYnTZD7u5bny9SeyweBFfRAyfZ");

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
        { name: "userToken", isMut: true, isSigner: false },
        { name: "restaurantToken", isMut: true, isSigner: false },
        { name: "tokenProgram", isMut: false, isSigner: false },
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

export async function createBill(
  program: Program<RestaurantBillSplit>,
  restaurantName: string,
  billId: string,
  totalAmount: anchor.BN
) {
  const bill = anchor.web3.Keypair.generate();
  
  await program.methods
    .createBill(restaurantName, billId, totalAmount)
    .accounts({
      bill: bill.publicKey,
      restaurant: program.provider.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([bill])
    .rpc();

  return bill;
}

export async function addParticipant(
  program: Program<RestaurantBillSplit>,
  billPublicKey: PublicKey,
  amount: anchor.BN
) {
  const participant = anchor.web3.Keypair.generate();
  
  await program.methods
    .addParticipant(amount)
    .accounts({
      bill: billPublicKey,
      participant: participant.publicKey,
      user: program.provider.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([participant])
    .rpc();

  return participant;
}

export async function settlePayment(
  program: Program<RestaurantBillSplit>,
  billPublicKey: PublicKey,
  participantPublicKey: PublicKey,
  userTokenAccount: PublicKey,
  restaurantTokenAccount: PublicKey
) {
  await program.methods
    .settlePayment()
    .accounts({
      bill: billPublicKey,
      participant: participantPublicKey,
      user: program.provider.publicKey,
      userToken: userTokenAccount,
      restaurantToken: restaurantTokenAccount,
      tokenProgram: new PublicKey("11111111111111111111111111111111"),
    })
    .rpc();
} 