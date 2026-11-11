import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorRequerido } from './error-requerido';

describe('ErrorRequerido', () => {
  let component: ErrorRequerido;
  let fixture: ComponentFixture<ErrorRequerido>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorRequerido],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorRequerido);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
