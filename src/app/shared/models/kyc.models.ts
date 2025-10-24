
export type KycStatus = 'Draft' | 'PendingReview' | 'Approved' | 'Rejected' | 'ResubmissionRequired';
export interface KycSubmission {
  id: string;
  status: KycStatus;
  required: string[];
  uploaded: string[];
  issues?: string[];
}
