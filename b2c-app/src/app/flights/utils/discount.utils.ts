import _ from "lodash";
import { SearchResultsItinerary } from "@app/flights/models/results/search-results-itinerary.model";
import { DiscountResponseModel } from "@app/flights/models/price/fare-breakdown.model";

export interface DiscountsDisplayModel {
  currencyCode: string;
  decimalPlaces: number;
  originalAmount: number;
  availableDiscounts: DiscountDisplayModel[];
}

export interface DiscountDisplayModel {
  name: string;
  amount: number;
  percentage: number;
}

/**
 * Converts a single itinerary's discount data into display model
 */
export function getItineraryDiscounts(itin: SearchResultsItinerary): DiscountsDisplayModel | undefined {
  const { amount, currencyCode, decimalPlaces, fareBreakdown } = itin;
  if (!amount || !fareBreakdown) return undefined;

  const feeDiscounts = fareBreakdown.sfeeDiscountBreakdown ?? [];
  const discountAmount = fareBreakdown.discountAmount ?? 0;

  const discounts: DiscountDisplayModel[] = [];

  for (const d of feeDiscounts) {
    if (d) {
      discounts.push({
        name: d.name,
        amount: d.amount,
        percentage: d.percentage * 100 
      });
    }
  }

  // if (discountAmount !== 0) {
  //   discounts.push({
  //     name: "Applied Discount",
  //     amount: discountAmount,
  //     percentage: (discountAmount / amount) * 100 // ✅ Keep this if you want "applied discount" as extra
  //   });
  // }

  // ✅ Sort discounts by descending percentage
  discounts.sort((a, b) => b.percentage - a.percentage);

  return {
    currencyCode,
    decimalPlaces,
    originalAmount: amount,
    availableDiscounts: discounts
  };
}

/**
 * If aggregating multiple itineraries (e.g. onward + return), this returns a combined view.
 * NOTE: This version just merges raw amounts, no percentage calculation beyond converting decimals.
 */
export function aggregateDiscounts(itineraries: SearchResultsItinerary[]): DiscountsDisplayModel | undefined {
  if (itineraries.length === 0) return undefined;

  const totalAmount = _.sum(itineraries.map((itin) => itin?.amount || 0));
  const availableDiscounts: { [name: string]: DiscountDisplayModel } = {};

  for (const itin of itineraries) {
    if (!itin) continue;

    const itinDiscounts = getItineraryDiscounts(itin);
    if (!itinDiscounts) continue;

    for (const discount of itinDiscounts.availableDiscounts) {
      const name = discount.name;
      availableDiscounts[name] ??= {
        name,
        amount: 0,
        percentage: 0
      };

      availableDiscounts[name].amount += discount.amount;
      availableDiscounts[name].percentage = discount.percentage;
    }
  }

  return {
    currencyCode: itineraries[0].currencyCode,
    decimalPlaces: itineraries[0].decimalPlaces,
    originalAmount: totalAmount,
    availableDiscounts: Object.values(availableDiscounts),
  };
}
