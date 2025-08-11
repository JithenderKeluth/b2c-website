import { ProductDisplayDetails } from './product-display-details.model';
import { CategoryDisplayDetails } from './category-display-details.model';

export interface PriceResultProduct {
  amount: number;
  categoryDisplayDetail?: CategoryDisplayDetails;
  childProducts?: PriceResultProduct[];
  currencyCode: string;
  description: string;
  displayDetail: ProductDisplayDetails;
  id: string;
  initSelected?: boolean;
  isNestedProduct?: boolean;
  isNestedChild?: boolean;
  name: string;
  pageList: string[];
  perAdultAmount?: number;
  perChildAmount?: number;
  perInfantAmount?: number;
  preDiscountAmount?: number;
  preDiscountCurrencyCode?: string;
  selectionType: string;
  showCommentBox: boolean;
  warningText?: string;
}
