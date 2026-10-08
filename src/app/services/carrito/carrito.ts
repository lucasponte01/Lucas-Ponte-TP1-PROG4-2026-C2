import { inject, Injectable, signal } from '@angular/core';
import { ItemCarrito } from '../../interfaces/carrito';
import { CuponService } from '../cupon/cupon';
import { Cupon } from '../../interfaces/cupon';
import { SupabaseService } from '../supabase.service';


@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private cuponService = inject(CuponService);
  public items = signal<ItemCarrito[]>([]);
  public cuponAplicado = signal<Cupon | null>(null);
  public descuento = signal<number>(0);
 private supabase = inject(SupabaseService)

public funcionCompra = signal<any | null>(null);
public butacasCompra = signal<any[]>([]);

  agregarItem(item: ItemCarrito) {
    const actual = this.items();
    const itemExistente = actual.find(i => i.id === item.id);

    if (itemExistente) {
      const nuevoArray = actual.map(i => {
        if (i.id === item.id) {
          return Object.assign({}, i, { cantidad: i.cantidad + item.cantidad });
        }
        return i;
      });
      this.items.set(nuevoArray);
    } else {
      this.items.set(actual.concat([item]));
    }
    
    
    this.recalcularDescuento();
  }

  removerItem(id: string) {
    const actual = this.items();
    const filtrado = actual.filter(i => i.id !== id);
    this.items.set(filtrado);
    
   
    this.recalcularDescuento();
  }

  limpiarCarrito() {
    this.items.set([]);
  }

  calcularTotal(): number {
    const subtotal = this.calcularSubtotal();
    const descuentoAplicado = this.descuento(); // Obtenemos el descuento actual
    const total = subtotal - descuentoAplicado;
    

    return total < 0 ? 0 : total;
  }

  calcularSubtotal(): number {
    let suma = 0;
    const actual = this.items();
    for (const item of actual) {
      suma += item.precio * item.cantidad;
    }
    return suma;
  }

  async aplicarCupon(codigo: string): Promise<void> {
  if (!codigo.trim()) {
    throw new Error('Ingresá un código de cupón');
  }

    const cupon = await this.cuponService.buscarCupon(codigo);
    if (!cupon) {
      throw new Error('El cupón ingresado no existe o no es válido');
    }

    const descuento = this.cuponService.calcularDescuento(
      cupon,
      this.calcularSubtotal()
    );

    
    this.cuponAplicado.set(cupon);
    this.descuento.set(descuento);
  }

    quitarCupon(): void {
    this.cuponAplicado.set(null);
    this.descuento.set(0);
  }


  private recalcularDescuento(): void {
    const cupon = this.cuponAplicado();
    if (!cupon) {
      this.descuento.set(0);
      return;
    }

    const nuevoDescuento =
      this.cuponService.calcularDescuento(
        cupon,
        this.calcularSubtotal()
      );

    this.descuento.set(nuevoDescuento);
  }

    async verificarYAplicarCuponPrimeraCompra() {
    try {
      
      const { data: { user }, error: userError } = await this.supabase.Auth.getUser();

      if (userError || !user) {
        return null; 
      }

      const userId = user.id;

      
      const { data: pedidos, error: errorPedidos } = await this.supabase.client.from('compras') .select('id').eq('usuario_id', userId); 

      if (errorPedidos) throw errorPedidos;

      
      if (pedidos && pedidos.length > 0) {
        return null; 
      }

      
      const hoy = new Date().toISOString();
      const { data: cupones, error: errorCupon } = await this.supabase.client.from('cupones')
        .select('*')
        .eq('solo_primera_compra', true)
        .eq('activo', true)
        .lte('fecha_inicio', hoy)
        .gte('fecha_fin', hoy)
        .limit(1);

      if (errorCupon || !cupones || cupones.length === 0) {
        return null; 
      }

      // Retorna el objeto del cupón listo para aplicarse
      return cupones[0];

    } catch (error) {
      console.error('Error al verificar cupón de primera compra:', error);
      return null;
    }
  }

  async registrarPuntosPorCompra(usuarioId: string, compraId: string, totalGastado: number) {
    try {
      
      const puntosGanados = Math.floor(totalGastado);

      if (puntosGanados <= 0) return;

      const { error } = await this.supabase.client
        .from('movimientos_puntos')
        .insert({
          usuario_id: usuarioId,
          tipo: 'acumulado', 
          cantidad: puntosGanados,
          compra_id: compraId,
          creado_en: new Date().toISOString()
        });

      if (error) {
        console.error('Error al registrar puntos:', error);
      }
    } catch (error) {
      console.error('Excepción al registrar puntos:', error);
    }
  }
}