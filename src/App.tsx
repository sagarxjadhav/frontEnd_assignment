import { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { FilterForm } from './components/FilterForm';
import { CustomerTable } from './components/CustomerTable';
import { TagPanel } from './components/TagPanel';
import { TagHistory } from './components/TagHistory';
import { FILTER_CUSTOMERS } from './graphql/operations';
import { Customer, FilterCriteria } from './types';

const DEFAULT_CRITERIA: FilterCriteria = {
  minAmountSpent: null,
  minNumberOfOrders: null,
  lastOrderWithinDays: null,
};

function buildVariables(criteria: FilterCriteria) {
  const input: Record<string, number> = {};
  if (criteria.minAmountSpent !== null) input.minAmountSpent = criteria.minAmountSpent;
  if (criteria.minNumberOfOrders !== null) input.minNumberOfOrders = criteria.minNumberOfOrders;
  if (criteria.lastOrderWithinDays !== null) input.lastOrderWithinDays = criteria.lastOrderWithinDays;
  return { criteria: input };
}

function App() {
  const [hasSearched, setHasSearched] = useState(false);
  const [activeCriteria, setActiveCriteria] = useState<FilterCriteria>(DEFAULT_CRITERIA);
  const [historySignal, setHistorySignal] = useState(0);

  const [runFilter, { loading, error, data }] = useLazyQuery<{ filterCustomers: Customer[] }>(
    FILTER_CUSTOMERS,
    { fetchPolicy: 'network-only' }
  );

  function handleFilter(criteria: FilterCriteria) {
    setHasSearched(true);
    setActiveCriteria(criteria);
    runFilter({ variables: buildVariables(criteria) });
  }

  function handleTagsApplied() {
    // Refetch customers so tag badges update in the table
    runFilter({ variables: buildVariables(activeCriteria) });
    // Bump signal so TagHistory re-queries
    setHistorySignal((n) => n + 1);
  }

  const customers = data?.filterCustomers ?? [];

  return (
    <div className="app">
      <header className="app-header">
        <h1>Customer Tagging Tool</h1>
        <p>Filter customers by spend, orders, or recency — then apply bulk tags</p>
      </header>

      <main className="app-body">
        <FilterForm onFilter={handleFilter} isLoading={loading} />

        {loading && (
          <div className="card">
            <div className="state-box">
              <div className="spinner" />
              <p>Loading customers…</p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="card">
            <div className="state-box error">
              <p>Failed to load customers: {error.message}</p>
              <p style={{ marginTop: 8, fontSize: 12 }}>
                Make sure the API server is running at{' '}
                {import.meta.env.VITE_GRAPHQL_URL ?? 'http://localhost:4000/graphql'}
              </p>
            </div>
          </div>
        )}

        {!loading && !error && hasSearched && customers.length === 0 && (
          <div className="card">
            <div className="state-box">
              <p>No customers match the current filters.</p>
              <p style={{ marginTop: 8, fontSize: 12, color: '#aaa' }}>
                Try relaxing the criteria above.
              </p>
            </div>
          </div>
        )}

        {!loading && !error && customers.length > 0 && (
          <>
            <div className="card">
              <p className="result-count">
                {customers.length} customer{customers.length !== 1 ? 's' : ''} matched
              </p>
              <CustomerTable customers={customers} />
            </div>

            <TagPanel
              filterCriteria={activeCriteria}
              customerCount={customers.length}
              onTagsApplied={handleTagsApplied}
            />
          </>
        )}

        <TagHistory refetchSignal={historySignal} />
      </main>
    </div>
  );
}

export default App;
