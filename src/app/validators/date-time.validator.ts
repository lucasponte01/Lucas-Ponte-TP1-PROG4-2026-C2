// validators/date-time.validator.ts
import { ValidatorFn } from '@angular/forms';
import { parseDateTime } from '../utils/parse_date';

export const dateTimeValidator: ValidatorFn = (control) =>
  !control.value || parseDateTime(control.value) ? null : { invalidDate: true };