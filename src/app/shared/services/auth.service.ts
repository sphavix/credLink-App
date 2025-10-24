import { Injectable, signal } from '@angular/core';

const SESSION_KEY = 'credlink-session';
const USERS_KEY = 'credlink-users';

export interface Credentials { username: string; password: string; }

interface StoredUser {
  password: string;
  approved: boolean;
  userId: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _authed = signal<boolean>(false);
  private _approved = signal<boolean>(false);
  private _userId = signal<string | null>(null);
  private _username = signal<string | null>(null);
  private _users = signal<Record<string, StoredUser>>({});

  constructor(){
    localStorage.removeItem('cl_auth_user');
    sessionStorage.removeItem('cl_auth_user');
    this.restoreSession();
    this.restoreUsers();
  }

  private restoreSession(){
    const saved = localStorage.getItem(SESSION_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      this._authed.set(!!parsed.authed);
      this._approved.set(!!parsed.approved);
      this._userId.set(parsed.userId ?? null);
      this._username.set(parsed.username ?? null);
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
  }

  private restoreUsers(){
    const saved = localStorage.getItem(USERS_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      const coerced = this.coerceUsers(parsed);
      this._users.set(coerced);
      this.persistUsers();
    } catch {
      localStorage.removeItem(USERS_KEY);
    }
  }

  private coerceUsers(raw: any): Record<string, StoredUser> {
    const result: Record<string, StoredUser> = {};
    if (!raw || typeof raw !== 'object') return result;
    Object.entries(raw as Record<string, any>).forEach(([key, value]) => {
      if (value && typeof value === 'object') {
        const password = typeof value.password === 'string' ? value.password : '';
        if (!password) return;
        result[key] = {
          password,
          approved: !!value.approved,
          userId: typeof value.userId === 'string' ? value.userId : crypto.randomUUID()
        };
      } else if (typeof value === 'string') {
        result[key] = { password: value, approved: false, userId: crypto.randomUUID() };
      }
    });
    return result;
  }

  private persistSession(){
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        authed: this._authed(),
        approved: this._approved(),
        userId: this._userId(),
        username: this._username()
      })
    );
  }

  private persistUsers(){
    localStorage.setItem(USERS_KEY, JSON.stringify(this._users()));
  }

  private normalizeUsername(username: string){
    return username.trim().toLowerCase();
  }

  isAuthenticated(){ return this._authed(); }
  isApproved(){ return this._approved(); }
  username(){ return this._username(); }
  userId(){ return this._userId(); }

  signIn(creds: Credentials){
    const username = creds.username?.trim();
    const password = creds.password?.trim();
    if (!username || !password) return false;

    const record = this._users()[this.normalizeUsername(username)];
    if (!record || record.password !== password) return false;

    this._authed.set(true);
    this._approved.set(record.approved);
    this._userId.set(record.userId);
    this._username.set(username);
    this.persistSession();
    return true;
  }

  signUp(creds: Credentials){
    const username = creds.username?.trim();
    const password = creds.password?.trim();
    if (!username || !password) return false;

    const key = this.normalizeUsername(username);
    const users = { ...this._users() };
    if (users[key]) return false;

    const record: StoredUser = { password, approved: false, userId: crypto.randomUUID() };
    users[key] = record;
    this._users.set(users);
    this.persistUsers();

    this._authed.set(true);
    this._approved.set(record.approved);
    this._userId.set(record.userId);
    this._username.set(username);
    this.persistSession();
    return true;
  }

  registerLocally(data: any){
    const username = data?.username ?? data?.email;
    const password = data?.password;
    return username && password ? this.signUp({ username, password }) : false;
  }

  setApproved(value: boolean){
    this._approved.set(value);
    const username = this._username();
    if (username) {
      const key = this.normalizeUsername(username);
      const users = { ...this._users() };
      const existing = users[key];
      if (existing) {
        users[key] = { ...existing, approved: value };
        this._users.set(users);
        this.persistUsers();
      }
    }
    this.persistSession();
  }

  signOut(){
    this._authed.set(false);
    this._approved.set(false);
    this._userId.set(null);
    this._username.set(null);
    this.persistSession();
  }
}
