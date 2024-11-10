import { deploy } from "./deploy";
import { sendTxs } from "./send-txs";

async function main() {
  await deploy();
  await sendTxs();
}

main();
