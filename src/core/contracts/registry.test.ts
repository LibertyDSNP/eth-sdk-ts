import { ethers, Signer } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";

import { DSNPError } from "../errors";
import { InvalidAnnouncementParameterError } from "./errors";
import { revertHardhat, snapshotHardhat, setupSnapshot } from "../../test/hardhatRPC";
import {
  changeAddress,
  changeHandle,
  getDSNPRegistryUpdateEvents,
  register,
  resolveRegistration,
  isSignatureAuthorizedTo,
  getRegistrationsByIdentityAddress,
  Handle,
  getRegistrationsByWalletAddress,
} from "./registry";
import { Identity__factory } from "../../types/typechain";
import { setupConfig } from "../../test/sdkTestConfig";
import { Permission } from "./identity";
import { createBroadcast, Announcement, SignedAnnouncement, sign } from "../announcements";
import { generateBroadcast } from "../../generators/dsnpGenerators";
import {
  getSignerForAccount,
  getURIFromRegisterTransaction,
  newRegistrationForAccountIndex,
  RegistrationWithSigner,
} from "../../test/testAccounts";
import { generateHexString } from "@dsnp/test-generators";
import { convertDSNPUserURIToDSNPUserId, DSNPUserURI } from "../identifiers";
import { EthereumAddress } from "../../types/Strings";
import { mineBlocks } from "../../test/utilities";

