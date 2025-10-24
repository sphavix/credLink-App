import { TestBed } from '@angular/core/testing';
import { Auth } from './auth';

describe('Auth (Angular 20)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Auth]
    }).compileComponents();
  });

  it('should sign in/up', () => {
    const fixture = TestBed.createComponent(Auth);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
