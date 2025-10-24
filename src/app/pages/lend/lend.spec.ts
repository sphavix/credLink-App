import { TestBed } from '@angular/core/testing';
import { Lend } from './lend';

describe('Lend (Angular 20)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Lend]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Lend);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
