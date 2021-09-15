import { ContractTransaction } from "ethers";
import { getVmError } from "../core/contracts/contract";

expect.extend({
  async transactionRejectsWith(pendingTx: Promise<ContractTransaction>, message: string | RegExp) {
    try {
      await pendingTx;
      return {
        pass: false,
        message: () => "Transaction did not revert as expected",
      };
    } catch (e) {
      const rejectMsg = getVmError(e);

      if (!rejectMsg) {
        return {
          pass: false,
          message: () => `Unexpected rejection: ${e.toString()}`,
        };
      }

      if (typeof message === "string" && rejectMsg.includes(message)) {
        return {
          pass: true,
          message: () => `Reject message includes the desired message: ${rejectMsg}`,
        };
      }

      if (typeof message === "object" && message.test(rejectMsg)) {
        return {
          pass: true,
          message: () => `Reject message includes the desired message: ${rejectMsg}`,
        };
      }

      return {
        pass: false,
        message: () => `Reject message (${rejectMsg}) does not contain the desired message (${message})`,
      };
    }
  },
});
