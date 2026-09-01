import hre from "hardhat";

async function main() {
  console.log("Deploying CTMSLedger contract...");
  const Ledger = await hre.ethers.getContractFactory("CTMSLedger");
  const ledger = await Ledger.deploy();

  await ledger.waitForDeployment();
  const address = await ledger.getAddress();

  console.log(`CTMSLedger deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
