import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useMemo, useState } from "react";
import * as anchor from "@project-serum/anchor";
import { getProgram } from "../utils/program";
import { RestaurantBillSplit } from "../types/restaurant_bill_split";
import { Program } from "@project-serum/anchor";

export const useProgram = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [program, setProgram] = useState<Program<RestaurantBillSplit> | null>(null);

  useEffect(() => {
    if (wallet) {
      const provider = new anchor.AnchorProvider(
        connection,
        wallet,
        anchor.AnchorProvider.defaultOptions()
      );
      const program = getProgram(provider);
      setProgram(program);
    }
  }, [wallet, connection]);

  return program;
}; 