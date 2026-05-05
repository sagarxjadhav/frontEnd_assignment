import { Customer } from '../types';

interface Props {
  customers: Customer[];
}

function formatCurrency(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(
    amount
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(iso));
}

function TagList({ tags }: { tags: string[] }) {
  if (tags.length === 0) return <span className="no-tags">none</span>;
  return (
    <>
      {tags.map((tag) => (
        <span key={tag} className="tag-badge">
          {tag}
        </span>
      ))}
    </>
  );
}

export function CustomerTable({ customers }: Props) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Orders</th>
            <th>Amount Spent</th>
            <th>Last Order</th>
            <th>Tags</th>
            <th>Member Since</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td>
                <div className="customer-name">
                  {c.firstName} {c.lastName}
                </div>
                <div className="customer-email">{c.email}</div>
              </td>
              <td>{c.numberOfOrders}</td>
              <td>{formatCurrency(c.amountSpent.amount, c.amountSpent.currencyCode)}</td>
              <td>{formatDate(c.lastOrderDate)}</td>
              <td>
                <TagList tags={c.tags} />
              </td>
              <td>{formatDate(c.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
