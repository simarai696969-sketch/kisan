import { MandiRate } from "../types";

/**
 * Real-time Mandi Sync Engine
 * Simulates real-time AgMarknet national mandi trade floor price updates.
 * Updates rates with micro-fluctuations (supply-demand curves, arrival volume adjustments).
 */

export function tickMandiRates(currentRates: MandiRate[]): {
  updatedRates: MandiRate[];
  changedCount: number;
  lastUpdatedTimestamp: string;
} {
  const now = new Date();
  const timeString = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  // Guard against non-array or undefined inputs to prevent .map() crashes
  const safeRates = Array.isArray(currentRates) ? currentRates : [];
  if (safeRates.length === 0) {
    return {
      updatedRates: [],
      changedCount: 0,
      lastUpdatedTimestamp: timeString,
    };
  }

  // Pick 2-4 commodities to fluctuate slightly on each tick to mimic live floor auctions
  const numToFluctuate = Math.floor(Math.random() * 3) + 2;
  const indicesToUpdate = new Set<number>();
  while (indicesToUpdate.size < Math.min(numToFluctuate, safeRates.length)) {
    indicesToUpdate.add(Math.floor(Math.random() * safeRates.length));
  }

  const updatedRates = safeRates.map((rate, index) => {
    if (!rate || typeof rate !== "object") return rate;
    if (!indicesToUpdate.has(index)) {
      return { ...rate, isRealtimeTicking: false };
    }

    // Micro-fluctuation between -2.2% and +2.4%
    const deltaPercent = (Math.random() * 4.6 - 2.1) / 100;
    const priceChange = Math.round(rate.modalPrice * deltaPercent);
    const newPrice = Math.max(rate.minPrice, Math.min(rate.maxPrice, rate.currentPrice + priceChange));

    const oldPrice = rate.currentPrice;
    const diffFromPrevious = newPrice - rate.previousPrice;
    const newChangePercent = Number(((diffFromPrevious / rate.previousPrice) * 100).toFixed(2));
    
    let trend: "up" | "down" | "stable" = "stable";
    if (newChangePercent > 0.3) trend = "up";
    else if (newChangePercent < -0.3) trend = "down";

    // Random slight arrival volume change in Quintals (+/- 50 to 200 Qtl)
    const volumeShift = Math.floor(Math.random() * 300) - 130;
    const newVolume = Math.max(120, (rate.arrivalVolumeQuintals || 1500) + volumeShift);

    // Update 7-day history array's last element or maintain smooth curve
    const historyCopy = [...(rate.history || [])];
    if (historyCopy.length > 0) {
      historyCopy[historyCopy.length - 1] = {
        ...historyCopy[historyCopy.length - 1],
        price: newPrice,
      };
    }

    return {
      ...rate,
      currentPrice: newPrice,
      modalPrice: newPrice,
      trend,
      changePercentage: newChangePercent,
      arrivalVolumeQuintals: newVolume,
      lastUpdated: `लाइव सिंक: ${timeString}`,
      history: historyCopy,
      isRealtimeTicking: true,
    };
  });

  return {
    updatedRates,
    changedCount: indicesToUpdate.size,
    lastUpdatedTimestamp: timeString,
  };
}
