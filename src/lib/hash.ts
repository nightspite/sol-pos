import { SHA256 } from "crypto-js";

export const hashPassword = (string: string) => {
  return SHA256(string).toString();
};