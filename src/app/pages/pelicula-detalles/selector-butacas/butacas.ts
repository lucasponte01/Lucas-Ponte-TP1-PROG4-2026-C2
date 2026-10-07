import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButacaService } from '../../../services/butacas/butacas';
import { NavbarComponent } from '../../../components/ui/navbar/navbar';
import { FuncionService } from '../../../services/funciones/funciones';
import { RealtimeChannel } from '@supabase/supabase-js';
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
  ruta = inject(Router)
  filasAgrupadas = signal<any[]>([]);
  cargando = signal<boolean>(true);
  Funcion = signal<any>(null);
  butacasSeleccionadas = signal<string[]>([]);
  confirmaVip = signal(false);
  hayVipSeleccionada = signal(false);
  total = signal(0);
  puedeContinuar = signal(false);

  suscripcion?: RealtimeChannel;
  realtimeChannel?: RealtimeChannel;
  private funcionIdActual: string | null = null;

  async ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      const FuncionId = params['funcionId'];
      this.funcionIdActual = FuncionId ?? null;

      if (FuncionId) {
        await this.cargarButacasPorFuncion(FuncionId);
      } else {
        console.warn('Falta el ID de la función en la URL');
        this.cargando.set(false);
      }

      if (this.funcionIdActual) {
       this.suscripcion = this.butacaService.sup.client.channel('cambios-reservas-' + this.funcionIdActual).on(
          'postgres_changes',
          { event: '*',
            schema: 'public', 
            table: 'reservas_temporales', 
            filter: 'funcion_id=eq.' + this.funcionIdActual },
          async () => {
            const funcion = this.Funcion();
            if (!funcion) return;

            const [todasLasButacas, ocupadasIds] = await Promise.all([
              this.butacaService.mostrar_por_sala(funcion.sala_id),
              this.butacaService.mostrar_ocupadas(this.funcionIdActual!),
            ]);
            this.construirMapaFilas(todasLasButacas, new Set(ocupadasIds));
          }
        )
        .subscribe();
    }
    });
  }

  ngOnDestroy() {
    this.suscripcion?.unsubscribe();
    this.realtimeChannel?.unsubscribe();
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
    const seleccionadasActuales = new Set(this.butacasSeleccionadas());
    const mapaFilas = new Map<string, any[]>();

    for (const b of todasLasButacas) {
      const esOcupada = ocupadas.has(b.id);
      if (esOcupada && seleccionadasActuales.has(b.id)) {
        seleccionadasActuales.delete(b.id);
      }

      const asientoConEstado = {
        ...b,
        estado: esOcupada ? 'ocupada' : 'disponible',
        seleccionado: seleccionadasActuales.has(b.id)
      };

      if (!mapaFilas.has(b.fila)) mapaFilas.set(b.fila, []);
      mapaFilas.get(b.fila)?.push(asientoConEstado);
    }

    const resultado = Array.from(mapaFilas.entries())
      .map(([fila, asientos]) => ({ fila, asientos: asientos.sort((x, y) => x.numero - y.numero) }))
      .sort((a, b) => a.fila.localeCompare(b.fila));

    this.filasAgrupadas.set(resultado);
    this.butacasSeleccionadas.set(Array.from(seleccionadasActuales));
    this.recalcularResumen();
  }


  alternarSeleccion(asiento: any) {
    if (asiento.estado === 'ocupada') return;

    asiento.seleccionado = !asiento.seleccionado;
    const actual = this.butacasSeleccionadas();
    if (asiento.seleccionado) {
      this.butacasSeleccionadas.set([...actual, asiento.id]);
    } else {
      this.butacasSeleccionadas.set(actual.filter(id => id !== asiento.id));
    }
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

  async continuarCompra() {
    const idsSeleccionados = this.butacasSeleccionadas();
    if (idsSeleccionados.length === 0) return;

    try {
      await this.butacaService.reservar_butacas(this.funcionIdActual!, idsSeleccionados);
      this.ruta.navigate(['/compra/candy'], { queryParams: {} })
    } catch (e) {
      console.error(e);
      
    }
  }
}