import { Connection, clusterApiUrl } from "@solana/web3.js";
import bs58 from "bs58";

export const connection = new Connection(
  clusterApiUrl('devnet'),
  'confirmed'
);

export const getSolscanUrl = (signature: string) => {
  return `https://solscan.io/tx/${signature}?cluster=devnet`;
}

export const uuidToBase58= (uuid: string) => {
  const simplifedUuid = uuid?.replaceAll("-", "");

  // must be 32 bytes -> uuid is 16 bytes -> double it
  const buffer = Buffer.from(simplifedUuid + simplifedUuid, 'hex');

  const base58 =  bs58.encode(buffer);

  return base58;
}

// export const POS_WALLET_ADDRESS = '43c7F6C8txjShx4ZBzMcyq7smkWjfbMdarFJK6AoDLuY';
export const POS_WALLET_ADDRESS = 'BeedgDke97r7Voh7iu2trSBiR6Z6V8wegfNx3wbxh6yk';

export const USDC_SPL_TOKEN = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';
