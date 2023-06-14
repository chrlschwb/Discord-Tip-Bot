import { signatureVerify } from "@polkadot/util-crypto";

export interface ClaimVerify {
  challenge: string;
  decodeChallenge: string;
  wallet: string;
}
export async function transferChallenge({
  challenge,
  decodeChallenge,
  wallet,
}: ClaimVerify) {
  try {
    const { isValid } = signatureVerify(challenge, decodeChallenge, wallet);
    if (!isValid) {
      console.log("error");
      return false;
    }
    return isValid;
  } catch (error) {
    console.log("error claim");
    return false;
  }
}
