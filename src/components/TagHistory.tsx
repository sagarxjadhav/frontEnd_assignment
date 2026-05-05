import { useQuery } from '@apollo/client';
import { GET_TAG_HISTORY } from '../graphql/operations';
import { HistoryEntry } from '../types';

interface QueryResult {
  getTagHistory: HistoryEntry[];
}

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(iso)
  );
}

function formatCriteria(criteriaJson: string): string {
  try {
    const c = JSON.parse(criteriaJson) as Record<string, number>;
    const parts: string[] = [];
    if (c.minAmountSpent != null) parts.push(`spent > $${c.minAmountSpent}`);
    if (c.minNumberOfOrders != null) parts.push(`orders > ${c.minNumberOfOrders}`);
    if (c.lastOrderWithinDays != null) parts.push(`ordered in last ${c.lastOrderWithinDays}d`);
    return parts.length > 0 ? parts.join(' · ') : 'all customers';
  } catch {
    return 'unknown filter';
  }
}

export function TagHistory() {
  const { data } = useQuery<QueryResult>(GET_TAG_HISTORY, {
    fetchPolicy: 'cache-and-network',
  });

  const history = data?.getTagHistory ?? [];

  if (history.length === 0) return null;

  return (
    <div className="card">
      <h2 className="card-title">Tag Operation History</h2>
      <div className="history-list">
        {history.map((entry) => (
          <div key={entry.id} className="history-item">
            <span
              className={`history-badge ${entry.action === 'ADD' ? 'badge-add' : 'badge-remove'}`}
            >
              {entry.action}
            </span>
            <span>
              <strong>"{entry.tag}"</strong> — {entry.customerCount} customer
              {entry.customerCount !== 1 ? 's' : ''}
            </span>
            <span style={{ fontSize: 12, color: '#777' }}>
              filter: {formatCriteria(entry.criteria)}
            </span>
            <span className="history-meta">{formatDateTime(entry.timestamp)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
