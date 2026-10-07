import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ButacaService } from '../../../../services/butacas/butacas';
import { NavbarComponent } from '../../../../components/ui/navbar/navbar';
import { FuncionService } from '../../../../services/funciones/funciones';
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
        this.suscripcion = this.butacaService.sup.client
          .channel('cambios-butacas-sala')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'butacas',
            },
            async (data: any) => {
              console.log('Cambio detectado en butaca:', data);

              const funcion = this.Funcion();
              if (funcion) {
                const todasLasButacas = await this.butacaService.mostrar_por_sala(funcion.sala_id);
                this.construirMapaFilas(todasLasButacas);
              }
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
    const salaId = funcion.sala_id;

    // Solo necesitamos traer las butacas de la sala (que ya traen su columna 'estado')
    const todasLasButacas = await this.butacaService.mostrar_por_sala(salaId);

    this.construirMapaFilas(todasLasButacas);
  } catch (error) {
    console.error('Error al cargar las butacas de la función:', error);
  } finally {
    this.cargando.set(false);
  }
}

 
  private construirMapaFilas(todasLasButacas: any[]) {
  const seleccionadasActuales = new Set(this.butacasSeleccionadas());
  const mapaFilas = new Map<string, any[]>();

  for (const b of todasLasButacas) {
    // Verificamos el estado directamente desde la base de datos ('disponible' u 'ocupada')
    const esOcupada = b.estado === 'ocupada'; 
    
    if (esOcupada && seleccionadasActuales.has(b.id)) {
      seleccionadasActuales.delete(b.id);
    }

    const asientoConEstado = {
      ...b,
      estado: b.estado, // Mantenemos el estado exacto de la base de datos ('disponible' u 'ocupada')
      seleccionado: seleccionadasActuales.has(b.id)
    };

    if (!mapaFilas.has(b.fila)) {
      mapaFilas.set(b.fila, []);
    }
    mapaFilas.get(b.fila)?.push(asientoConEstado);
  }

  const resultado = Array.from(mapaFilas.entries()).map(([fila, asientos]) => ({
    fila,
    asientos: asientos.sort((x, y) => x.numero - y.numero)
  })).sort((a, b) => a.fila.localeCompare(b.fila));

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
    
    console.log("IDs que se van a bloquear:", idsSeleccionados); // <--- Mira esto en la consola

    if (idsSeleccionados.length === 0) {
        console.warn("No hay butacas seleccionadas");
        return;
    }
    
    const respuesta = await this.butacaService.bloquearButacas(idsSeleccionados);
    console.log("Respuesta directa de Supabase al actualizar:", respuesta);
}
}