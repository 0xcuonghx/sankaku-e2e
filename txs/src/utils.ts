import { createTestClient, http, publicActions } from "viem";
import moment from "moment";
export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const testClient = createTestClient({
  mode: "ganache",
  transport: http(process.env.RPC_URL),
}).extend(publicActions);

export const increase = async (seconds: number) => {
  await testClient.increaseTime({ seconds });
  await testClient.mine({ blocks: 1 });
};

export const today = async () => {
  const block = await testClient.getBlock();
  return moment.unix(Number(block.timestamp)).format("YYYY-MM-DD");
};

export const nextCharge = async () => {
  const block = await testClient.getBlock();
  return moment
    .unix(Number(block.timestamp))
    .add(7, "days")
    .format("YYYY-MM-DD");
};
