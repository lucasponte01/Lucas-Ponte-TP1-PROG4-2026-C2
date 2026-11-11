import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorMinlenght } from './error-minlenght';

describe('ErrorMinlenght', () => {
  let component: ErrorMinlenght;
  let fixture: ComponentFixture<ErrorMinlenght>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorMinlenght],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorMinlenght);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
