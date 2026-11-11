import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorEmail } from './error-email';

describe('ErrorEmail', () => {
  let component: ErrorEmail;
  let fixture: ComponentFixture<ErrorEmail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorEmail],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorEmail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
