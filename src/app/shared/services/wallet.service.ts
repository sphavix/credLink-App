import { Injectable, signal } from '@angular/core';

export interface WalletState {
  available: number;
  committed: number;
  pending: number;
  unsettled: number;
}

const STORAGE_KEY = 'credlink-wallet';

@Injectable({ providedIn: 'root' })
export class WalletService {
  private readonly initialState: WalletState = {
    available: 25000,
    committed: 0,
    pending: 0,
    unsettled: 0
  };

  private readonly state = signal<WalletState>(this.load());

  private load(): WalletState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return this.initialState;
      const parsed = JSON.parse(raw);
      if (
        typeof parsed?.available === 'number' &&
        typeof parsed?.committed === 'number' &&
        typeof parsed?.pending === 'number' &&
        typeof parsed?.unsettled === 'number'
      ) {
        return parsed;
      }
      return this.initialState;
    } catch {
      return this.initialState;
    }
  }

  private persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state()));
  }

  snapshot() {
    return this.state();
  }

  available() {
    return this.state().available;
  }

  committed() {
    return this.state().committed;
  }

  hold(amount: number): boolean {
    if (amount <= 0) return false;
    if (this.state().available < amount) return false;
    this.state.update((current) => ({
      ...current,
      available: +(current.available - amount).toFixed(2),
      committed: +(current.committed + amount).toFixed(2)
    }));
    this.persist();
    return true;
  }

  release(amount: number) {
    if (amount <= 0) return;
    this.state.update((current) => ({
      ...current,
      available: +(current.available + amount).toFixed(2),
      committed: Math.max(0, +(current.committed - amount).toFixed(2))
    }));
    this.persist();
  }

  withdraw(amount: number): boolean {
    if (amount <= 0) return false;
    if (this.state().available < amount) return false;
    this.state.update((current) => ({
      ...current,
      available: +(current.available - amount).toFixed(2)
    }));
    this.persist();
    return true;
  }

  deposit(amount: number) {
    if (amount <= 0) return;
    this.state.update((current) => ({
      ...current,
      available: +(current.available + amount).toFixed(2)
    }));
    this.persist();
  }

  syncCommitted(amount: number) {
    if (amount < 0) return;
    this.state.update((current) => {
      const committed = +amount.toFixed(2);
      const total = current.available + current.committed;
      const available = Math.max(0, +(total - committed).toFixed(2));
      return { ...current, committed, available };
    });
    this.persist();
  }

  summary() {
    const snapshot = this.state();
    return {
      accountLabel: 'CredLink Wallet (ZAR)',
      available: snapshot.available,
      pending: snapshot.pending,
      locked: snapshot.committed,
      unsettled: snapshot.unsettled
    };
  }
}
