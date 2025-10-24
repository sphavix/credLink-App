
export interface LoanOffer {
  id: string;
  lenderId: string;
  name: string;
  amount: number;
  rate: number;
  negotiable: boolean;
  minDurationMonths: number;
  maxDurationMonths: number;
  minCreditScore?: number;
  minMonthlyIncome?: number;
  createdAt: string;
  status: 'Open' | 'Withdrawn';
}
export interface LoanRequest {
  id: string;
  offerId: string;
  borrowerId: string;
  requestedRate?: number;
  status: 'Pending' | 'Approved' | 'Declined';
}
