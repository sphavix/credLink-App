import { TestBed } from '@angular/core/testing';
import { OnboardingPersonal } from './onboarding-personal';

describe('Onboarding personal (Angular 20)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingPersonal]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(OnboardingPersonal);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
