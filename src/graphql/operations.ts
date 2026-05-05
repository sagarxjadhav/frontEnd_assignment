import { gql } from '@apollo/client';

export const FILTER_CUSTOMERS = gql`
  query FilterCustomers($criteria: FilterInput!) {
    filterCustomers(criteria: $criteria) {
      id
      firstName
      lastName
      email
      numberOfOrders
      amountSpent {
        amount
        currencyCode
      }
      lastOrderDate
      tags
      createdAt
    }
  }
`;

export const APPLY_CUSTOMER_TAG = gql`
  mutation ApplyCustomerTag($input: TagOperationInput!) {
    applyCustomerTag(input: $input) {
      affectedCustomers {
        id
        firstName
        lastName
        email
        tags
      }
      count
      dryRun
      tag
      action
    }
  }
`;

export const GET_TAG_HISTORY = gql`
  query GetTagHistory {
    getTagHistory {
      id
      timestamp
      criteria
      tag
      action
      customerCount
    }
  }
`;
