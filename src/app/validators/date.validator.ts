// validators/date.validator.ts
import { ValidatorFn } from '@angular/forms';
import { parseDate } from '../utils/parse_date';

export const dateValidator: ValidatorFn = (control) =>
  !control.value || parseDate(control.value) ? null : { invalidDate: true };