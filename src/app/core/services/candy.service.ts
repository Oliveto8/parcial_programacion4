import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CandyService {
  private supabaseService = inject(SupabaseService);
  private authService = inject(AuthService);
  private supabase: SupabaseClient = this.supabaseService.client;

  // Obtener los productos del Candy y resolver la URL pública de la imagen desde el Storage
  async obtenerProductosCandy() {
    const { data, error } = await this.supabase
      .from('productos_candy')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;
    if (!data) return [];

    return data.map(producto => {
      let urlImagen = '';
      
      if (producto.imagen_url) {
        if (producto.imagen_url.startsWith('http')) {
          urlImagen = producto.imagen_url;
        } else {
          let rutaArchivo = producto.imagen_url;
          if (rutaArchivo.includes('/')) {
            rutaArchivo = rutaArchivo.split('/')[1];
          }

          const nombreBucket = producto.categoria ? producto.categoria.toLowerCase() : 'comidas';

          const { data: publicUrlData } = this.supabase
            .storage
            .from(nombreBucket)
            .getPublicUrl(rutaArchivo);
            
          urlImagen = publicUrlData.publicUrl;
        }
      }

      return {
        ...producto,
        imagen_url: urlImagen
      };
    });
  }

  // Registrar la venta, sus detalles y descontar el stock en la base de datos
  async procesarCompraCandy(carritoItems: { producto: any; cantidad: number }[], total: number) {
    const user = this.authService.currentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const codigoQrUnico = 'CANDY-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Date.now();

    // 1. Insertar la cabecera en la tabla 'ventas'
    const { data: ventaData, error: ventaError } = await this.supabase
      .from('ventas')
      .insert({
        user_id: user.id,
        total: total,
        estado: 'completado',
        fecha_compra: new Date().toISOString(),
        codigo_qr: codigoQrUnico
      })
      .select('id')
      .single();

    if (ventaError) throw ventaError;
    const ventaId = ventaData.id;

    // 2. Preparar los registros para 'detalle_ventas_candy'
    const detalles = carritoItems.map(item => ({
      venta_id: ventaId,
      producto_id: item.producto.id,
      cantidad: item.cantidad,
      subtotal: item.producto.precio * item.cantidad
    }));

    // 3. Insertar todos los detalles en la base de datos
    const { error: detalleError } = await this.supabase
      .from('detalle_ventas_candy')
      .insert(detalles);

    if (detalleError) throw detalleError;

    // 4. Descontar el stock de cada producto comprado en 'productos_candy'
    for (const item of carritoItems) {
      const nuevoStock = item.producto.stock - item.cantidad;

      const { error: stockError } = await this.supabase
        .from('productos_candy')
        .update({ stock: nuevoStock >= 0 ? nuevoStock : 0 }) // Evita stocks negativos por seguridad
        .eq('id', item.producto.id);

      if (stockError) {
        console.error(`Error al actualizar el stock del producto ${item.producto.nombre}:`, stockError);
      }
    }

    return { ventaId, codigoQrUnico };
  }
}