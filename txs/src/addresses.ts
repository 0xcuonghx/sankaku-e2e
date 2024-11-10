import {
  createTestClient,
  getContractAddress,
  http,
  keccak256,
  parseAbi,
  publicActions,
  toHex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

export const deployerClient = createTestClient({
  mode: "ganache",
  transport: http(process.env.RPC_URL),
  account: privateKeyToAccount(
    process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`
  ),
}).extend(publicActions);

const usdcAddress = getContractAddress({
  from: deployerClient.account.address,
  nonce: 0n,
});

const sankakuImplementationAddress = getContractAddress({
  from: deployerClient.account.address,
  nonce: 1n,
});

const sankakuFactoryAddress = getContractAddress({
  from: deployerClient.account.address,
  nonce: 2n,
});

const recurringExecutorAddress = getContractAddress({
  from: deployerClient.account.address,
  nonce: 3n,
});

console.log({
  usdcAddress,
  sankakuImplementationAddress,
  sankakuFactoryAddress,
  recurringExecutorAddress,
});

async function getSmartWalletAddress(account: `0x${string}`) {
  return deployerClient.readContract({
    abi: parseAbi([
      "function computeAccountAddress(address owner, bytes32 salt) external view returns (address expectedAddress)",
    ]),
    address: sankakuFactoryAddress,
    functionName: "computeAccountAddress",
    args: [account, keccak256(toHex("0"))],
  });
}

export {
  usdcAddress,
  sankakuImplementationAddress,
  sankakuFactoryAddress,
  recurringExecutorAddress,
  getSmartWalletAddress,
};
