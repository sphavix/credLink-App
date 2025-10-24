import { TestBed } from '@angular/core/testing';
import { KycStatus } from './kyc-status';
import { KycService } from '../../shared/services/kyc.service';

describe('KycStatus (Angular 20)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KycStatus],
      providers: [KycService]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(KycStatus);
    const comp = fixture.componentInstance;
    expect(comp).toBeTruthy();
  });
});
