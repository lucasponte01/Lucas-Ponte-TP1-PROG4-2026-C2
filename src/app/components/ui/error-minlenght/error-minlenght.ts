import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-error-minlenght',
  styleUrl: './error-minlenght.css',
  templateUrl: './error-minlenght.html',
})
export class ErrorMinlenght {
  errors = input<any>();
  mensaje = input<string | null>();
}
