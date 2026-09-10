import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-error-requerido',
  styleUrl: './error-requerido.css',
  templateUrl: './error-requerido.html',
})
export class ErrorRequerido {
  errors = input<any>();
  mensaje = input<string | null>();
}
