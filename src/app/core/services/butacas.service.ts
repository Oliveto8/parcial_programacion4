import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ButacasService {
  private supabaseService = inject(SupabaseService);
  private authService = inject(AuthService);
  private supabase: SupabaseClient = this.supabaseService.client;

  // Registrar la venta de butacas, sus detalles y actualizar el estado de las butacas
  async procesarCompraButacas(funcionId: string, butacasSeleccionadas: { id: string; precio: number }[], total: number) {
    const user = this.authService.currentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const codigoQrUnico = 'CINE-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Date.now();

    // 1. Insertar la cabecera en la tabla 'ventas' (vinculando la función de cine)
    const { data: ventaData, error: ventaError } = await this.supabase
      .from('ventas')
      .insert({
        user_id: user.id,
        funcion_id: funcionId, // Ahora sí se vincula la función seleccionada
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
    const detalles = butacasSeleccionadas.map(butaca => ({
      venta_id: ventaId,
      butaca_id: butaca.id
    }));

    // 3. Insertar los detalles de las butacas compradas
    const { error: detalleError } = await this.supabase
      .from('detalle_ventas_butacas')
      .insert(detalles);

    if (detalleError) throw detalleError;

    // 4. Actualizar el estado de cada butaca a 'ocupada' (o el término que uses en tu base de datos)
    for (const butaca of butacasSeleccionadas) {
      const { error: butacaError } = await this.supabase
        .from('butacas')
        .update({ estado: 'ocupada' }) // Actualiza el estado en la tabla butacas
        .eq('id', butaca.id);

      if (butacaError) {
        console.error(`Error al actualizar el estado de la butaca ${butaca.id}:`, butacaError);
      }
    }

    return { ventaId, codigoQrUnico };
  }
}