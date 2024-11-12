const baseUrl = process.env.INDEXER_BASE_URL;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  await delay(120000);
  await checkSmartAccounts();
  await checkTokenBalances();
  await checkSubscriptions();
  await checkActivityLogs();
}

main();

async function checkSmartAccounts() {
  const response = await fetch(`${baseUrl}/smart-accounts`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Fail to fetch");
  }
  console.log(await response.json());
}

async function checkTokenBalances() {
  const response = await fetch(`${baseUrl}/token-balances`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Fail to fetch");
  }
  console.log(await response.json());
}

async function checkSubscriptions() {
  const response = await fetch(`${baseUrl}/subscriptions`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Fail to fetch");
  }

  console.log(await response.json());
}

async function checkActivityLogs() {
  const response = await fetch(`${baseUrl}/activity-logs`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Fail to fetch");
  }

  console.log(await response.json());
}
