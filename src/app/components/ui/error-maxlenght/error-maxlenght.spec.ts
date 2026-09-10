import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorMaxlenght } from './error-maxlenght';

describe('ErrorMaxlenght', () => {
  let component: ErrorMaxlenght;
  let fixture: ComponentFixture<ErrorMaxlenght>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorMaxlenght],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorMaxlenght);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
