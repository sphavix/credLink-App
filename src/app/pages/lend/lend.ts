
import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LoanService } from '../../shared/services/loan.service';
import { AuthService } from '../../shared/services/auth.service';
import { WalletService } from '../../shared/services/wallet.service';
import { CurrencyPipe, DatePipe, NgIf } from '@angular/common';
import { LoanOffer } from '../../shared/models/loan.models';

@Component({
  standalone: true,
  selector: 'app-lend',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    NgIf,
    CurrencyPipe,
    DatePipe
  ],
  templateUrl: './lend.html',
  styleUrl: './lend.scss'
})
export class Lend implements OnInit {
  form!: FormGroup;
  readonly pageSize = 10;

  private readonly wallet = inject(WalletService);
  private readonly fb = inject(FormBuilder);
  readonly loans = inject(LoanService);
  readonly auth = inject(AuthService);

  readonly submitError = signal<string | null>(null);
  readonly editingOffer = signal<LoanOffer | null>(null);
  readonly currentPage = signal(0);

  readonly walletAvailable = computed(() => this.wallet.available());
  readonly remainingBalance = computed(() => {
    const amount = Number(this.form?.get('amount')?.value ?? 0);
    const available = this.walletAvailable();
    if (this.editingOffer()) {
      const original = this.editingOffer()!.amount;
      const delta = (isNaN(amount) ? 0 : amount) - original;
      return +(available - delta).toFixed(2);
    }
    return +(available - (isNaN(amount) ? 0 : amount)).toFixed(2);
  });

  readonly offers = computed(() =>
    this.loans.myOffers(this.auth.userId() || 'anon')
  );
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.offers().length / this.pageSize)));
  readonly pagedOffers = computed(() => {
    const start = this.currentPage() * this.pageSize;
    return this.offers().slice(start, start + this.pageSize);
  });

  constructor() {
    effect(() => {
      const _available = this.walletAvailable();
      this.form?.get('amount')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(4)]],
      amount: [1000, [Validators.required, Validators.min(100), this.maxAvailableValidator.bind(this)]],
      rate: [18, [Validators.required, Validators.min(1), Validators.max(30)]],
      minDurationMonths: [6, [Validators.required, Validators.min(1)]],
      maxDurationMonths: [12, [Validators.required, Validators.min(1)]],
      minCreditScore: [620, [Validators.min(0)]],
      minMonthlyIncome: [15000, [Validators.min(0)]]
    });
  }

  private maxAvailableValidator(control: AbstractControl): ValidationErrors | null {
    const available = this.walletAvailable() + (this.editingOffer()?.amount ?? 0);
    const value = Number(control.value);
    if (isNaN(value)) return { invalidAmount: true };
    if (value > available) {
      return { exceedsWallet: { available } };
    }
    return null;
  }

  resetForm() {
    this.form.reset({
      name: '',
      amount: Math.min(1000, this.walletAvailable()),
      rate: 18,
      minDurationMonths: 6,
      maxDurationMonths: 12,
      minCreditScore: 620,
      minMonthlyIncome: 15000
    });
    this.editingOffer.set(null);
    this.submitError.set(null);
  }

  editOffer(offer: LoanOffer) {
    this.editingOffer.set(offer);
    this.form.reset({
      name: offer.name,
      amount: offer.amount,
      rate: offer.rate,
      minDurationMonths: offer.minDurationMonths,
      maxDurationMonths: offer.maxDurationMonths,
      minCreditScore: offer.minCreditScore ?? 620,
      minMonthlyIncome: offer.minMonthlyIncome ?? 15000
    });
    this.submitError.set(null);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = this.form.value;
    const request = {
      name: payload.name,
      amount: Number(payload.amount),
      rate: Number(payload.rate),
      minDurationMonths: Number(payload.minDurationMonths),
      maxDurationMonths: Number(payload.maxDurationMonths),
      minCreditScore: payload.minCreditScore ? Number(payload.minCreditScore) : undefined,
      minMonthlyIncome: payload.minMonthlyIncome ? Number(payload.minMonthlyIncome) : undefined,
      negotiable: false
    };

    if (request.maxDurationMonths < request.minDurationMonths) {
      this.submitError.set('Max duration must be greater than or equal to min duration.');
      return;
    }

    const editing = this.editingOffer();
    let ok = false;
    if (editing) {
      ok = this.loans.updateOffer(editing.id, request as any);
      if (!ok) {
        this.submitError.set('Unable to update offer. Ensure there are no active borrower requests and sufficient wallet funds.');
        return;
      }
    } else {
      ok = this.loans.createOffer(request as any);
      if (!ok) {
        this.submitError.set('Insufficient wallet balance to create this loan offer.');
        return;
      }
    }

    this.resetForm();
    this.currentPage.set(0);
  }

  withdraw(id: string) {
    const success = this.loans.removeOffer(id);
    if (!success) {
      this.submitError.set('Unable to withdraw this loan. Ensure it has no pending borrower requests.');
    }
  }

  requestsFor(offerId: string) {
    return this.loans.offerRequests(offerId);
  }

  canModify(offerId: string) {
    return this.requestsFor(offerId).every(r => r.status !== 'Pending');
  }

  prevPage() {
    if (this.currentPage() > 0) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  decide(offerId: string, reqId: string, approve: boolean) {
    this.loans.decide(offerId, reqId, approve);
  }
}
