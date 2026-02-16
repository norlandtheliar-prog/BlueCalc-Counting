
export type CostType = 'BORONGAN' | 'SATUAN';

export interface CostItem {
  id: string;
  name: string;
  type: CostType;
  value: number;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
}

export interface CalculationResult {
  totalBasicPerPerson: number; // HPP per PAX
  totalBasicTotal: number; // Total Modal
  totalUnitCostPerPerson: number; // Sum of SATUAN items
  totalPaxPerPerson: number; // Harga Jual per PAX
  totalPaxTotal: number; // Total Harga Jual
  discountFixed: number;
  discountFreeSeatsValue: number;
  totalDiscount: number;
  profitPerPax: number; // Profit per unit before discount
  profitGross: number; // (Selling - HPP) * PAX
  profitTotal: number; // Final Net Profit after discounts
  personalProfit: number; // The 50% split (or custom)
}

export interface SavedTrip {
  id: string;
  timestamp: string;
  destination: string;
  participants: number;
  paxPrice: number;
  items: CostItem[];
  discountFixed: number;
  freeSeatsCount: number;
  personalProfitShare: number;
  results: CalculationResult;
}
