import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-error-maxlenght',
  styleUrl: './error-maxlenght.css',
  templateUrl: './error-maxlenght.html',
})
export class ErrorMaxlenght {
  errors = input<any>();
  mensaje = input<string | null>();
}
