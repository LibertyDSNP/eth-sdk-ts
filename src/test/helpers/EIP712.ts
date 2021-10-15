import { ethers } from "ethers";
import { EIP712Signature, TypedData } from "../../core/contracts/utilities";
import { EthereumAddress } from "../../types/Strings";

export const signEIP712Message = async (
  address: EthereumAddress,
  provider: ethers.providers.JsonRpcProvider,
  typedData: TypedData
): Promise<EIP712Signature> => {
  const signature = await provider.send("eth_signTypedData_v4", [address, JSON.stringify(typedData)]);

  return {
    r: "0x" + signature.substring(2).substring(0, 64),
    s: "0x" + signature.substring(2).substring(64, 128),
    v: parseInt(signature.substring(2).substring(128, 130), 16),
  };
};
