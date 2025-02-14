import { ClobClient } from "@polymarket/clob-client";
import { ethers, Wallet } from "ethers";
import type { JsonRpcSigner } from "@ethersproject/providers";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function setupPolymarketApi() {
  try {
    // Get and format private key
    const privateKey = process.env.AGENT_PRIVATE_KEY || "";
    // Remove '0x' prefix if exists and ensure it's a valid hex string
    const formattedKey = privateKey.startsWith("0x") ? privateKey.slice(2) : privateKey;
    // Setup ethers provider and signer for Polymarket
    const provider = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com");
    const signer = new Wallet(
      `0x${formattedKey}`, // Ensure '0x' prefix
      provider,
    );

    // Setup CLOB client dengan ethers signer
    const clobClient = new ClobClient(
      process.env.POLYMARKET_API_URL || "https://clob.polymarket.com",
      137, // chainId Polygon
      signer as any, // Force type untuk menghindari type error
    );

    // Buat API key
    const creds = await clobClient.createApiKey();

    console.log("Polymarket API Credentials:");
    console.log("API Key:", creds.key);
    console.log("Secret:", creds.secret);
    console.log("Passphrase:", creds.passphrase);

    return creds;
  } catch (error) {
    console.error("Error setting up Polymarket API:", error);
    throw error;
  }
}

// Run setup
setupPolymarketApi()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

export { setupPolymarketApi };
