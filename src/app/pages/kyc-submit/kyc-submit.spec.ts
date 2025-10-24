import { TestBed } from '@angular/core/testing';
import { KycSubmit } from './kyc-submit';
import { KycService } from '../../shared/services/kyc.service';

describe('KycSubmit (Angular 20)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KycSubmit],
      providers: [KycService]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(KycSubmit);
    const comp = fixture.componentInstance;
    expect(comp).toBeTruthy();
  });

  it('cannot submit until all required docs uploaded and agree checked', () => {
    const fixture = TestBed.createComponent(KycSubmit);
    const comp = fixture.componentInstance;
    fixture.detectChanges();
    expect(comp.canSubmit()).toBeFalse();
  });
});
