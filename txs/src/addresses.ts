import { createTestClient, getContractAddress, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export const deployerClient = createTestClient({
  mode: "ganache",
  transport: http(process.env.RPC_URL),
  account: privateKeyToAccount(
    process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`
  ),
});

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

export {
  usdcAddress,
  sankakuImplementationAddress,
  sankakuFactoryAddress,
  recurringExecutorAddress,
};
