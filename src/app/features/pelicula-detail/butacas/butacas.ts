import { Component, input, inject, signal, OnInit, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CineService } from '../../../core/services/cine.service';
import { PeliculaService } from '../../../core/services/pelicula.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-butacas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './butacas.html',
  styleUrl: './butacas.css'
})
export class ButacasComponent implements OnInit {
  slug = input.required<string>();
  funcionId = input.required<string>();
  
  precioEntrada: number = 12000; // Valor por defecto (2D)

  private cineService = inject(CineService);
  private peliculaService = inject(PeliculaService);
  private authService = inject(AuthService);
  private router = inject(Router);

  cargando = signal<boolean>(true);
  procesandoCompra = signal<boolean>(false);
  funcion = signal<any | null>(null);
  butacasSala = signal<any[]>([]);
  asientosSeleccionados = signal<any[]>([]);

  asientosSeleccionadosNombres = computed<string[]>(() => {
    return this.asientosSeleccionados().map((a: any) => `${a.fila || a.letraFila}${a.numero}`);
  });

  precioTotal = computed<number>(() => {
    return this.asientosSeleccionados().length * this.precioEntrada;
  });

  ngOnInit(): void {
    this.cargarDatosFuncion();
  }

  async cargarDatosFuncion(): Promise<void> {
    this.cargando.set(true);
    try {
      // 1. Consultamos directamente la tabla 'funciones' para obtener el formato y la sala_id
      const { data: funcionData, error: funcionError } = await (this.cineService as any).supabase
        .from('funciones')
        .select('id, formato, sala_id')
        .eq('id', this.funcionId())
        .single();

      if (funcionError) throw funcionError;

      if (funcionData) {
        this.funcion.set(funcionData);
        
        // 2. Evaluamos el formato que viene de la base de datos y asignamos el precio correspondiente
        const formato: string = (funcionData.formato || '2D').toUpperCase();
        
        switch (formato) {
          case '3D':
            this.precioEntrada = 16000;
            break;
          case '4D':
            this.precioEntrada = 20000;
            break;
          case 'XD':
            this.precioEntrada = 14000;
            break;
          case '2D':
          default:
            this.precioEntrada = 12000;
            break;
        }

        // 3. Obtenemos el mapa de butacas usando la sala_id que ya obtuvimos
        const mapa = await this.cineService.obtenerMapaButacas(this.funcionId(), funcionData.sala_id);
        this.butacasSala.set(mapa ?? []);
      }
    } catch (error) {
      console.error('Error al cargar los datos de la función y butacas:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  toggleAsiento(asiento: any): void {
    if (asiento.ocupado) return;
    const actual = this.asientosSeleccionados();
    const existe = actual.some((a: any) => a.id === asiento.id);

    if (existe) {
      this.asientosSeleccionados.set(actual.filter((a: any) => a.id !== asiento.id));
    } else {
      this.asientosSeleccionados.set([...actual, asiento]);
    }
  }

  esAsientoSeleccionado(asiento: any): boolean {
    return this.asientosSeleccionados().some((a: any) => a.id === asiento.id);
  }

  volver(): void {
    this.router.navigate(['/pelicula', this.slug()]);
  }

  // Lógica completa de confirmación, registro en Supabase, alerta y redirección al Home
  async confirmarReserva(): Promise<void> {
    if (this.asientosSeleccionados().length === 0) {
      alert('Por favor selecciona al menos una butaca.');
      return;
    }

    const user = this.authService.currentUser();
    if (!user) {
      alert('Debes iniciar sesión para completar la compra.');
      return;
    }

    this.procesandoCompra.set(true);
    const supabaseClient = (this.cineService as any).supabase;

    try {
      // Generamos un código QR único para la venta de cine (se guarda para 'Mis Compras')
      const codigoQrUnico = 'CINE-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Date.now();
      const total = this.precioTotal();

      // 1. Insertar la cabecera en la tabla 'ventas' (vinculando funcion_id)
      const { data: ventaData, error: ventaError } = await supabaseClient
        .from('ventas')
        .insert({
          user_id: user.id,
          funcion_id: this.funcionId(),
          total: total,
          estado: 'completado',
          fecha_compra: new Date().toISOString(),
          codigo_qr: codigoQrUnico
        })
        .select('id')
        .single();

      if (ventaError) throw ventaError;
      const ventaId = ventaData.id;

      // 2. Preparar los registros para 'detalle_ventas_butacas'
      const detalles = this.asientosSeleccionados().map((asiento: any) => ({
        venta_id: ventaId,
        butaca_id: asiento.id
      }));

      // 3. Insertar los detalles de las butacas compradas
      const { error: detalleError } = await supabaseClient
        .from('detalle_ventas_butacas')
        .insert(detalles);

      if (detalleError) throw detalleError;

      // 4. Actualizar el estado de cada butaca a 'ocupada' en la base de datos
      for (const asiento of this.asientosSeleccionados()) {
        const { error: butacaError } = await supabaseClient
          .from('butacas')
          .update({ estado: 'ocupada' })
          .eq('id', asiento.id);

        if (butacaError) {
          console.error(`Error al actualizar el estado de la butaca ${asiento.id}:`, butacaError);
        }
      }

      this.asientosSeleccionados.set([]); // Limpiar selección

      // 5. Alerta de éxito y redirección inmediata al Home
      window.alert('¡Compra realizada con éxito! Tus butacas han sido reservadas correctamente.');
      this.router.navigate(['/home']);

    } catch (error: any) {
      console.error('Error al procesar la compra de butacas:', error);
      alert('Hubo un error al registrar tus entradas: ' + (error.message || JSON.stringify(error)));
    } finally {
      this.procesandoCompra.set(false);
    }
  }
}