import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

type BorrowerSectionId = 'preApproved' | 'shortTerm' | 'longTerm';

interface BorrowerLoan {
  badge?: string;
  provider: string;
  amount: string;
  duration: string;
  approvalChance: 'Excellent' | 'Moderate' | 'Lower';
  description: string;
  primaryAction: string;
  secondaryAction: string;
}

interface BorrowerSection {
  id: BorrowerSectionId;
  title: string;
  subtitle: string;
  items: BorrowerLoan[];
}

@Component({
  standalone: true,
  selector: 'app-borrow',
  imports: [CommonModule],
  templateUrl: './borrow.html',
  styleUrls: ['./borrow.scss']
})
export class Borrow {
  private readonly sectionsData: BorrowerSection[] = [
    {
      id: 'preApproved',
      title: 'Your pre-approved loans',
      subtitle: 'Hand-picked offers ready for quick approval.',
      items: [
        {
          badge: 'Pre-approved',
          provider: 'finchoice',
          amount: 'Borrow up to R1 000',
          duration: '6 to 12 months',
          approvalChance: 'Excellent',
          description: 'Get funded in as little as 24 hours with flexible repayment options.',
          primaryAction: 'Borrow now',
          secondaryAction: 'More details'
        },
        {
          badge: 'Pre-approved',
          provider: 'unifi',
          amount: 'Borrow up to R4 000',
          duration: '9 to 3 months',
          approvalChance: 'Excellent',
          description: 'Competitive interest rates with no early settlement penalties.',
          primaryAction: 'Borrow now',
          secondaryAction: 'More details'
        }
      ]
    },
    {
      id: 'shortTerm',
      title: 'Short term personal loans',
      subtitle: 'Curated based on your credit behaviour and borrowing history.',
      items: [
        {
          provider: 'Sanlam',
          amount: 'Borrow up to R10 000',
          duration: 'Term 12 to 24 months',
          approvalChance: 'Excellent',
          description: 'Complete the application online with a quick decision.',
          primaryAction: 'Borrow now',
          secondaryAction: 'Details'
        },
        {
          provider: 'Wonga',
          amount: 'Borrow up to R4 000',
          duration: 'Term 12 to 45 months',
          approvalChance: 'Moderate',
          description: 'Personalised support from start to finish to ensure a smooth experience.',
          primaryAction: 'Borrow now',
          secondaryAction: 'Details'
        }
      ]
    },
    {
      id: 'longTerm',
      title: 'Long term personal loans',
      subtitle: 'Larger amounts with longer repayment cycles tailored for stability.',
      items: [
        {
          provider: 'ABSA',
          amount: 'Higher limits available',
          duration: '60 month term',
          approvalChance: 'Lower',
          description: 'Structured repayment plans with optional payment holidays.',
          primaryAction: 'Borrow now',
          secondaryAction: 'Manage'
        }
      ]
    }
  ];

  readonly sections = signal<BorrowerSection[]>(this.sectionsData);
  readonly hasLoans = computed(() => this.sections().some(section => section.items.length > 0));
}
