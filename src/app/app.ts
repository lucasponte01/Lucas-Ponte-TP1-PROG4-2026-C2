import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
//la primera url no paso la de domains
//siempre queda el ultimo deploy que funciono
//cuando yo ago push a mi rama de deployea automaticamente si rompe 
//git reset --hard HEAD~1 borra el ultimo commit
@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('progra_4_tp_cine');
}
