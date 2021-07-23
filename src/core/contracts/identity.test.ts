import { ContractReceipt, ethers, BigNumber } from "ethers";
import { EthereumAddress } from "../../types/Strings";
import { getContractAddress, findEvent } from "./contract";
import {
  DelegateAddParams,
  getDelegateIdentitiesFor,
  removeDelegate,
  resolveDelegatesFor,
  DelegateLogData,
  getAllDelegateLogsFor,
} from "./identity";

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
import { revertHardhat, setupSnapshot, snapshotHardhat } from "../../test/hardhatRPC";
import { Identity__factory } from "../../types/typechain";
import { signEIP712Message } from "../../test/helpers/EIP712";
import { getSignerForAccount } from "../../test/testAccounts";
import { mineBlocks } from "../../test/utilities";

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

  describe("#getDelegateIdentitiesFor", () => {
    describe("when public address is not associated to an identity contract", () => {
      beforeAll(async () => {
        await snapshotHardhat(provider);
      });

      beforeAll(async () => {
        const signer = getSignerForAccount(10);
        const contractOwner = await signer.getAddress();
        const identityContract = await new Identity__factory(signer).deploy(contractOwner);
        await identityContract.deployed();
      });

      afterAll(async () => {
        await revertHardhat(provider);
      });

      it("returns empty list of identities", async () => {
        const fakeAddress = "0x1ea32de10d5a18e55debaf379b26cc0c6952b168";

        const result = await getDelegateIdentitiesFor(fakeAddress);

        expect(result).toEqual([]);
      });
    });

    describe("when a public address is associated (belongs) to a single identity contract", () => {
      let contractOwner: EthereumAddress;
      let contractAddress: EthereumAddress;
      let signer: ethers.Signer;

      beforeAll(async () => {
        await snapshotHardhat(provider);
      });

      beforeAll(async () => {
        signer = getSignerForAccount(10);
        contractOwner = await signer.getAddress();

        const identityContract = await new Identity__factory(signer).deploy(contractOwner);
        await identityContract.deployed();
        contractAddress = identityContract.address;
      });

      afterAll(async () => {
        await revertHardhat(provider);
      });

      it("returns one identity contract address associated with public address", async () => {
        const result = await getDelegateIdentitiesFor(contractOwner);

        expect(result.length).toBe(1);
        expect(result).toEqual([contractAddress]);
      });

      describe("and an update is made to change permission", () => {
        beforeEach(async () => {
          await upsertDelegate(contractAddress, contractOwner, 0x1, { signer: signer });
        });

        it("returns one identity contract address associated with public address", async () => {
          const result = await getDelegateIdentitiesFor(contractOwner);

          expect(result.length).toBe(1);
          expect(result).toEqual([contractAddress]);
        });
      });

      describe("and delegate is removed immediately", () => {
        beforeAll(async () => {
          await snapshotHardhat(provider);
        });

        afterAll(async () => {
          await revertHardhat(provider);
        });

        beforeAll(async () => {
          await removeDelegate(contractAddress, contractOwner, 0x1, { signer: signer });
        });

        it("returns zero identity contract address associated with public address", async () => {
          const result = await getDelegateIdentitiesFor(contractOwner);

          expect(result.length).toBe(0);
          expect(result).toEqual([]);
        });
      });

      describe("and delegate is scheduled to be removed after 10 blocks", () => {
        const delegateBlockPeriod = 10;

        beforeAll(async () => {
          await snapshotHardhat(provider);
        });

        afterAll(async () => {
          await revertHardhat(provider);
        });

        beforeAll(async () => {
          const curentBlockNumber = await provider.getBlockNumber();
          const blockRemovalNumber = curentBlockNumber + delegateBlockPeriod;
          await removeDelegate(contractAddress, contractOwner, blockRemovalNumber, { signer: signer });
        });

        describe("and is prior the schedule removal", () => {
          it("continues to returns identity contract address associated with public address", async () => {
            const result = await getDelegateIdentitiesFor(contractOwner);

            expect(result.length).toBe(1);
            expect(result).toEqual([contractAddress]);
          });
        });

        describe("and is past the schedule removal", () => {
          beforeEach(async () => {
            await mineBlocks(delegateBlockPeriod, provider);
          });

          it("continues to returns identity contract address associated with public address", async () => {
            const result = await getDelegateIdentitiesFor(contractOwner);
            expect(result.length).toBe(0);
            expect(result).toEqual([]);
          });
        });
      });
    });

    describe("when public address is associated to many identities", () => {
      let contractOwner: EthereumAddress;
      let contractAddressOne: EthereumAddress;
      let contractAddressTwo: EthereumAddress;
      let signer: ethers.Signer;

      beforeAll(async () => {
        await snapshotHardhat(provider);
      });

      afterAll(async () => {
        await revertHardhat(provider);
      });

      beforeEach(async () => {
        signer = getSignerForAccount(1);
        contractOwner = await signer.getAddress();
        const identityContractOne = await new Identity__factory(signer).deploy(contractOwner);
        const identityContractTwo = await new Identity__factory(signer).deploy(contractOwner);
        await identityContractOne.deployed();
        await identityContractTwo.deployed();
        contractAddressOne = identityContractOne.address;
        contractAddressTwo = identityContractTwo.address;
      });

      it("returns two identity contract address associated with public address", async () => {
        const result = await getDelegateIdentitiesFor(contractOwner);

        expect(result.length).toBe(2);
        expect(result).toEqual([contractAddressOne, contractAddressTwo]);
      });

      describe("and an update is made to change permission to one of the identity contracts", () => {
        beforeEach(async () => {
          await upsertDelegate(contractAddressOne, contractOwner, 0x1, { signer: signer });
        });

        it("returns identity contract address associated with public address", async () => {
          const result = await getDelegateIdentitiesFor(contractOwner);

          expect(result.length).toBe(2);
          expect(result).toEqual([contractAddressOne, contractAddressTwo]);
        });
      });

      describe("when a delegate is removed", () => {
        beforeEach(async () => {
          await removeDelegate(contractAddressOne, contractOwner, 0x1, { signer: signer });
        });

        it("returns one identity contract address associated with public address", async () => {
          const result = await getDelegateIdentitiesFor(contractOwner);

          expect(result.length).toBe(1);
          expect(result).toEqual([contractAddressTwo]);
        });
      });
    });
  });

  describe("#resolveDelegatesFor", () => {
    describe("when logs contain only DSNPAddDelegate data", () => {
      const provider = ({
        getBlockNumber: jest.fn().mockResolvedValue(100),
      } as Partial<ethers.providers.Provider>) as ethers.providers.Provider;

      const delegateAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
      const delegateLogData: DelegateLogData[] = [
        {
          name: "DSNPAddDelegate",
          identityAddress: "0x71C95911E9a5D330f4D621842EC243EE1343292e",
          delegate: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          blockNumber: 330,
        },
      ];

      it("returns delegate log data for one", async () => {
        expect(await resolveDelegatesFor(delegateAddress, delegateLogData, { provider: provider })).toEqual(
          delegateLogData
        );
      });
    });

    describe("when adding a delegate is set to be removed in a future block date", () => {
      const provider = ({
        getBlockNumber: jest.fn().mockResolvedValue(332),
      } as Partial<ethers.providers.Provider>) as ethers.providers.Provider;

      const delegateAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
      const delegateLogData: DelegateLogData[] = [
        {
          name: "DSNPAddDelegate",
          identityAddress: "0x71C95911E9a5D330f4D621842EC243EE1343292e",
          delegate: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          blockNumber: 330,
        },
        {
          name: "DSNPRemoveDelegate",
          identityAddress: "0x71C95911E9a5D330f4D621842EC243EE1343292e",
          delegate: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          blockNumber: 331,
          endBlock: 400,
        },
      ];

      it("returns delegate log data", async () => {
        const result = await resolveDelegatesFor(delegateAddress, delegateLogData, { provider: provider });
        expect(result).toEqual([delegateLogData[1]]);
      });
    });

    describe("when a delegate is removed", () => {
      const provider = ({
        getBlockNumber: jest.fn().mockResolvedValue(333),
      } as Partial<ethers.providers.Provider>) as ethers.providers.Provider;

      it("returns zero delegate log data", async () => {
        const delegateAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
        const delegateLogData: DelegateLogData[] = [
          {
            name: "DSNPAddDelegate",
            identityAddress: "0x8464135c8F25Da09e49BC8782676a84730C318bC",
            delegate: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            blockNumber: 330,
          },
          {
            name: "DSNPRemoveDelegate",
            identityAddress: "0x8464135c8F25Da09e49BC8782676a84730C318bC",
            delegate: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            blockNumber: 331,
            endBlock: 0,
          },
        ];

        expect(await resolveDelegatesFor(delegateAddress, delegateLogData, { provider: provider })).toEqual([]);
      });
    });

    describe("when delegate is added removed and re-added", () => {
      const provider = ({
        getBlockNumber: jest.fn().mockResolvedValue(400),
      } as Partial<ethers.providers.Provider>) as ethers.providers.Provider;

      const delegateAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

      const delegateLogData: DelegateLogData[] = [
        {
          name: "DSNPAddDelegate",
          identityAddress: "0x71C95911E9a5D330f4D621842EC243EE1343292e",
          delegate: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          blockNumber: 330,
        },
        {
          name: "DSNPRemoveDelegate",
          identityAddress: "0x71C95911E9a5D330f4D621842EC243EE1343292e",
          delegate: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          blockNumber: 331,
          endBlock: 333,
        },
        {
          name: "DSNPAddDelegate",
          identityAddress: "0x71C95911E9a5D330f4D621842EC243EE1343292e",
          delegate: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          blockNumber: 332,
        },
      ];

      it("returns deleate log data with with re-added delegate", async () => {
        expect(await resolveDelegatesFor(delegateAddress, delegateLogData, { provider: provider })).toEqual([
          delegateLogData[2],
        ]);
      });
    });

    describe("when log data contains multiple indentities", () => {
      const provider = ({
        getBlockNumber: jest.fn().mockResolvedValue(350),
      } as Partial<ethers.providers.Provider>) as ethers.providers.Provider;

      const delegateAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

      const delegateLogData: DelegateLogData[] = [
        {
          name: "DSNPAddDelegate",
          identityAddress: "0x71C95911E9a5D330f4D621842EC243EE1343292e",
          delegate: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          blockNumber: 330,
        },
        {
          name: "DSNPAddDelegate",
          identityAddress: "0x8464135c8F25Da09e49BC8782676a84730C318bC",
          delegate: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          blockNumber: 332,
        },
        {
          name: "DSNPRemoveDelegate",
          identityAddress: "0x8464135c8F25Da09e49BC8782676a84730C318bC",
          delegate: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          blockNumber: 333,
          endBlock: 400,
        },
      ];

      it("returns delegate data with two identities addreses", async () => {
        const result = await resolveDelegatesFor(delegateAddress, delegateLogData, { provider: provider });
        expect(result).toEqual([delegateLogData[0], delegateLogData[2]]);
      });
    });
  });

  describe("#getAllDelegateLogsFor", () => {
    let contractOwner: EthereumAddress;
    let contractAddress: EthereumAddress;

    beforeAll(async () => {
      await snapshotHardhat(provider);
    });

    afterAll(async () => {
      await revertHardhat(provider);
    });

    describe("when there are no logs (delegates) associated with address", () => {
      const fakeAddress = "0x1Ea32de10D5a18e55DEBAf379B26Cc0c6952B168";

      it("return an empty array", async () => {
        expect(await getAllDelegateLogsFor(fakeAddress)).toEqual([]);
      });
    });

    describe("when there are logs (delegates) associated with address", () => {
      beforeAll(async () => {
        const signer = getSignerForAccount(3);
        contractOwner = await signer.getAddress();
        const identityContract = await new Identity__factory(signer).deploy(contractOwner);
        await identityContract.deployed();
        contractAddress = identityContract.address;
      });

      it("returns logs for delegate add", async () => {
        const expected = [
          expect.objectContaining({
            fragment: expect.objectContaining({
              args: expect.objectContaining({ delegate: contractOwner }),
              name: expect.stringMatching(/DSNPAddDelegate/),
            }),
            log: expect.objectContaining({
              address: contractAddress,
              blockNumber: expect.any(Number),
            }),
          }),
        ];

        expect(await getAllDelegateLogsFor(contractOwner)).toEqual(expect.arrayContaining(expected));
      });
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
