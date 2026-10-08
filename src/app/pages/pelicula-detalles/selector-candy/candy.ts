import { Component, computed, Inject, inject, signal } from '@angular/core';
import CandyProducto from '../../../interfaces/cady_productos';
import { CandyServise } from '../../../services/candy/candy';
import { ComboServise } from '../../../services/combo/combos';
import ComboProducto from '../../../interfaces/combos';
import { NavbarComponent } from '../../../components/ui/navbar/navbar';
import { CampoInput } from '../../../components/ui/campo-input/campo-input';
import { CarritoResumen } from '../../../components/ui/carrito-resumen/carrito-resumen';
import { ResaltarComboDirective } from '../../../directives/resaltar-combo';
import { CarritoService } from '../../../services/carrito/carrito';
import { PdfService } from '../../../services/pdf/pdfservise';
import { CompraService } from '../../../services/compra/compra';
import { SupabaseService } from '../../../services/supabase.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-candy',
  standalone: true,
  imports: [NavbarComponent, CampoInput , ResaltarComboDirective, CarritoResumen],
  styleUrl: './candy.css',
  templateUrl: './candy.html',
})
export class Candy {
  logo_menus = "/assets/imagenes/Gemini2.png";
  candy = inject(CandyServise);
  combo = inject(ComboServise);
  
  cargando = signal<boolean | null>(null);
  candy_muestra = signal<CandyProducto[]>([]);
  combo_muestra = signal<ComboProducto[]>([]);
  
  private compraService = inject(CompraService); 
  public carritoService = inject(CarritoService);
  private supabase = inject(SupabaseService);

  textoBusqueda = signal('');
  pdfService = inject(PdfService);

  async ngOnInit() {
    this.cargando.set(true);
    try {
      await this.traerTodos_productos();
      
    } finally {
      this.cargando.set(false);
    }
  }


  CandyFiltrados = computed(() => {
    const texto = this.textoBusqueda().trim().toLowerCase();
    const resultado: CandyProducto[] = [];

    for (const producto of this.candy_muestra()) {
      if (!texto) {
        resultado.push(producto);
        continue;
      }

      let coincide = producto.nombre.toLowerCase().includes(texto);
      if (!coincide && producto.categorias) {
        for (const categoria of producto.categorias) {
          if (categoria.toLowerCase().includes(texto)) {
            coincide = true;
            break;
          }
        }
      }

      if (coincide) {
        resultado.push(producto);
      }
    }
    return resultado;
  });


  onBuscar(texto: string): void {
    this.textoBusqueda.set(texto);
  }

  async traerTodos_productos() {
    this.candy_muestra.set(await this.candy.mostrar_productos());
    this.combo_muestra.set(await this.combo.obtenerCombos());
  }

  // Métodos del Carrito
    agregar(id: string, nombre: string, precio: number, tipo: 'candy' | 'combo') {
    this.carritoService.agregarItem({
      id: id,
      nombre: nombre,
      precio: precio,
      tipo: tipo,
      cantidad: 1
    });
  }

 async procesarPagoYGenerarQR() {
    try {
      const items = this.carritoService.items();
      const funcion = this.carritoService.funcionCompra();
      const butacas = this.carritoService.butacasCompra();
      if (!funcion) {
        throw new Error('No se encontró la función seleccionada.');
      }
      if (butacas.length === 0) {
        throw new Error('No hay butacas seleccionadas.');
      }

      const {data: { user },error: userError} = await this.supabase.Auth.getUser();

      if (userError) {
        throw userError;
      }

      const itemsCandy = items.filter(item => item.tipo === 'candy' || item.tipo === 'combo');
      const subtotalEntradas = butacas.reduce((total, butaca) => total + butaca.precio, 0);
      const subtotalCandy = itemsCandy.reduce((total, item) => total + item.precio * item.cantidad, 0);
      const total = this.carritoService.calcularTotal();

      const compra = await this.compraService.crearCompra({
        usuario_id: user?.id ?? null,
        pelicula_id: funcion.pelicula_id ?? null,
        funcion_id: funcion.id,
        sala_id: funcion.sala_id,
        subtotal_entradas: subtotalEntradas,
        subtotal_candy: subtotalCandy,
        total: total,
        total_pagado_dinero: total,
        total_pagado_puntos: 0,
        estado_pago: 'pendiente'
      });

      if (!compra.id) {
        throw new Error('No se pudo crear la compra.');
      }

      for (const butaca of butacas) {
        await this.compraService.agregarEntrada({
          compra_id: compra.id,
          funcion_id: funcion.id,
          butaca_id: butaca.id,
          precio: butaca.precio,
          estado: 'pendiente'
        });
      }

      for (const item of itemsCandy) {
        await this.compraService.agregarCandy({
          compra_id: compra.id,
          producto_id: item.id,
          nombre_producto: item.nombre,
          cantidad: item.cantidad,
          precio_unitario: item.precio,
          subtotal: item.precio * item.cantidad,
          estado: 'pendiente'
        });
      }

      await this.compraService.marcarComoPagada(compra.id);

      if (user) {
        await this.carritoService.registrarPuntosPorCompra(
          user.id,
          compra.id,
          total
        );
      }
      const formatearFecha = (fecha: string | number | Date) => {
        const d = fecha ? new Date(fecha) : new Date();
        return d.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      };
      
      const fechaFormateada = formatearFecha(funcion.inicio).trim();

      
      const butacasFormateadas = butacas.map(
        b => `Fila ${b.fila} - Asiento ${b.numero}`
      );
      const carritoParaPdf = itemsCandy.map(item => ({
        producto: item.nombre,
        cantidad: item.cantidad,
        subtotal: item.precio * item.cantidad
      }));

      const datosParaPdf = {
        idCompra: compra.id,
        pelicula: funcion.pelicula?.nombre ?? 'Película',
        fechaFuncion: fechaFormateada || 'Fecha a confirmar',
        butacas: butacasFormateadas,
        carrito:carritoParaPdf,
        total: total,
        nombreUsuario: user?.user_metadata?.['nombre'] ?? 'Cliente'
      };

      await this.pdfService.generarComprobanteEntrada(datosParaPdf);

      this.carritoService.limpiarCarrito();
      this.carritoService.butacasCompra.set([]);
      this.carritoService.funcionCompra.set(null);
      console.log('Compra finalizada:', compra.id);
    } catch (error) {
      console.error('Error al procesar la compra:', error);
    }
  }
}