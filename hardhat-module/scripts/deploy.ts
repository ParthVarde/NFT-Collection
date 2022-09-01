import { ethers } from "hardhat";
require("dotenv").config({ path: ".env" });
const { WHITELIST_CONTRACT_ADDRESS, METADATA_URL } = require("../constants");

async function main() {
  const whitelistContractAdd = WHITELIST_CONTRACT_ADDRESS;
  const metadataURL = METADATA_URL;

  const cryptoDevContract = await ethers.getContractFactory("CryptoDevs");
  const cryptoDev = await cryptoDevContract.deploy(
    metadataURL,
    whitelistContractAdd
  );

  console.log("Contract deployed at : ", cryptoDev.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
