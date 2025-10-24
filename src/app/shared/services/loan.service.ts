
import { Injectable, signal } from '@angular/core';
import { LoanOffer, LoanRequest } from '../models/loan.models';
import { AuthService } from './auth.service';
import { WalletService } from './wallet.service';

const OFFERS_KEY = 'credlink-loan-offers';
const REQUESTS_KEY = 'credlink-loan-requests';

@Injectable({ providedIn: 'root' })
export class LoanService {
  offers = signal<LoanOffer[]>([]);
  requests = signal<LoanRequest[]>([]);
  constructor(private auth: AuthService, private wallet: WalletService) {
    const o = localStorage.getItem(OFFERS_KEY);
    const r = localStorage.getItem(REQUESTS_KEY);
    if (o) {
      const parsed = (JSON.parse(o) as LoanOffer[]).map((offer: any) => ({
        id: offer.id,
        lenderId: offer.lenderId,
        name: offer.name ?? 'Loan Offer',
        amount: Number(offer.amount) || 0,
        rate: Number(offer.rate) || 0,
        negotiable: !!offer.negotiable,
        minDurationMonths: Number(offer.minDurationMonths) || 1,
        maxDurationMonths: Number(offer.maxDurationMonths) || Number(offer.minDurationMonths) || 1,
        minCreditScore: offer.minCreditScore ?? undefined,
        minMonthlyIncome: offer.minMonthlyIncome ?? undefined,
        createdAt: offer.createdAt ?? new Date().toISOString(),
        status: offer.status ?? 'Open'
      }));
      this.offers.set(parsed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      const committed = parsed
        .filter(offer => offer.status === 'Open')
        .reduce((sum, offer) => sum + offer.amount, 0);
      if (committed > 0 && this.wallet.committed() < committed) {
        this.wallet.syncCommitted(committed);
      }
    }
    if (r) this.requests.set(JSON.parse(r));
  }
  private save() {
    localStorage.setItem(OFFERS_KEY, JSON.stringify(this.offers()));
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(this.requests()));
  }
  createOffer(partial: Omit<LoanOffer, 'id' | 'lenderId' | 'createdAt' | 'status'>) {
    if (!this.wallet.hold(partial.amount)) {
      return false;
    }
    const offer: LoanOffer = {
      id: crypto.randomUUID(),
      lenderId: this.auth.userId() || 'anon',
      createdAt: new Date().toISOString(),
      status: 'Open',
      ...partial,
    };
    this.offers.set([offer, ...this.offers()]);
    this.save();
    return true;
  }
  removeOffer(id: string) {
    const offer = this.offers().find(o => o.id === id);
    if (!offer) return false;
    if (this.requests().some((r) => r.offerId === id && r.status !== 'Declined')) return false;
    this.wallet.release(offer.amount);
    this.offers.set(this.offers().filter((o) => o.id !== id));
    this.save();
    return true;
  }
  updateOffer(id: string, partial: Partial<LoanOffer>) {
    const offers = [...this.offers()];
    const idx = offers.findIndex(o => o.id === id);
    if (idx === -1) return false;
    const offer = offers[idx];
    const hasRequests = this.requests().some(r => r.offerId === id && r.status === 'Pending');
    if (hasRequests) return false;

    if (partial.amount !== undefined && partial.amount !== offer.amount) {
      const delta = partial.amount - offer.amount;
      if (delta > 0) {
        if (!this.wallet.hold(delta)) return false;
      } else {
        this.wallet.release(Math.abs(delta));
      }
    }

    offers[idx] = { ...offer, ...partial };
    this.offers.set(offers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    this.save();
    return true;
  }
  listEligibleOffers() {
    return this.offers().map((o) => ({ ...o, probability: Math.max(0.2, 1 - o.rate / 100) }));
  }
  canRequest(borrowerId: string) {
    return !this.requests().some((r) => r.borrowerId === borrowerId && r.status === 'Pending');
  }
  request(offerId: string, requestedRate?: number) {
    const borrowerId = this.auth.userId() || 'anon';
    if (!this.canRequest(borrowerId)) return false;

    const req: LoanRequest = {
      id: crypto.randomUUID(),
      offerId,
      borrowerId,
      requestedRate,
      status: 'Pending',
    };
    // add new request
    this.requests.set([req, ...this.requests()]);

    // enforce max 3 pending per offer
    const pending = this.requests().filter((r) => r.offerId === offerId && r.status === 'Pending');
    if (pending.length > 3) {
      const newest = pending[0];
      this.requests.update((arr) =>
        arr.map((x) => (x.id === newest.id ? { ...x, status: 'Declined' } : x))
      );
    }

    this.save();
    return true;
  }
  decide(offerId: string, requestId: string, approve: boolean) {
    this.requests.update((arr) =>
      arr.map((r) => {
        if (r.id === requestId) {
          return { ...r, status: approve ? 'Approved' : 'Declined' };
        }
        if (approve && r.offerId === offerId && r.status === 'Pending') {
          // auto-decline other pending requests on the same offer
          return { ...r, status: 'Declined' };
        }
        return r;
      })
    );
    this.save();
  }
  offerRequests(offerId: string) {
    return this.requests().filter((r) => r.offerId === offerId);
  }
  myOffers(lenderId: string) {
    return this.offers()
      .filter((o) => o.lenderId === lenderId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  myRequests(borrowerId: string) {
    return this.requests().filter((r) => r.borrowerId === borrowerId);
  }
}
