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
import assert from "assert";

export const testClient = createTestClient({
  mode: "ganache",
  transport: http(process.env.RPC_URL),
  account: privateKeyToAccount(process.env.ALICE_PRIVATE_KEY as `0x${string}`),
  chain: localhost,
})
  .extend(walletActions)
  .extend(publicActions);

export async function sendTxs() {
  await sendERC20Txs();
}

async function sendERC20Txs() {
  const hash = await testClient.sendTransaction({
    to: process.env.USDC_ADDRESS as `0x${string}`,
    data: encodeFunctionData({
      abi: parseAbi(["function mint(address to, uint256 amount) public"]),
      functionName: "mint",
      args: [testClient.account.address, parseEther("10")],
    }),
  });
  await testClient.waitForTransactionReceipt({ hash });

  const balance = await testClient.readContract({
    address: process.env.USDC_ADDRESS as `0x${string}`,
    abi: parseAbi([
      "function balanceOf(address owner) public view returns (uint256)",
    ]),
    functionName: "balanceOf",
    args: [testClient.account.address],
  });

  assert.equal(balance.toString(), parseEther("10").toString());
}
