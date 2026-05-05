export interface AmountSpent {
  amount: number;
  currencyCode: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  numberOfOrders: number;
  amountSpent: AmountSpent;
  lastOrderDate: string | null;
  tags: string[];
  createdAt: string;
}

export interface FilterCriteria {
  minAmountSpent: number | null;
  minNumberOfOrders: number | null;
  lastOrderWithinDays: number | null;
}

export type TagAction = 'ADD' | 'REMOVE';

export interface TagOperationResult {
  affectedCustomers: Pick<Customer, 'id' | 'firstName' | 'lastName' | 'email' | 'tags'>[];
  count: number;
  dryRun: boolean;
  tag: string;
  action: TagAction;
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  criteria: string;
  tag: string;
  action: TagAction;
  customerCount: number;
}
