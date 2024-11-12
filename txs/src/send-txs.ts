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
import { delay, increase, nextCharge, today } from "./utils";
import moment from "moment";

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
  await runWeeklyTxs();
  await runMonthlyTxs();
  await runSixMonthsTxs();
}

async function sendERC20Txs() {
  console.log(`Mint USDC to Alice`);
  let hash = await aliceClient.sendTransaction({
    to: usdcAddress,
    data: encodeFunctionData({
      abi: parseAbi(["function mint(address to, uint256 amount) public"]),
      functionName: "mint",
      args: [aliceClient.account.address, parseEther("10")],
    }),
  });
  await aliceClient.waitForTransactionReceipt({ hash });

  console.log(`Transfer USDC to Bob`);
  hash = await aliceClient.sendTransaction({
    to: usdcAddress,
    data: encodeFunctionData({
      abi: parseAbi(["function transfer(address to, uint256 amount) public"]),
      functionName: "transfer",
      args: [bobClient.account.address, parseEther("1")],
    }),
  });
  await aliceClient.waitForTransactionReceipt({ hash });

  console.log(`Transfer USDC to Smart Account`);
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
  console.log(`Create Alice Smart Wallet`);
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
  console.log(`Install Recurring Executor`);
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
  console.log(
    `Next charge at ${(await nextCharge(planId)).format("YYYY-MM-DD")}`
  );
}

async function executeRecurringExecutor(planId: bigint) {
  let attempts = 0;

  while (attempts < 5) {
    const now = await today();
    const next = await nextCharge(planId);
    await increase(next.diff(now, "seconds"));
    console.log(`Charging ${(await today()).format("YYYY-MM-DD")}`);
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
    attempts++;
    console.log(
      `Next charge at ${(await nextCharge(planId)).format("YYYY-MM-DD")}`
    );
  }
}

async function uninstallRecurringExecutor() {
  console.log(`Uninstall Recurring Executor`);
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

async function runWeeklyTxs() {
  console.log(`Run Weekly Txs`);
  await installRecurringExecutor(1n);
  await delay(30000);
  await executeRecurringExecutor(1n);
  await uninstallRecurringExecutor();
  console.log("Done");
}

async function runMonthlyTxs() {
  console.log(`Run Monthly Txs`);
  await installRecurringExecutor(2n);
  await delay(30000);
  await executeRecurringExecutor(2n);
  await uninstallRecurringExecutor();
  console.log("Done");
}

async function runSixMonthsTxs() {
  console.log(`Run Six Months Txs`);
  await installRecurringExecutor(3n);
  await delay(30000);
  await executeRecurringExecutor(3n);
  await uninstallRecurringExecutor();
  console.log("Done");
}
