'use client';

import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { RestaurantBillSplit } from '../types/RestaurantBillSplit';
import { BillSplitProgram, PROGRAM_ID } from '../utils/program';
import { IDL } from '../utils/idl';

export function useBillSplitProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  return useMemo(() => {
    if (!wallet) return null;

    const provider = new anchor.AnchorProvider(
      connection,
      wallet,
      { commitment: 'confirmed' }
    );

    const program = new Program<RestaurantBillSplit>(
      IDL as any,
      PROGRAM_ID,
      provider
    );

    return new BillSplitProgram(program, provider);
  }, [connection, wallet]);
} 