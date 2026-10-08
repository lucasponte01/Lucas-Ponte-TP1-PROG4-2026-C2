import {Component,Input,Output,EventEmitter,inject,OnInit } from '@angular/core';

import { ItemCarrito } from '../../../interfaces/carrito';
import { CarritoService } from '../../../services/carrito/carrito';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-carrito-resumen',
  standalone: true,
  imports: [FormsModule],
  styleUrl: './carrito-resumen.css',
  templateUrl: './carrito-resumen.html',
})
export class CarritoResumen implements OnInit { // <--- 2. Implementa la interfaz OnInit

  public carritoService = inject(CarritoService);

  @Input() items: ItemCarrito[] = [];

  @Output() eliminarItem = new EventEmitter<string>();

  @Output() confirmarCompra = new EventEmitter<void>();

  codigoCupon = '';
  mensajeCupon = '';
  errorCupon = '';

  async ngOnInit() {
    await this.verificarCuponPrimeraCompraAutomatico();
  }

  calcularSubtotal(): number {
    return this.carritoService.calcularSubtotal();
  }

  calcularDescuento(): number {
    return this.carritoService.descuento();
  }

  calcularTotal(): number {
    return this.carritoService.calcularTotal();
  }

  async aplicarCupon(): Promise<void> {
    this.mensajeCupon = '';
    this.errorCupon = '';
    try {
      await this.carritoService.aplicarCupon(
        this.codigoCupon
      );
      this.mensajeCupon =
        'Cupón aplicado correctamente';
    } catch (error: any) {
      this.errorCupon =
        error.message || 'Error al aplicar el cupón';
    }
  }

  quitarCupon(): void {
    this.carritoService.quitarCupon();
    this.codigoCupon = '';
    this.mensajeCupon = '';
    this.errorCupon = '';
  }

  quitar(id: string) {
    this.eliminarItem.emit(id);
  }

  finalizar() {
    this.confirmarCompra.emit();
  }

  async verificarCuponPrimeraCompraAutomatico() {
    // Si ya hay un cupón aplicado manualmente, no pisarlo
    if (this.carritoService.cuponAplicado()) return;

    // Llamas a tu servicio para verificar si aplica la primera compra
    const cuponAutomatico = await this.carritoService.verificarYAplicarCuponPrimeraCompra();
    
    if (cuponAutomatico) {
      // Lo aplicas directamente en el servicio de carrito de forma silenciosa
      this.carritoService.aplicarCupon(cuponAutomatico.codigo);
    }
  }
}