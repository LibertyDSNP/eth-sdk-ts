import { ContractReceipt, ethers, BigNumber } from "ethers";
import { EthereumAddress } from "../../types/Strings";
import { getContractAddress, findEvent } from "./contract";
import { DelegateAddParams, removeDelegate } from "./identity";

import * as identity from "./identity";
const {
  createCloneProxy,
  createCloneProxyWithOwner,
  createBeaconProxy,
  createBeaconProxyWithOwner,
  createAndRegisterBeaconProxy,
  isAuthorizedTo,
  Permission,
  upsertDelegate,
  createAddDelegateEip712TypedData,
  upsertDelegateBySignature,
  getDomainSeparator,
} = identity;

import { EthAddressRegex } from "../../test/matchers";
import { setupConfig } from "../../test/sdkTestConfig";
import { setupSnapshot } from "../../test/hardhatRPC";
import { Identity__factory } from "../../types/typechain";
import { signEIP712Message } from "../../test/helpers/EIP712";

const OWNER = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8";
const NON_OWNER = "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc";

describe("identity", () => {
  let provider: ethers.providers.JsonRpcProvider;
  let signer: ethers.Signer;

  setupSnapshot();

  beforeAll(() => {
    ({ provider, signer } = setupConfig());
  });

  const getBeacon = async (): Promise<string> => {
    const addr = await getContractAddress(provider, "Beacon");
    return addr;
  };

  describe("createCloneProxy", () => {
    it("creates a proxy contract", async () => {
      const proxyReceipt: ContractReceipt = (await (await createCloneProxy()).wait()) as ContractReceipt;
      const proxyContractEvents =
        proxyReceipt && proxyReceipt.events
          ? proxyReceipt.events.filter((event) => {
              return event.event === "ProxyCreated";
            })
          : [];
      const contractAddress = proxyContractEvents[0].args ? proxyContractEvents[0].args[0] : null;
      expect(contractAddress).toMatch(EthAddressRegex);
    });
  });

  describe("createCloneProxy with owner", () => {
    let proxyReceipt: ContractReceipt;
    let proxyContractEvents: ethers.Event[];
    let contractAddress: EthereumAddress;

    beforeEach(async () => {
      proxyReceipt = (await (await createCloneProxyWithOwner(OWNER)).wait()) as ContractReceipt;
      proxyContractEvents =
        proxyReceipt && proxyReceipt.events && proxyReceipt
          ? proxyReceipt.events.filter((event) => {
              return event.event === "ProxyCreated";
            })
          : [];
      contractAddress = proxyContractEvents[0].args ? proxyContractEvents[0].args[0] : null;
    });

    it("creates a proxy contract", async () => {
      expect(contractAddress).toMatch(EthAddressRegex);
    });

    it("expect isAuthorizedTo to return true for owner", async () => {
      const authorized = await isAuthorizedTo(OWNER, contractAddress, Permission.ANNOUNCE, 0);
      expect(authorized).toBe(true);
    });
    it("expect isAuthorizedTo to return false for non owner", async () => {
      const authorized = await isAuthorizedTo(NON_OWNER, contractAddress, Permission.ANNOUNCE, 0);
      expect(authorized).toBe(false);
    });
  });

  describe("createBeaconProxy", () => {
    it("creates a beacon proxy contract with specified beacon", async () => {
      const beacon = await getBeacon();
      const proxyReceipt: ContractReceipt = (await (await createBeaconProxy(beacon)).wait()) as ContractReceipt;
      const proxyContractEvents =
        proxyReceipt && proxyReceipt.events
          ? proxyReceipt.events.filter((event) => {
              return event.event === "ProxyCreated";
            })
          : [];
      const contractAddress = proxyContractEvents[0].args ? proxyContractEvents[0].args[0] : null;
      expect(contractAddress).toMatch(EthAddressRegex);
    });
  });

  describe("createBeaconProxyWithOwner", () => {
    let proxyReceipt: ContractReceipt;
    let proxyContractEvents: ethers.Event[];
    let contractAddress: EthereumAddress;

    beforeEach(async () => {
      const beacon = await getBeacon();
      proxyReceipt = (await (await createBeaconProxyWithOwner(OWNER, beacon)).wait()) as ContractReceipt;
      proxyContractEvents =
        proxyReceipt && proxyReceipt.events
          ? proxyReceipt.events.filter((event) => {
              return event.event === "ProxyCreated";
            })
          : [];
      contractAddress = proxyContractEvents[0].args ? proxyContractEvents[0].args[0] : null;
    });
    it("creates a beacon proxy contract", async () => {
      expect(contractAddress).toMatch(EthAddressRegex);
    });

    it("expect isAuthorized  to return false or nonOwner", async () => {
      const authorized = await isAuthorizedTo(NON_OWNER, contractAddress, Permission.ANNOUNCE, 0);
      expect(authorized).toBe(false);
    });

    it("expect isAuthorizedTo to return true for owner", async () => {
      const authorized = await isAuthorizedTo(OWNER, contractAddress, Permission.ANNOUNCE, 0);
      expect(authorized).toBe(true);
    });
  });

  describe("#createAndRegisterBeaconProxy", () => {
    const handle = "flarp";
    const fakeAddress = "0x1Ea32de10D5a18e55DEBAf379B26Cc0c6952B168";

    it("returns a Contract Transaction that can be resolved into a DSNP User Id", async () => {
      const transaction = await createAndRegisterBeaconProxy(fakeAddress, handle);

      const receipt = await transaction.wait(1);

      // registration ids start at 1000
      expect(getIdFromReceipt(receipt).toNumber()).toBeGreaterThan(999);

      const address = getAddressFromReceipt(receipt);
      expect(ethers.utils.isAddress(address)).toBeTruthy();
    });
  });

  describe("#getDomainSeparator", () => {
    it("returns a EIP712 domain separator", async () => {
      const fakeContractAddress = "0xfake";
      const expected = {
        chainId: expect.any(Number),
        name: "Identity",
        salt: "0xa0bec69846cdcc8c1ba1eb93be1c5728385a9e26062a73e238b1beda189ac4c9",
        verifyingContract: "0xfake",
        version: "1",
      };

      expect(await getDomainSeparator(fakeContractAddress)).toEqual(expected);
    });
  });

  describe("#upsertDelegate", () => {
    let contractAddress: EthereumAddress;
    let contractOwner: EthereumAddress;

    beforeAll(async () => {
      contractOwner = await signer.getAddress();
      const identityContract = await new Identity__factory(signer).deploy(contractOwner);
      await identityContract.deployed();
      contractAddress = identityContract.address;
    });

    it("adds a new delegate", async () => {
      await upsertDelegate(contractAddress, NON_OWNER, 0x1);

      expect(await isAuthorizedTo(NON_OWNER, contractAddress, 2, 60)).toBeTruthy();
    });

    it("updates a delegate's role", async () => {
      await upsertDelegate(contractAddress, NON_OWNER, 0x2);

      expect(await isAuthorizedTo(NON_OWNER, contractAddress, 1, 60)).toBeTruthy();
    });
  });

  describe("#createAddDelegateEip712TypedData", () => {
    let contractAddress: EthereumAddress;
    let contractOwner: EthereumAddress;
    let typedData: Record<string, unknown>;

    beforeAll(async () => {
      contractOwner = await signer.getAddress();
      const identityContract = await new Identity__factory(signer).deploy(contractOwner);
      await identityContract.deployed();
      contractAddress = identityContract.address;
      typedData = {
        types: {
          EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
            { name: "salt", type: "bytes32" },
          ],
          DelegateAdd: [
            { name: "nonce", type: "uint32" },
            { name: "delegateAddr", type: "address" },
            { name: "role", type: "uint8" },
          ],
        },
        primaryType: "DelegateAdd",
        domain: {
          chainId: expect.any(Number),
          name: "Identity",
          salt: "0xa0bec69846cdcc8c1ba1eb93be1c5728385a9e26062a73e238b1beda189ac4c9",
          verifyingContract: contractAddress,
          version: "1",
        },
      };
    });

    describe("when nonce is included in message", () => {
      const message: DelegateAddParams = {
        delegateAddr: "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
        nonce: 3,
        role: 0x1,
      };

      it("creates an EIP712 data type with the nonce included", async () => {
        const expected = { ...typedData, message };

        expect(await createAddDelegateEip712TypedData(contractAddress, message)).toEqual(expected);
      });

      it("does not call #getNonceForDelegate", async () => {
        jest.spyOn(identity, "getNonceForDelegate");
        await createAddDelegateEip712TypedData(contractAddress, message);
        expect(identity.getNonceForDelegate).not.toHaveBeenCalled();
      });
    });

    describe("when nonce is not included in message", () => {
      const message = {
        delegateAddr: "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
        role: 0x1,
      };

      it("creates an EIP-712 data type and resolves the nonce", async () => {
        const expected = { ...typedData, message: { ...message, nonce: 0 } };
        expect(await createAddDelegateEip712TypedData(contractAddress, message)).toEqual(expected);
      });

      it("calls #getNonceForDelegate", async () => {
        jest.spyOn(identity, "getNonceForDelegate");
        await createAddDelegateEip712TypedData(contractAddress, message);
        expect(identity.getNonceForDelegate).toHaveBeenCalled();
      });
    });
  });

  describe("#upsertDelegateBySignature", () => {
    let contractAddress: EthereumAddress;
    let contractOwner: EthereumAddress;
    const message: DelegateAddParams = {
      delegateAddr: NON_OWNER,
      role: 0x1,
    };

    beforeAll(async () => {
      contractOwner = await signer.getAddress();
      const identityContract = await new Identity__factory(signer).deploy(contractOwner);
      await identityContract.deployed();
      contractAddress = identityContract.address;
    });

    describe("when signature is valid", () => {
      it("adds a delegate", async () => {
        const typedData = await createAddDelegateEip712TypedData(contractAddress, message);
        const { r, s, v } = await signEIP712Message(contractOwner, provider, typedData);

        //eslint-disable-next-line
        await upsertDelegateBySignature(contractAddress, { r, s, v }, (typedData as any).message);

        expect(await isAuthorizedTo(NON_OWNER, contractAddress, 2, 60)).toBeTruthy();
      });
    });

    describe("when signature is not valid", () => {
      it("throws a contract level error", async () => {
        const typedData = await createAddDelegateEip712TypedData(contractAddress, message);
        const { r, s, v } = await signEIP712Message(contractOwner, provider, typedData);

        const addDelegatePendingTx = upsertDelegateBySignature(
          contractAddress,
          { r, s, v },
          {
            nonce: 777,
            role: 1,
            delegateAddr: NON_OWNER,
          }
        );

        await expect(addDelegatePendingTx).transactionRejectsWith(/Signer does not have the DELEGATE_ADD permission/);
      });
    });
  });

  describe("#removeDelegate", () => {
    let contractAddress: EthereumAddress;
    let contractOwner: EthereumAddress;

    beforeAll(async () => {
      contractOwner = await signer.getAddress();
      const identityContract = await new Identity__factory(signer).deploy(contractOwner);
      await identityContract.deployed();
      contractAddress = identityContract.address;

      await upsertDelegate(contractAddress, NON_OWNER, 0x1);
    });

    it("removes a delegate", async () => {
      const currentBlockNumber = await provider.getBlockNumber();
      expect(await isAuthorizedTo(NON_OWNER, contractAddress, 2, currentBlockNumber)).toBeTruthy();
      await removeDelegate(contractAddress, NON_OWNER, currentBlockNumber + 10);
      expect(await isAuthorizedTo(NON_OWNER, contractAddress, 2, currentBlockNumber + 10)).toBeFalsy();
    });
  });
});

const getIdFromReceipt = (receipt: ContractReceipt): BigNumber => {
  const registerEvent = findEvent("DSNPRegistryUpdate", receipt.logs);
  return registerEvent.args[0];
};

const getAddressFromReceipt = (receipt: ContractReceipt): string => {
  const proxyEvent = findEvent("ProxyCreated", receipt.logs);
  return proxyEvent.args[0];
};
