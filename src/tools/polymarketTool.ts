import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { ClobClient } from "@polymarket/clob-client";
import type { PriceHistoryFilterParams } from "@polymarket/clob-client";

// Konfigurasi CLOB client
const clobClient = new ClobClient(
  process.env.POLYMARKET_API_URL || "https://clob.polymarket.com",
  137, // Polygon chainId
  undefined, // wallet parameter harus undefined jika tidak digunakan
);

export const getPolymarketData = new DynamicStructuredTool({
  name: "get_polymarket_data",
  description: "Get market data and analysis from Polymarket for prediction comparison",
  schema: z.object({
    marketId: z.string().describe("The ID of the Polymarket market"),
    analysisType: z.enum(["price", "volume", "liquidity"]).describe("Type of analysis needed"),
  }),
  func: async ({ marketId, analysisType }) => {
    try {
      // Get market data
      const marketData = await clobClient.getMarket(marketId);

      // Setup price history params
      const priceHistoryParams: PriceHistoryFilterParams = {
        market: marketId
      };

      // Analyze based on type
      let analysis = {};
      switch (analysisType) {
        case "price":
          analysis = {
            currentPrice: marketData.price,
            priceHistory: await clobClient.getPricesHistory(priceHistoryParams),
            prediction: "AI prediction based on price patterns",
          };
          break;
        case "volume":
          analysis = {
            volume24h: marketData.volume,
            volumeData: marketData.volume,
            prediction: "AI prediction based on volume analysis",
          };
          break;
        case "liquidity":
          analysis = {
            liquidity: marketData.liquidity,
            liquidityData: marketData.liquidity,
            prediction: "AI prediction based on liquidity patterns",
          };
          break;
      }

      return JSON.stringify(analysis);
    } catch (error) {
      return `Error analyzing Polymarket data: ${error}`;
    }
  },
});
