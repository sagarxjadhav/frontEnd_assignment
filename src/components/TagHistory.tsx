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

export function TagHistory({ refetchSignal }: { refetchSignal: number }) {
  const { loading, error, data } = useQuery<QueryResult>(GET_TAG_HISTORY, {
    fetchPolicy: 'cache-and-network',
    // Re-runs whenever refetchSignal changes (incremented after each apply)
    variables: { _signal: refetchSignal },
  });

  const history = data?.getTagHistory ?? [];

  if (loading && history.length === 0) return null;
  if (error) return null;
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
            <span className="history-meta">{formatDateTime(entry.timestamp)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
