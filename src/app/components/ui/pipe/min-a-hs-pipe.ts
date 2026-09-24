import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'minutosToHoras',
})
export class MinAHsPipe implements PipeTransform {
  transform(minutos: number): string {
    if (!minutos) return '0h 0m';
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}m`;
  }
}
