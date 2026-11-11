
import { ValidatorFn } from '@angular/forms';
import { parseDate } from '../utils/parse_date';

export const fechaNacimientoValidator: ValidatorFn = (control) => {
  if (!control.value) return null;

  const fecha = parseDate(control.value);
  if (!fecha) return { invalidDate: true };

  const hoy = new Date();
  if (fecha > hoy) return { fechaFutura: true };

  let edad = hoy.getFullYear() - fecha.getFullYear();
  const noCumplioAnioTodavia =
    hoy.getMonth() < fecha.getMonth() ||
    (hoy.getMonth() === fecha.getMonth() && hoy.getDate() < fecha.getDate());
  if (noCumplioAnioTodavia) edad = edad - 1;

  if (edad < 15) return { menorDeEdad: true };
  if (edad > 120) return { edadInvalida: true };

  return null;
};