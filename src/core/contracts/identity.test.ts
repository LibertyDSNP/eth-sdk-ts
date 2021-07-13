import { ContractReceipt, ethers, BigNumber } from "ethers";
import { EthereumAddress } from "../../types/Strings";
import { getContractAddress, findEvent } from "./contract";
import {
  DelegateAddParams,
  getRegistrationsByIdentity,
  getRegistratiosByPublicAddress,
  removeDelegate,
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
  getDelegateIdentitiesFrom,
  // removeDelegate,
} = identity;

import { EthAddressRegex } from "../../test/matchers";
import { setupConfig } from "../../test/sdkTestConfig";
import { revertHardhat, setupSnapshot, snapshotHardhat } from "../../test/hardhatRPC";
import { MissingContract } from "../../config";
import { Identity__factory } from "../../types/typechain";
import { signEIP712Message } from "../../test/helpers/EIP712";
import { changeAddress, changeHandle, register } from "./registry";
import { getSignerForAccount } from "../../test/testAccounts";

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
    if (!addr) throw MissingContract;
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
    const fakeAddress = "0x1ea32de10d5a18e55debaf379b26cc0c6952b168";

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

    setupSnapshot();

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

    setupSnapshot();

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
      it("throws error", async () => {
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

  describe("#getDelegateIdentitiesFrom", () => {
    describe("when public address is not associated to an identity contract", () => {
      it("returns empty list of identities", async () => {
        const fakeAddress = "0x1ea32de10d5a18e55debaf379b26cc0c6952b168";

        const result = await getDelegateIdentitiesFrom(fakeAddress);

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
        const result = await getDelegateIdentitiesFrom(contractOwner);

        expect(result.length).toBe(1);
        expect(result).toEqual([contractAddress]);
      });

      describe("and an update is made to change permission", () => {
        beforeEach(async () => {
          await upsertDelegate(contractAddress, contractOwner, 0x1, { signer: signer });
        });

        it("returns one identity contract address associated with public address", async () => {
          const result = await getDelegateIdentitiesFrom(contractOwner);

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

        beforeEach(async () => {
          await removeDelegate(contractAddress, contractOwner, 0x1, { signer: signer });
        });

        it("returns zero identity contract address associated with public address", async () => {
          const result = await getDelegateIdentitiesFrom(contractOwner);

          expect(result.length).toBe(0);
          expect(result).toEqual([]);
        });
      });

      describe("and delegate is scheduled to be removed after 10 blocks", () => {
        beforeAll(async () => {
          await snapshotHardhat(provider);
        });

        afterAll(async () => {
          await revertHardhat(provider);
        });

        beforeEach(async () => {
          const curentBlockNumber = provider.blockNumber;
          await removeDelegate(contractAddress, contractOwner, curentBlockNumber + 0x10, { signer: signer });
        });
      });

      it("continues to returns identity contract address associated with public address", async () => {
        const result = await getDelegateIdentitiesFrom(contractOwner);

        expect(result.length).toBe(1);
        expect(result).toEqual([contractAddress]);
      });
    });

    describe("when public address is associatted to many identities", () => {
      let contractOwner: EthereumAddress;
      let contractAddressOne: EthereumAddress;
      let contractAddressTwo: EthereumAddress;
      let signer: ethers.Signer;

      beforeAll(async () => {
        await snapshotHardhat(provider);
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

      afterAll(async () => {
        await revertHardhat(provider);
      });

      it("returns two identity contract address associated with public address", async () => {
        const result = await getDelegateIdentitiesFrom(contractOwner);

        expect(result.length).toBe(2);
        expect(result).toEqual([contractAddressOne, contractAddressTwo]);
      });

      describe("and an update is made to change permission to one of the identity contracts", () => {
        beforeEach(async () => {
          await upsertDelegate(contractAddressOne, contractOwner, 0x1, { signer: signer });
        });

        it("##REWORD THIS --returns identity contract address associated with public address", async () => {
          const result = await getDelegateIdentitiesFrom(contractOwner);

          expect(result.length).toBe(2);
          expect(result).toEqual([contractAddressOne, contractAddressTwo]);
        });
      });

      describe("when a delegate is removed", () => {
        beforeEach(async () => {
          await removeDelegate(contractAddressOne, contractOwner, 0x1, { signer: signer });
        });

        it("##REWORD THIS --returns one identity contract address associated with public address", async () => {
          const result = await getDelegateIdentitiesFrom(contractOwner);

          expect(result.length).toBe(1);
          expect(result).toEqual([contractAddressTwo]);
        });
      });
    });
  });

  describe("#getRegistratiosByPublicAddress", () => {
    let contractOwner: EthereumAddress;
    let contractAddressOne: EthereumAddress;
    let contractAddressTwo: EthereumAddress;
    let signer: ethers.Signer;

    beforeAll(async () => {
      await snapshotHardhat(provider);
    });

    beforeEach(async () => {
      signer = getSignerForAccount(2);
      contractOwner = await signer.getAddress();
      const identityContractOne = await new Identity__factory(signer).deploy(contractOwner);
      const identityContractTwo = await new Identity__factory(signer).deploy(contractOwner);
      await identityContractOne.deployed();
      await identityContractTwo.deployed();
      contractAddressOne = identityContractOne.address;
      contractAddressTwo = identityContractTwo.address;

      const handleOne = "earth";
      const handleTwo = "wind";
      const handleThree = "fire";

      await register(contractAddressOne, handleOne);
      await register(contractAddressOne, handleTwo);
      await register(contractAddressTwo, handleThree);
    });

    afterAll(async () => {
      await revertHardhat(provider);
    });

    describe("when public key has many identities, and identity has many registrations", () => {
      it("returns all registrations belonging to public key", async () => {
        const result = await getRegistratiosByPublicAddress(contractOwner);

        expect(result).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ contractAddr: contractAddressOne, handle: "earth" }),
            expect.objectContaining({ contractAddr: contractAddressOne, handle: "wind" }),
            expect.objectContaining({ contractAddr: contractAddressTwo, handle: "fire" }),
          ])
        );
      });
    });
  });

  describe("#getRegistrationsByIdentity", () => {
    describe("when identity is not associated to a registration", () => {
      let identityContract: EthereumAddress;

      setupSnapshot();

      beforeAll(async () => {
        const contractOwner = await signer.getAddress();
        const identityContract = await new Identity__factory(signer).deploy(contractOwner);
        await identityContract.deployed();
      });

      it("returns an empty array", async () => {
        const result = await getRegistrationsByIdentity(identityContract);

        expect(result).toEqual([]);
      });
    });

    describe("when identity is associated (belongs) to one registration", () => {
      let identityContractAddress: EthereumAddress;
      const handle = "Joe";
      const newHandle = "JoeNoSe";

      beforeAll(async () => {
        await snapshotHardhat(provider);
      });

      afterAll(async () => {
        await revertHardhat(provider);
      });

      beforeAll(async () => {
        const contractOwner = await signer.getAddress();
        const identityContract = await new Identity__factory(signer).deploy(contractOwner);
        await identityContract.deployed();

        identityContractAddress = identityContract.address;
        await register(identityContractAddress, handle);
      });

      it("returns one registration", async () => {
        const result = await getRegistrationsByIdentity(identityContractAddress);

        expect(result.length).toEqual(1);
        expect(result[0]).toEqual(
          expect.objectContaining({
            handle: "Joe",
            contractAddr: identityContractAddress,
            dsnpUserId: expect.any(String),
          })
        );
      });

      describe("and registration handle is updated", () => {
        beforeAll(async () => {
          // look into this test it might be wrong it should call updateHandle
          await changeHandle(handle, newHandle);
        });

        it("returns one registration with updated handle", async () => {
          const result = await getRegistrationsByIdentity(identityContractAddress);
          expect(result.length).toEqual(1);
          expect(result[0]).toEqual(
            expect.objectContaining({
              handle: "JoeNoSe",
              contractAddr: identityContractAddress,
              dsnpUserId: expect.any(String),
            })
          );
        });

        describe("and a new identity addr is set to registration", () => {
          let newIdentityContract: EthereumAddress;

          beforeAll(async () => {
            const contractOwner = await signer.getAddress();
            const identityContract = await new Identity__factory(signer).deploy(contractOwner);
            await identityContract.deployed();
            newIdentityContract = identityContract.address;
            await changeAddress(newHandle, newIdentityContract);
          });

          it("returns zero registration associated with old identity", async () => {
            const result = await getRegistrationsByIdentity(identityContractAddress);
            expect(result).not.toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  contractAddr: identityContractAddress,
                }),
              ])
            );
          });
        });
      });
    });

    describe("when identity is associated (belongs) to many registrations", () => {
      let identityContractAddress: EthereumAddress;

      beforeAll(async () => {
        await snapshotHardhat(provider);
      });

      afterAll(async () => {
        await revertHardhat(provider);
      });

      beforeAll(async () => {
        const handleOne = "YoSe";
        const handleTwo = "YoNoSabo";
        const contractOwner = await signer.getAddress();
        const identityContract = await new Identity__factory(signer).deploy(contractOwner);
        await identityContract.deployed();

        identityContractAddress = identityContract.address;
        await register(identityContractAddress, handleOne);
        await register(identityContractAddress, handleTwo);
      });

      it("returns multiple registrations", async () => {
        const result = await getRegistrationsByIdentity(identityContractAddress);

        expect(result).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              contractAddr: identityContractAddress,
              handle: "YoSe",
            }),
            expect.objectContaining({
              contractAddr: identityContractAddress,
              handle: "YoNoSabo",
            }),
          ])
        );
      });

      describe("and one of the registrations updates the identity address", () => {
        beforeEach(async () => {
          const contractOwner = await signer.getAddress();
          const identityContract = await new Identity__factory(signer).deploy(contractOwner);
          await identityContract.deployed();
          const newIdentityContract = identityContract.address;
          const handleTwo = "YoNoSabo";
          await changeAddress(handleTwo, newIdentityContract);
        });

        it("returns only registrations associated with the indentity", async () => {
          const result = await getRegistrationsByIdentity(identityContractAddress);

          expect(result).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                contractAddr: identityContractAddress,
                handle: "YoSe",
              }),
            ])
          );
        });

        describe("and all identity association with registrations are removed", () => {
          beforeEach(async () => {
            const contractOwner = await signer.getAddress();
            const identityContract = await new Identity__factory(signer).deploy(contractOwner);
            await identityContract.deployed();
            const newIdentityContract = identityContract.address;
            const handleOne = "YoSe";
            await changeAddress(handleOne, newIdentityContract);
          });

          it("returns only registrations associated with the indentity", async () => {
            const result = await getRegistrationsByIdentity(identityContractAddress);

            expect(result).toEqual([]);
          });
        });
      });
    });
    // });
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
