import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'edad',
})
export class EdadPipe implements PipeTransform {
  transform(value: string | Date): number | null {
    if (!value) return null;

    const fechaNacimiento = new Date(value);
    const hoy = new Date();
    
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - fechaNacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
      edad--;
    }

    return edad;
  }
}
