import {
  createTestClient,
  encodeAbiParameters,
  encodeFunctionData,
  http,
  keccak256,
  parseAbi,
  parseEther,
  publicActions,
  toHex,
  walletActions,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { localhost } from "viem/chains";
import {
  getSmartWalletAddress,
  recurringExecutorAddress,
  sankakuFactoryAddress,
  usdcAddress,
} from "./addresses";
import { delay } from "./utils";

export const aliceClient = createTestClient({
  mode: "ganache",
  transport: http(process.env.RPC_URL),
  account: privateKeyToAccount(process.env.ALICE_PRIVATE_KEY as `0x${string}`),
  chain: localhost,
})
  .extend(walletActions)
  .extend(publicActions);

export const bobClient = createTestClient({
  mode: "ganache",
  transport: http(process.env.RPC_URL),
  account: privateKeyToAccount(process.env.BOB_PRIVATE_KEY as `0x${string}`),
  chain: localhost,
})
  .extend(walletActions)
  .extend(publicActions);

export const executorClient = createTestClient({
  mode: "ganache",
  transport: http(process.env.RPC_URL),
  account: privateKeyToAccount(
    process.env.EXECUTOR_PRIVATE_KEY as `0x${string}`
  ),
  chain: localhost,
})
  .extend(walletActions)
  .extend(publicActions);

export async function sendTxs() {
  await sendERC20Txs();
  await createAliceSmartWallet();
  await installRecurringExecutor(1n);
  await delay(10000);
  await uninstallRecurringExecutor();
}

async function sendERC20Txs() {
  let hash = await aliceClient.sendTransaction({
    to: usdcAddress,
    data: encodeFunctionData({
      abi: parseAbi(["function mint(address to, uint256 amount) public"]),
      functionName: "mint",
      args: [aliceClient.account.address, parseEther("10")],
    }),
  });
  await aliceClient.waitForTransactionReceipt({ hash });

  hash = await aliceClient.sendTransaction({
    to: usdcAddress,
    data: encodeFunctionData({
      abi: parseAbi(["function transfer(address to, uint256 amount) public"]),
      functionName: "transfer",
      args: [bobClient.account.address, parseEther("1")],
    }),
  });
  await aliceClient.waitForTransactionReceipt({ hash });

  const aliceSmartWalletAddress = await getSmartWalletAddress(
    aliceClient.account.address
  );
  hash = await aliceClient.sendTransaction({
    to: usdcAddress,
    data: encodeFunctionData({
      abi: parseAbi(["function transfer(address to, uint256 amount) public"]),
      functionName: "transfer",
      args: [aliceSmartWalletAddress, parseEther("1")],
    }),
  });
  await aliceClient.waitForTransactionReceipt({ hash });
}

async function createAliceSmartWallet() {
  const hash = await aliceClient.writeContract({
    abi: parseAbi([
      "function createAccount(address owner, bytes32 salt) external",
    ]),
    address: sankakuFactoryAddress,
    functionName: "createAccount",
    args: [aliceClient.account.address, keccak256(toHex("0"))],
  });
  await aliceClient.waitForTransactionReceipt({ hash });
}

async function installRecurringExecutor(planId: bigint) {
  const aliceSmartWalletAddress = await getSmartWalletAddress(
    aliceClient.account.address
  );

  const hash = await aliceClient.writeContract({
    abi: parseAbi([
      "function installExecutor(address executor, bytes calldata executorData) external",
    ]),
    address: aliceSmartWalletAddress,
    functionName: "installExecutor",
    args: [
      recurringExecutorAddress,
      encodeAbiParameters([{ name: "planId", type: "uint256" }], [planId]),
    ],
  });
  await aliceClient.waitForTransactionReceipt({ hash });
}

async function executeRecurringExecutor() {
  const aliceSmartWalletAddress = await getSmartWalletAddress(
    aliceClient.account.address
  );

  const hash = await aliceClient.writeContract({
    abi: parseAbi(["function execute(address smartAccount) external"]),
    address: recurringExecutorAddress,
    functionName: "execute",
    args: [aliceSmartWalletAddress],
  });
  await aliceClient.waitForTransactionReceipt({ hash });
}

async function uninstallRecurringExecutor() {
  const aliceSmartWalletAddress = await getSmartWalletAddress(
    aliceClient.account.address
  );

  const hash = await aliceClient.writeContract({
    abi: parseAbi(["function uninstallExecutor(address executor) external"]),
    address: aliceSmartWalletAddress,
    functionName: "uninstallExecutor",
    args: [recurringExecutorAddress],
  });
  await aliceClient.waitForTransactionReceipt({ hash });
}
