import { TestBed } from '@angular/core/testing';
import { KycUpload } from './kyc-upload';
import { KycService } from '../../shared/services/kyc.service';

describe('KycUpload (Angular 20)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KycUpload],
      providers: [KycService]
    }).compileComponents();
  });

  it('should create and initialize draft', () => {
    const fixture = TestBed.createComponent(KycUpload);
    const comp = fixture.componentInstance;
    fixture.detectChanges();
    expect(comp).toBeTruthy();
    // At least one required doc should exist after init
    expect(comp.docs.length).toBeGreaterThan(0);
  });
});
