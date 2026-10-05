export function parseDate(value: string): Date | null {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const dia = Number(match[1]);
  const mes = Number(match[2]);
  const anio = Number(match[3]);
  const fecha = new Date(anio, mes - 1, dia);

  if (fecha.getFullYear() !== anio || fecha.getMonth() !== mes - 1 || fecha.getDate() !== dia) {
    return null;
  }
  return fecha;
}

export function parseDateTime(value: string): Date | null {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/);
  if (!match) return null;

  const dia = Number(match[1]);
  const mes = Number(match[2]);
  const anio = Number(match[3]);
  const hora = Number(match[4]);
  const minuto = Number(match[5]);
  if (hora > 23 || minuto > 59) return null;

  const fecha = new Date(anio, mes - 1, dia, hora, minuto);
  if (
    fecha.getFullYear() !== anio || fecha.getMonth() !== mes - 1 || fecha.getDate() !== dia ||
    fecha.getHours() !== hora || fecha.getMinutes() !== minuto
  ) {
    return null;
  }
  return fecha;
}

export function toDDMMYYYY(fecha: Date): string {
  let dia = fecha.getDate().toString();
  if (fecha.getDate() < 10) dia = '0' + dia;
  let mes = (fecha.getMonth() + 1).toString();
  if (fecha.getMonth() + 1 < 10) mes = '0' + mes;
  return dia + '/' + mes + '/' + fecha.getFullYear().toString();
}

export function toDDMMYYYYHHmm(fecha: Date): string {
  let hora = fecha.getHours().toString();
  if (fecha.getHours() < 10) hora = '0' + hora;
  let minuto = fecha.getMinutes().toString();
  if (fecha.getMinutes() < 10) minuto = '0' + minuto;
  return toDDMMYYYY(fecha) + ' ' + hora + ':' + minuto;
}

export function toISODateOnly(fecha: Date): string {
  let mes = (fecha.getMonth() + 1).toString();
  if (fecha.getMonth() + 1 < 10) mes = '0' + mes;
  let dia = fecha.getDate().toString();
  if (fecha.getDate() < 10) dia = '0' + dia;
  return fecha.getFullYear().toString() + '-' + mes + '-' + dia;
}

export function parseISODateOnly(value: string): Date | null {
  const partes = value.split('-');
  if (partes.length !== 3) return null;
  const anio = Number(partes[0]);
  const mes = Number(partes[1]);
  const dia = Number(partes[2]);
  return new Date(anio, mes - 1, dia);
}