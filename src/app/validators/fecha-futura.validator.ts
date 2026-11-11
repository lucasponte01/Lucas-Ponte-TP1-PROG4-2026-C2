
import { ValidatorFn } from '@angular/forms';
import { parseDate, parseDateTime } from '../utils/parse_date';

export const fechaFuturaValidator: ValidatorFn = (control) => {
  if (!control.value) return null;

  const fecha = parseDate(control.value);
  if (!fecha) return null;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); // comparar solo por día, no por hora exacta

  if (fecha < hoy) return { fechaPasada: true };
  return null;
};

export const fechaHoraFuturaValidator: ValidatorFn = (control) => {
  if (!control.value) return null;

  const fecha = parseDateTime(control.value);
  if (!fecha) return null;

  if (fecha < new Date()) return { fechaPasada: true };
  return null;
};