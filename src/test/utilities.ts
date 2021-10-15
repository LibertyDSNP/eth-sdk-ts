import { ethers } from "ethers";

export const checkNumberOfFunctionCalls = async (
  mockFn: jest.Mock,
  timeOutSeconds: number,
  times: number
): Promise<boolean> => {
  for (let i = 0; i < timeOutSeconds && mockFn.mock.calls.length < times; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return mockFn.mock.calls.length >= times;
};

/**
 * mineBlocks() Mines a block
 *
 * @param numberOfBlocks - The number of blocks to mine
 * @param provider - The provider to use
 */
export async function mineBlocks(numberOfBlocks: number, provider: ethers.providers.JsonRpcProvider): Promise<void> {
  const promises = Array(numberOfBlocks)
    .fill(0)
    .map(() => provider.send("evm_mine", []));

  await Promise.all(promises);
}
