import { createTestClient, http, publicActions } from "viem";
import moment from "moment";

export const testClient = createTestClient({
  mode: "ganache",
  transport: http(process.env.RPC_URL),
}).extend(publicActions);

(async () => {
  setInterval(async () => {
    const block = await testClient.getBlock();
    console.log(
      moment.unix(Number(block.timestamp)).format("YYYY-MM-DD HH:mm:ss")
    );

    await testClient.increaseTime({ seconds: 60 * 60 * 24 - 1 }); // 1 days
    await testClient.mine({ blocks: 1 });
  }, 1000); // 1 seconds
})();
