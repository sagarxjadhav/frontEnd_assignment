import { useState } from 'react';
import { FilterCriteria } from '../types';

interface Props {
  onFilter: (criteria: FilterCriteria) => void;
  isLoading: boolean;
}

interface FieldState {
  minAmountSpent: string;
  minNumberOfOrders: string;
  lastOrderWithinDays: string;
}

const EMPTY_FIELDS: FieldState = {
  minAmountSpent: '',
  minNumberOfOrders: '',
  lastOrderWithinDays: '',
};

function toNullableNumber(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const n = Number(trimmed);
  return isNaN(n) ? null : n;
}

export function FilterForm({ onFilter, isLoading }: Props) {
  const [fields, setFields] = useState<FieldState>(EMPTY_FIELDS);

  function set(key: keyof FieldState) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setFields((prev) => ({ ...prev, [key]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onFilter({
      minAmountSpent: toNullableNumber(fields.minAmountSpent),
      minNumberOfOrders: toNullableNumber(fields.minNumberOfOrders),
      lastOrderWithinDays: toNullableNumber(fields.lastOrderWithinDays),
    });
  }

  function handleClear() {
    setFields(EMPTY_FIELDS);
    onFilter({ minAmountSpent: null, minNumberOfOrders: null, lastOrderWithinDays: null });
  }

  return (
    <div className="card">
      <h2 className="card-title">Filter Customers</h2>
      <form className="filter-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="minAmountSpent">Min Amount Spent ($)</label>
          <input
            id="minAmountSpent"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 100"
            value={fields.minAmountSpent}
            onChange={set('minAmountSpent')}
          />
          <span className="field-hint">Customers who spent more than this</span>
        </div>

        <div className="form-field">
          <label htmlFor="minNumberOfOrders">Min Number of Orders</label>
          <input
            id="minNumberOfOrders"
            type="number"
            min="0"
            step="1"
            placeholder="e.g. 5"
            value={fields.minNumberOfOrders}
            onChange={set('minNumberOfOrders')}
          />
          <span className="field-hint">Customers with more than this many orders</span>
        </div>

        <div className="form-field">
          <label htmlFor="lastOrderWithinDays">Last Order Within (days)</label>
          <input
            id="lastOrderWithinDays"
            type="number"
            min="1"
            step="1"
            placeholder="e.g. 30"
            value={fields.lastOrderWithinDays}
            onChange={set('lastOrderWithinDays')}
          />
          <span className="field-hint">Ordered at least once in last N days</span>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Searching…' : 'Find Customers'}
          </button>
          <button type="button" className="btn-ghost" onClick={handleClear} disabled={isLoading}>
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}
