import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButacaService } from '../../../services/butacas/butacas';
import { NavbarComponent } from '../../../components/ui/navbar/navbar';
import { FuncionService } from '../../../services/funciones/funciones';
import { RealtimeChannel } from '@supabase/supabase-js';
import { CarritoService } from '../../../services/carrito/carrito';

@Component({
  selector: 'app-seleccion-butacas',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './butacas.html',
  styleUrl: './butacas.css'
})
export class SeleccionButacas implements OnInit, OnDestroy {
  logo_menus = "/assets/imagenes/Gemini2.png"
  private butacaService = inject(ButacaService);
  private route = inject(ActivatedRoute);
  private funciones = inject(FuncionService);
  private carritoService = inject(CarritoService);
  ruta = inject(Router);

  filasAgrupadas = signal<any[]>([]);
  cargando = signal<boolean>(true);
  Funcion = signal<any>(null);
  butacasSeleccionadas = signal<string[]>([]);
  confirmaVip = signal(false);
  hayVipSeleccionada = signal(false);
  total = signal(0);
  puedeContinuar = signal(false);

  suscripcion?: RealtimeChannel;
  private funcionIdActual: string | null = null;

  async ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      const FuncionId = params['funcionId'];
      this.funcionIdActual = FuncionId ?? null;

      if (FuncionId) {
        await this.cargarButacasPorFuncion(FuncionId);
        this.suscriberseARealtime(FuncionId);
      } else {
        console.warn('Falta el ID de la función en la URL');
        this.cargando.set(false);
      }
    });
  }

  ngOnDestroy() {
    if (this.suscripcion) {
      this.butacaService.sup.client.removeChannel(this.suscripcion);
    }
  }

  private suscriberseARealtime(funcionId: string) {
    // Si ya había una suscripción previa, la removemos limpiamente
    if (this.suscripcion) {
      this.butacaService.sup.client.removeChannel(this.suscripcion);
    }

    // Creamos un canal único y aseguramos escuchar el evento en la tabla correcta
    this.suscripcion = this.butacaService.sup.client
      .channel(`room-reservas-${funcionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservas_temporales',
          filter: `funcion_id=eq.${funcionId}`
        },
        async (payload) => {
          console.log('Cambio detectado en tiempo real:', payload);
          const funcion = this.Funcion();
          if (!funcion) return;

          const [todasLasButacas, ocupadasIds] = await Promise.all([
            this.butacaService.mostrar_por_sala(funcion.sala_id),
            this.butacaService.mostrar_ocupadas(funcionId),
          ]);
          this.construirMapaFilas(todasLasButacas, new Set(ocupadasIds));
        }
      )
      .subscribe((status) => {
        console.log('Estado de la suscripción Realtime:', status);
      });
  }

  async cargarButacasPorFuncion(funcionId: string) {
    this.cargando.set(true);
    try {
      const funcion = await this.funciones.mostrar_funcion_por_id(funcionId);
      if (!funcion) throw new Error('No se encontró la función o la sala asociada.');
      this.Funcion.set(funcion);

      const [todasLasButacas, ocupadasIds] = await Promise.all([
        this.butacaService.mostrar_por_sala(funcion.sala_id),
        this.butacaService.mostrar_ocupadas(funcionId),
      ]);

      this.construirMapaFilas(todasLasButacas, new Set(ocupadasIds));
    } catch (error) {
      console.error('Error al cargar las butacas de la función:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  private construirMapaFilas(todasLasButacas: any[], ocupadas: Set<string>) {
  const seleccionadasAntes = this.butacasSeleccionadas();
  const seleccionadasAhora: string[] = [];
  const filas: any[] = [];
  let filaActual: any = null;

  for (const b of todasLasButacas) {
    const esOcupada = ocupadas.has(b.id);
    let estaSeleccionada = seleccionadasAntes.includes(b.id);

    if (esOcupada) estaSeleccionada = false;
    if (estaSeleccionada) seleccionadasAhora.push(b.id);

    const asiento = {
      id: b.id,
      fila: b.fila,
      numero: b.numero,
      tipo: b.tipo,
      estado: esOcupada ? 'ocupada' : 'disponible',
      seleccionado: estaSeleccionada
    };

    if (filaActual === null || filaActual.fila !== b.fila) {
      filaActual = { fila: b.fila, asientos: [] };
      filas.push(filaActual);
    }
    filaActual.asientos.push(asiento);
  }

  this.filasAgrupadas.set(filas);
  this.butacasSeleccionadas.set(seleccionadasAhora);
  this.recalcularResumen();
}

  alternarSeleccion(asiento: any) {
  if (asiento.estado === 'ocupada') return;

  asiento.seleccionado = !asiento.seleccionado;

  const nuevaLista: string[] = [];
  for (const id of this.butacasSeleccionadas()) {
    if (id !== asiento.id) nuevaLista.push(id);
  }
  if (asiento.seleccionado) nuevaLista.push(asiento.id);

  this.butacasSeleccionadas.set(nuevaLista);
  this.recalcularResumen();
}

  ConfirmaVip(): void {
    this.confirmaVip.set(!this.confirmaVip());
    this.recalcularResumen();
  }

  private recalcularResumen(): void {
    const f = this.Funcion();
    if (!f) return;
    let suma = 0;
    let hayVip = false;

    for (const grupo of this.filasAgrupadas()) {
      for (const asiento of grupo.asientos) {
        if (asiento.seleccionado) {
          suma += asiento.tipo === 'vip' ? f.precio_vip : f.precio_base;
          if (asiento.tipo === 'vip') hayVip = true;
        }
      }
    }

    this.total.set(suma);
    this.hayVipSeleccionada.set(hayVip);
    this.puedeContinuar.set(
      this.butacasSeleccionadas().length > 0 && (!hayVip || this.confirmaVip())
    );
  }

  async continuarAlCandy() {
    const idsSeleccionadas = this.butacasSeleccionadas();

    if (idsSeleccionadas.length === 0) return;

    try {
      // 1. Guardamos las reservas temporales usando el método que ya tienes en el servicio
      if (this.funcionIdActual) {
        await this.butacaService.reservar_butacas(this.funcionIdActual, idsSeleccionadas);
      }

      const butacasSeleccionadas = [];

      for (const grupo of this.filasAgrupadas()) {
        for (const asiento of grupo.asientos) {
          if (asiento.seleccionado) {
            butacasSeleccionadas.push({
              id: asiento.id,
              tipo: asiento.tipo,
              fila: asiento.fila,     
              numero: asiento.numero,
              precio: asiento.tipo === 'vip'
                ? this.Funcion().precio_vip
                : this.Funcion().precio_base
            });
          }
        }
      }

      this.carritoService.funcionCompra.set(this.Funcion());
      this.carritoService.butacasCompra.set(butacasSeleccionadas);
   
     
      const itemEntradas = {
        id: 'butacas-reserva',
        nombre: `Butacas seleccionadas: ${idsSeleccionadas}`,
        precio: this.total(),
        tipo: 'entrada' as const,
        cantidad: 1
      };

      const actual = this.carritoService.items();
        const filtrado = actual.filter(i => i.id !== 'butacas-reserva');

        this.carritoService.items.set(
          filtrado.concat([itemEntradas])
        );

      // 4. Navegamos a la pantalla de candy
      this.ruta.navigate(['/compra/candy']);

    } catch (error) {
      console.error('Error al registrar las butacas temporalmente:', error);
    }
  }
}