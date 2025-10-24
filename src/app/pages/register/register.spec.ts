import { TestBed } from '@angular/core/testing';
import { Register } from './register';
import { By } from '@angular/platform-browser';

describe('Register (Angular 20)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Register]
    }).compileComponents();
  });

  it('should create and have invalid form initially', () => {
    const fixture = TestBed.createComponent(Register);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.form.invalid).toBe(true);
  });

  it('should validate matching passwords', () => {
    const fixture = TestBed.createComponent(Register);
    const comp = fixture.componentInstance;
    comp.form.patchValue({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      phone: '+27123456789',
      dateOfBirth: '1990-01-01',
      nationalIdOrPassport: 'A1234567',
      address: { street:'1 Code St', city:'Joburg', province:'GP', postalCode:'2000', country:'South Africa' },
      password: 'Password123',
      confirmPassword: 'Password123'
    });
    expect(comp.form.invalid).toBe(false);
  });
});
