import { Directive, ElementRef, HostListener, Renderer2, Input } from '@angular/core';

@Directive({
  selector: '[appResaltarCombo]',
  standalone: true // Si usas componentes standalone
})
export class ResaltarComboDirective {
  
  @Input() appResaltarCombo: boolean = false; // Recibe si es destacado

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    // Si es un combo destacado, le ponemos un borde dorado inicial
    if (this.appResaltarCombo) {
      this.renderer.setStyle(this.el.nativeElement, 'border', '2px solid #d97706');
      this.renderer.setStyle(this.el.nativeElement, 'box-shadow', '0 0 15px rgba(217, 119, 6, 0.3)');
    }
  }

  @HostListener('mouseenter') onMouseEnter() {
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'translateY(-5px)');
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'transform 0.3s ease');
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'translateY(0px)');
  }
}