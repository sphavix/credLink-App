import { TestBed } from '@angular/core/testing';
import { Settings } from './settings';

describe('Settings (Angular 20)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Settings]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Settings);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
