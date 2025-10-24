import { TestBed } from '@angular/core/testing';
import { Borrow } from './borrow';

describe('Borrow (Angular 20)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Borrow]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Borrow);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
