import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { APPLY_CUSTOMER_TAG } from '../graphql/operations';
import { FilterCriteria, TagAction, TagOperationResult } from '../types';
import { ConfirmDialog } from './ConfirmDialog';

interface Props {
  filterCriteria: FilterCriteria;
  customerCount: number;
  onTagsApplied: () => void;
}

function buildCriteriaInput(criteria: FilterCriteria): Record<string, number> {
  const input: Record<string, number> = {};
  if (criteria.minAmountSpent !== null) input.minAmountSpent = criteria.minAmountSpent;
  if (criteria.minNumberOfOrders !== null) input.minNumberOfOrders = criteria.minNumberOfOrders;
  if (criteria.lastOrderWithinDays !== null) input.lastOrderWithinDays = criteria.lastOrderWithinDays;
  return input;
}

export function TagPanel({ filterCriteria, customerCount, onTagsApplied }: Props) {
  const [tag, setTag] = useState('');
  const [tagError, setTagError] = useState('');
  const [action, setAction] = useState<TagAction>('ADD');
  const [preview, setPreview] = useState<TagOperationResult | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [runMutation, { loading, error }] = useMutation<{ applyCustomerTag: TagOperationResult }>(
    APPLY_CUSTOMER_TAG
  );

  function validate(): boolean {
    if (tag.trim() === '') {
      setTagError('Tag cannot be empty');
      return false;
    }
    setTagError('');
    return true;
  }

  async function handlePreview() {
    if (!validate()) return;
    setPreview(null);
    setSuccessMessage(null);
    const { data } = await runMutation({
      variables: {
        input: { criteria: buildCriteriaInput(filterCriteria), tag: tag.trim(), action, dryRun: true },
      },
    });
    if (data) setPreview(data.applyCustomerTag);
  }

  async function executeApply() {
    setShowConfirm(false);
    const { data } = await runMutation({
      variables: {
        input: { criteria: buildCriteriaInput(filterCriteria), tag: tag.trim(), action, dryRun: false },
      },
    });
    if (data) {
      const r = data.applyCustomerTag;
      const verb = action === 'ADD' ? 'added to' : 'removed from';
      setSuccessMessage(`Tag "${r.tag}" ${verb} ${r.count} customer${r.count !== 1 ? 's' : ''}.`);
      setPreview(null);
      setTag('');
      onTagsApplied();
    }
  }

  function handleApply() {
    if (action === 'REMOVE') {
      setShowConfirm(true);
    } else {
      executeApply();
    }
  }

  function handleActionChange(next: TagAction) {
    setAction(next);
    setPreview(null);
    setSuccessMessage(null);
  }

  const isRemove = action === 'REMOVE';

  return (
    <div className="card">
      <h2 className="card-title">Apply Tag to Filtered Customers</h2>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
        Applies to the <strong>{customerCount}</strong> customer
        {customerCount !== 1 ? 's' : ''} matching your current filter.
      </p>

      <div className="tag-form">
        <div className="form-field">
          <label htmlFor="tagInput">Tag</label>
          <input
            id="tagInput"
            type="text"
            placeholder="e.g. vip"
            value={tag}
            onChange={(e) => {
              setTag(e.target.value);
              if (tagError) setTagError('');
              setPreview(null);
              setSuccessMessage(null);
            }}
          />
          {tagError && <span className="field-error">{tagError}</span>}
        </div>

        <div className="form-field">
          <label>Action</label>
          <div className="action-selector">
            <button
              type="button"
              className={`action-btn ${action === 'ADD' ? 'selected-add' : ''}`}
              onClick={() => handleActionChange('ADD')}
            >
              + Add
            </button>
            <button
              type="button"
              className={`action-btn ${action === 'REMOVE' ? 'selected-remove' : ''}`}
              onClick={() => handleActionChange('REMOVE')}
            >
              − Remove
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button type="button" className="btn-secondary" onClick={handlePreview} disabled={loading}>
            {loading && !showConfirm ? 'Loading…' : 'Preview'}
          </button>
        </div>
      </div>

      {error && <div className="error-message">Error: {error.message}</div>}
      {successMessage && <div className="success-banner">{successMessage}</div>}

      {preview && (
        <div className={`preview-box ${isRemove ? 'danger' : ''}`}>
          <div className="preview-title">
            {isRemove ? 'Preview — Tag Removal' : 'Preview — Tag Addition'}
          </div>
          <div className={`preview-count ${isRemove ? 'danger' : ''}`}>{preview.count}</div>
          <div className="preview-subtitle">
            {action === 'ADD'
              ? `customer${preview.count !== 1 ? 's' : ''} will receive tag "${preview.tag}"`
              : `customer${preview.count !== 1 ? 's' : ''} will lose tag "${preview.tag}"`}
            {preview.count === 0 && ' — no changes needed'}
          </div>
          {preview.count > 0 && (
            <button
              className={isRemove ? 'btn-danger' : 'btn-primary'}
              onClick={handleApply}
              disabled={loading}
            >
              {isRemove
                ? `Remove Tag from ${preview.count} Customer${preview.count !== 1 ? 's' : ''}`
                : `Add Tag to ${preview.count} Customer${preview.count !== 1 ? 's' : ''}`}
            </button>
          )}
        </div>
      )}

      {showConfirm && preview && (
        <ConfirmDialog
          title="Confirm Tag Removal"
          message={
            <>
              You are about to remove tag <strong>"{preview.tag}"</strong> from{' '}
              <strong>
                {preview.count} customer{preview.count !== 1 ? 's' : ''}
              </strong>
              . This action cannot be undone automatically.
            </>
          }
          confirmLabel={`Remove from ${preview.count} customer${preview.count !== 1 ? 's' : ''}`}
          onConfirm={executeApply}
          onCancel={() => setShowConfirm(false)}
          isLoading={loading}
          isDanger
        />
      )}
    </div>
  );
}
