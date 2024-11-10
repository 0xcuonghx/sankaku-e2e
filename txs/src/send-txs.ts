import {
  createTestClient,
  encodeFunctionData,
  http,
  parseAbi,
  parseEther,
  publicActions,
  walletActions,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { localhost } from "viem/chains";

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

export async function sendTxs() {
  await sendERC20Txs();
}

async function sendERC20Txs() {
  let hash = await aliceClient.sendTransaction({
    to: process.env.USDC_ADDRESS as `0x${string}`,
    data: encodeFunctionData({
      abi: parseAbi(["function mint(address to, uint256 amount) public"]),
      functionName: "mint",
      args: [aliceClient.account.address, parseEther("10")],
    }),
  });
  await aliceClient.waitForTransactionReceipt({ hash });

  hash = await aliceClient.sendTransaction({
    to: process.env.USDC_ADDRESS as `0x${string}`,
    data: encodeFunctionData({
      abi: parseAbi(["function transfer(address to, uint256 amount) public"]),
      functionName: "transfer",
      args: [bobClient.account.address, parseEther("1")],
    }),
  });
  await aliceClient.waitForTransactionReceipt({ hash });
}