describe("registry", () => {
  let signer: Signer;
  let provider: JsonRpcProvider;

  setupSnapshot();

  beforeAll(() => {
    ({ signer, provider } = setupConfig());
  });

  describe("#resolveRegistration", () => {
    const handle = "registered";
    let givenURI: DSNPUserURI;

    beforeAll(async () => {
      await snapshotHardhat(provider);
      const fakeAddress = "0x1Ea32de10D5a18e55DEBAf379B26Cc0c6952B168";
      const identityContract = await new Identity__factory(signer).deploy(fakeAddress);
      await identityContract.deployed();
      const transaction = await register(identityContract.address, handle);
      givenURI = await getURIFromRegisterTransaction(transaction);
    });

    afterAll(async () => {
      await revertHardhat(provider);
    });

    it("Returns the correct id", async () => {
      expect(givenURI).toEqual("dsnp://0x3e8");
      const result = await resolveRegistration(handle);

      expect(result?.dsnpUserURI).toEqual(givenURI);
    });

    it("Returns null for an unfound handle", async () => {
      const result = await resolveRegistration("not-registered");
      expect(result).toBeNull();
    });
  });

  describe("#register", () => {
    const handle = "registered";
    const fakeAddress = "0x1Ea32de10D5a18e55DEBAf379B26Cc0c6952B168";
    let idContractAddr = "";

    beforeAll(async () => {
      await snapshotHardhat(provider);
      const identityContract = await new Identity__factory(signer).deploy(fakeAddress);
      await identityContract.deployed();
      idContractAddr = identityContract.address;
      await register(identityContract.address, handle);
    });

    afterAll(async () => {
      await revertHardhat(provider);
    });

    it("throws for an already registered handle", async () => {
      // Second time for handle
      const pendingTx = register(idContractAddr, handle);
      await expect(pendingTx).transactionRejectsWith(/Handle already exists/);
    });

    it("returns a Contract Transaction that can be resolved into a DSNP User URI", async () => {
      const transaction = await register(idContractAddr, "new-handle");

      expect(await getURIFromRegisterTransaction(transaction)).toEqual("dsnp://0x3e9"); // 1001
    });
  });

  describe("#changeHandle", () => {
    const handle = "registered";
    let idContractAddr = "";

    beforeAll(async () => {
      await snapshotHardhat(provider);
      const identityContract = await new Identity__factory(signer).deploy(await signer.getAddress());
      await identityContract.deployed();
      idContractAddr = identityContract.address;
      await register(identityContract.address, handle);
    });

    afterAll(async () => {
      await revertHardhat(provider);
    });

    it("Succeeds with an unregistered handle", async () => {
      const otherHandle = "completely new";
      const pendingTx = changeHandle(handle, otherHandle);
      await expect(pendingTx).resolves.toBeTruthy();
    });

    it("Throws for the same handle", async () => {
      const pendingTx = changeHandle(handle, handle);
      await expect(pendingTx).transactionRejectsWith(/New handle already exists/);
    });

    it("Throws for an already registered handle", async () => {
      const otherHandle = "reg2";
      await register(idContractAddr, otherHandle);

      const pendingTx = changeHandle(handle, otherHandle);
      await expect(pendingTx).transactionRejectsWith(/New handle already exists/);
    });

    it("returns a Contract Transaction with the DSNPRegistryUpdate Event", async () => {
      const otherHandle = "completely new";
      const contractTransaction = await changeHandle(handle, otherHandle);
      const receipt = await contractTransaction.wait();

      expect(receipt.events).toHaveLength(1);
      expect(receipt.events?.[0]?.event).toEqual("DSNPRegistryUpdate");
    });
  });

  describe("#changeAddress", () => {
    const handle = "registered";
    let newIdContractAddr = "";

    beforeAll(async () => {
      await snapshotHardhat(provider);
      const identityContract = await new Identity__factory(signer).deploy(await signer.getAddress());
      await identityContract.deployed();
      await register(identityContract.address, handle);

      const newIdentityContract = await new Identity__factory(signer).deploy(await signer.getAddress());
      await newIdentityContract.deployed();
      newIdContractAddr = newIdentityContract.address;
    });

    afterAll(async () => {
      await revertHardhat(provider);
    });

    it("Should succeed", async () => {
      const pendingTx = changeAddress(handle, newIdContractAddr);
      await expect(pendingTx).resolves.toBeTruthy();
    });

    it("Should reject for a non-contract address", async () => {
      const fakeAddress = "0x1Ea32de10D5a18e55DEBAf379B26Cc0c6952B168";
      const pendingTx = changeAddress(handle, fakeAddress);
      await expect(pendingTx).rejects.toBeTruthy();
    });

    it("returns a Contract Transaction with the DSNPRegistryUpdate Event", async () => {
      const contractTransaction = await changeAddress(handle, newIdContractAddr);
      const receipt = await contractTransaction.wait();

      expect(receipt.events).toHaveLength(1);
      expect(receipt.events?.[0]?.event).toEqual("DSNPRegistryUpdate");
    });
  });

  describe("getDSNPRegistryUpdateEvents", () => {
    it("can pull one event", async () => {
      const fakeAddress = "0x1Ea32de10D5a18e55DEBAf379B26Cc0c6952B168";
      const identityContract = await new Identity__factory(signer).deploy(fakeAddress);
      await identityContract.deployed();
      const handle = "ZebraButtons";
      const identityContractAddress = identityContract.address;
      await register(identityContractAddress, handle);

      const regs = await getDSNPRegistryUpdateEvents({
        contractAddr: identityContractAddress,
      });

      const expected = expect.objectContaining({
        transactionHash: expect.any(String),
        blockNumber: expect.any(Number),
        contractAddr: identityContractAddress,
        dsnpUserURI: "dsnp://0x" + Number(1000).toString(16),
        handle: handle,
      });

      expect(regs[0]).toEqual(expected);
    });

    it("does not pull other almost matching events", async () => {
      const fakeAddress = "0x1Ea32de10D5a18e55DEBAf379B26Cc0c6952B168";
      const identityContract = await new Identity__factory(signer).deploy(fakeAddress);
      await identityContract.deployed();
      const identityContract2 = await new Identity__factory(signer).deploy(fakeAddress);
      await identityContract2.deployed();
      const handle = "ZebraButtons";
      await register(identityContract.address, handle);
      await register(identityContract2.address, handle + "2");

      const regs = await getDSNPRegistryUpdateEvents({
        contractAddr: identityContract.address,
      });

      const expected = expect.objectContaining({
        transactionHash: expect.any(String),
        blockNumber: expect.any(Number),
        contractAddr: identityContract.address,
        dsnpUserURI: expect.any(String),
        handle: handle,
      });

      expect(regs).toHaveLength(1);
      expect(regs[0]).toEqual(expected);
    });

    it("pulls all the related events for identityContract", async () => {
      const fakeAddress = "0x1Ea32de10D5a18e55DEBAf379B26Cc0c6952B168";
      const identityContract = await new Identity__factory(signer).deploy(fakeAddress);
      await identityContract.deployed();
      const handle = "ZebraButtons";
      const identityContractAddress = identityContract.address;
      await register(identityContractAddress, handle);
      await register(identityContractAddress, handle + "2");

      const regs = await getDSNPRegistryUpdateEvents({
        contractAddr: identityContractAddress,
      });
      expect(regs).toHaveLength(2);
      expect(regs[0].handle).toEqual(handle);
      expect(regs[1].handle).toEqual(handle + "2");
    });

    it("pulls all the related events for matching ids in the correct order", async () => {
      const identityContract = await new Identity__factory(signer).deploy(await signer.getAddress());
      await identityContract.deployed();
      const handle = "ZebraButtons";
      const identityContractAddress = identityContract.address;
      const tx = await register(identityContractAddress, handle);
      const uri = await getURIFromRegisterTransaction(tx);
      await changeHandle(handle, handle + "new");

      const regs = await getDSNPRegistryUpdateEvents({ dsnpUserURI: uri });
      expect(regs).toHaveLength(2);
      expect(regs[0].handle).toEqual(handle);
      expect(regs[1].handle).toEqual(handle + "new");
    });

    it("pulls all events starting at from specified start and end block number", async () => {
      const identityContract = await new Identity__factory(signer).deploy(await signer.getAddress());
      await identityContract.deployed();
      const handle = "DonkeyButtons";
      const handleTwo = "DonkeyButtons2";
      const handleThree = "DonkeyButtons3";

      const identityContractAddress = identityContract.address;
      await register(identityContractAddress, handle);

      await mineBlocks(10, provider);

      const currentBlockNumber = await provider.getBlockNumber();
      await changeHandle(handle, handleTwo);

      await mineBlocks(10, provider);
      await changeHandle(handleTwo, handleThree);

      const result = await getDSNPRegistryUpdateEvents({
        fromBlock: currentBlockNumber,
        endBlock: currentBlockNumber + 10,
      });

      const expected = expect.arrayContaining([
        expect.objectContaining({
          handle: handleTwo,
        }),
      ]);

      const expectedTwo = expect.not.arrayContaining([
        expect.objectContaining({
          handle: handle,
        }),
      ]);

      expect(result.length).toEqual(1);
      expect(result).toEqual(expected);
      expect(result).toEqual(expectedTwo);
    });

    it("pulls all events starting at from specified start block", async () => {
      const identityContract = await new Identity__factory(signer).deploy(await signer.getAddress());
      await identityContract.deployed();
      const handle = "PenguinButtons";
      const handleTwo = "PenguinButtons2";
      const handleThree = "PenguinButtons3";

      const identityContractAddress = identityContract.address;
      await register(identityContractAddress, handle);

      await mineBlocks(10, provider);

      const currentBlockNumber = await provider.getBlockNumber();
      await changeHandle(handle, handleTwo);

      await mineBlocks(10, provider);
      await changeHandle(handleTwo, handleThree);

      const result = await getDSNPRegistryUpdateEvents({
        fromBlock: currentBlockNumber,
      });

      const expected = expect.arrayContaining([
        expect.objectContaining({
          handle: handleTwo,
        }),
        expect.objectContaining({
          handle: handleThree,
        }),
      ]);

      const expectedTwo = expect.not.arrayContaining([
        expect.objectContaining({
          handle: handle,
        }),
      ]);

      expect(result).toEqual(expected);
      expect(result).toEqual(expectedTwo);
    });

    it("pulls all events from block 0 to specific end block", async () => {
      const identityContract = await new Identity__factory(signer).deploy(await signer.getAddress());
      await identityContract.deployed();
      const handle = "LlamaButtons";
      const handleTwo = "LlamaButtons2";
      const handleThree = "LlamaButtons3";

      const identityContractAddress = identityContract.address;
      await register(identityContractAddress, handle);

      await mineBlocks(10, provider);

      await changeHandle(handle, handleTwo);

      const currentBlockNumber = await provider.getBlockNumber();

      await mineBlocks(10, provider);
      await changeHandle(handleTwo, handleThree);

      const result = await getDSNPRegistryUpdateEvents({
        endBlock: currentBlockNumber,
      });

      const expected = expect.arrayContaining([
        expect.objectContaining({
          handle: handle,
        }),
        expect.objectContaining({
          handle: handleTwo,
        }),
      ]);

      const expectedTwo = expect.not.arrayContaining([
        expect.objectContaining({
          handle: handleThree,
        }),
      ]);

      expect(result).toEqual(expected);
      expect(result).toEqual(expectedTwo);
    });
  });

  describe("validateMessage", () => {
    let msg: Announcement;
    let signedAnnouncement: SignedAnnouncement;

    const permAllowed = Permission.ANNOUNCE;
    const permDenied = Permission.OWNERSHIP_TRANSFER;
    let contractAddr = "";
    let sig = "";
    let dsnpUserURI = "";
    let signerAddr = "";

    beforeAll(async () => {
      await snapshotHardhat(provider);
      signerAddr = await signer.getAddress();
      const identityContract = await new Identity__factory(signer).deploy(signerAddr);
      await identityContract.deployed();
      contractAddr = identityContract.address;
      const tx = await register(contractAddr, "Animaniacs");
      dsnpUserURI = await getURIFromRegisterTransaction(tx);
      msg = createBroadcast(
        convertDSNPUserURIToDSNPUserId(dsnpUserURI),
        "https://fakeurl.org",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
      );
      signedAnnouncement = await sign(msg);
      sig = signedAnnouncement.signature;
    });

    afterAll(async () => {
      await revertHardhat(provider);
    });

    it("returns true if the signer is authorized for the given permissions", async () => {
      await expect(isSignatureAuthorizedTo(sig, msg, dsnpUserURI, permAllowed)).resolves.toBeTruthy();
    });

    it("returns true if provided a signed announcement", async () => {
      await expect(isSignatureAuthorizedTo(sig, signedAnnouncement, dsnpUserURI, permAllowed)).resolves.toBeTruthy();
    });

    it("throws if provided an invalid object as an announcement", async () => {
      await expect(isSignatureAuthorizedTo(sig, 3 as unknown as string, dsnpUserURI, permAllowed)).rejects.toThrow(
        InvalidAnnouncementParameterError
      );
    });

    it("returns false if the signer is not authorized for the given permissions", async () => {
      const regSigner: RegistrationWithSigner = await newRegistrationForAccountIndex(2, "Handel");
      const res = await isSignatureAuthorizedTo(sig, msg, regSigner.dsnpUserURI, permDenied);
      expect(res).toBeFalsy();
    });

    it("returns false if signature is a real one but not for this message", async () => {
      const otherMsg = generateBroadcast();
      const signedMessage = await sign(otherMsg);
      const badSig = signedMessage.signature;
      const res = await isSignatureAuthorizedTo(badSig, msg, dsnpUserURI, permAllowed);
      expect(res).toBeFalsy();
    });

    describe("valid block tag =", () => {
      [
        { name: "latest", value: "latest", expected: true },
        { name: "earliest", value: "earliest", expected: true },
        { name: "pending", value: "pending", expected: true },
        { name: "negative number", value: -1, expected: true },
        { name: "positive number", value: 1, expected: true },
        { name: "0x0", value: 0x0, expected: true },
        { name: "0x1", value: 0x1, expected: true },
      ].forEach((tc) => {
        it(`${tc.name} returns ${tc.expected}`, async () => {
          const actual = await isSignatureAuthorizedTo(sig, msg, dsnpUserURI, permAllowed, 1);
          expect(actual).toEqual(tc.expected);
        });
      });
    });

    it("throws if id cannot be resolved", async () => {
      await expect(isSignatureAuthorizedTo("0xdeadbeef", msg, "0xabcd1234", permAllowed)).rejects.toThrow(DSNPError);
    });
    it("throws if signature is garbage", async () => {
      const badSig = generateHexString(65);
      await expect(isSignatureAuthorizedTo(badSig, msg, dsnpUserURI, permAllowed)).rejects.toThrow(
        /signature missing v and recoveryParam/
      );
    });
  });

  describe("#getRegistrationsByIdentityAddress", () => {
    describe("when identity is not associated to a registration", () => {
      let identityContract: EthereumAddress;

      setupSnapshot();

      beforeAll(async () => {
        const contractOwner = await signer.getAddress();
        const identityContract = await new Identity__factory(signer).deploy(contractOwner);
        await identityContract.deployed();
      });

      it("returns an empty array", async () => {
        const result = await getRegistrationsByIdentityAddress(identityContract);

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
        const result = await getRegistrationsByIdentityAddress(identityContractAddress);

        expect(result.length).toEqual(1);
        expect(result[0]).toEqual(
          expect.objectContaining({
            handle,
            contractAddr: identityContractAddress,
            dsnpUserURI: expect.any(String),
          })
        );
      });

      describe("and registration handle is updated", () => {
        beforeAll(async () => {
          await changeHandle(handle, newHandle);
        });

        it("returns one registration with updated handle", async () => {
          const handle = "JoeNoSe";
          const result = await getRegistrationsByIdentityAddress(identityContractAddress);

          expect(result.length).toEqual(1);
          expect(result[0]).toEqual(
            expect.objectContaining({
              handle,
              contractAddr: identityContractAddress,
              dsnpUserURI: expect.any(String),
            })
          );
        });

        describe("and a new identity address is set to registration", () => {
          let newIdentityContract: EthereumAddress;

          beforeAll(async () => {
            const contractOwner = await signer.getAddress();
            const identityContract = await new Identity__factory(signer).deploy(contractOwner);
            await identityContract.deployed();
            newIdentityContract = identityContract.address;
            await changeAddress(newHandle, newIdentityContract);
          });

          it("returns zero registration associated with old identity", async () => {
            const result = await getRegistrationsByIdentityAddress(identityContractAddress);

            expect(result.length).toEqual(0);
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
      let handleOne: Handle;
      let handleTwo: Handle;

      beforeAll(async () => {
        await snapshotHardhat(provider);
      });

      afterAll(async () => {
        await revertHardhat(provider);
      });

      beforeAll(async () => {
        handleOne = "YoSe";
        handleTwo = "YoNoSabo";
        const contractOwner = await signer.getAddress();
        const identityContract = await new Identity__factory(signer).deploy(contractOwner);
        await identityContract.deployed();

        identityContractAddress = identityContract.address;
        await register(identityContractAddress, handleOne);
        await register(identityContractAddress, handleTwo);
      });

      it("returns multiple registrations", async () => {
        const result = await getRegistrationsByIdentityAddress(identityContractAddress);

        expect(result).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              contractAddr: identityContractAddress,
              handle: handleOne,
            }),
            expect.objectContaining({
              contractAddr: identityContractAddress,
              handle: handleTwo,
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
          const result = await getRegistrationsByIdentityAddress(identityContractAddress);

          expect(result.length).toEqual(1);
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
            const result = await getRegistrationsByIdentityAddress(identityContractAddress);

            expect(result).toEqual([]);
          });
        });
      });
    });
  });

  describe("#getRegistrationsByWalletAddress", () => {
    describe("when wallet address has many identities", () => {
      describe("and identity has many registrations", () => {
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

        it("returns all registrations belonging to public key", async () => {
          const result = await getRegistrationsByWalletAddress(contractOwner);

          expect(result).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ contractAddr: contractAddressOne, handle: "earth" }),
              expect.objectContaining({ contractAddr: contractAddressOne, handle: "wind" }),
              expect.objectContaining({ contractAddr: contractAddressTwo, handle: "fire" }),
            ])
          );
        });
      });

      describe("and identities do not have any registrations associated to them", () => {
        let contractOwner: EthereumAddress;

        beforeAll(async () => {
          await snapshotHardhat(provider);
        });

        afterAll(async () => {
          await revertHardhat(provider);
        });

        beforeEach(async () => {
          const signer = getSignerForAccount(2);
          contractOwner = await signer.getAddress();
          const identityContractOne = await new Identity__factory(signer).deploy(contractOwner);
          const identityContractTwo = await new Identity__factory(signer).deploy(contractOwner);
          await identityContractOne.deployed();
          await identityContractTwo.deployed();
        });

        it("returns an empty list", async () => {
          const result = await getRegistrationsByWalletAddress(contractOwner);

          expect(result).toEqual([]);
        });
      });
    });

    describe("when wallet address does not have any registrations", () => {
      let contractOwner: EthereumAddress;

      beforeAll(async () => {
        await snapshotHardhat(provider);
      });

      afterAll(async () => {
        await revertHardhat(provider);
      });

      beforeEach(async () => {
        const signer = getSignerForAccount(2);
        contractOwner = await signer.getAddress();
        const identityContract = await new Identity__factory(signer).deploy(contractOwner);
        await identityContract.deployed();
        const contractAddress = identityContract.address;

        const handleOne = "earth";
        await register(contractAddress, handleOne);
      });

      it("returns an empty list", async () => {
        const fakeAddress = "0x1Ea32de10D5a18e55DEBAf379B26Cc0c6952B168";
        const result = await getRegistrationsByWalletAddress(fakeAddress);

        expect(result).toEqual([]);
      });
    });
  });
});
