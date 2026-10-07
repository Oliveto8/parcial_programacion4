import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service'; // Ajusta la ruta relativa según donde esté tu archivo supabase.service

@Injectable({
  providedIn: 'root'
})
export class CineService {
  private supabaseService = inject(SupabaseService);
  private supabase: SupabaseClient = this.supabaseService.client;

  // 1. Obtener los días únicos disponibles para una película específica
  async obtenerDiasPorPelicula(peliculaId: string) {
    const { data, error } = await this.supabase
      .from('funciones')
      .select('horario_inicio')
      .eq('pelicula_id', peliculaId)
      .gte('horario_inicio', new Date().toISOString())
      .order('horario_inicio', { ascending: true });

    if (error) throw error;
    if (!data) return [];

    // Extraemos solo las fechas únicas (YYYY-MM-DD)
    const fechasUnicas = [...new Set(data.map(f => f.horario_inicio.split('T')[0]))];
    return fechasUnicas;
  }

  // 2. Obtener las funciones (horarios, salas, precios) para una película y fecha específica
  async obtenerFuncionesPorDia(peliculaId: string, fecha: string) {
    const inicioDia = `${fecha}T00:00:00`;
    const finDia = `${fecha}T23:59:59`;

    const { data, error } = await this.supabase
      .from('funciones')
      .select(`
        id,
        horario_inicio,
        horario_fin,
        formato,
        idioma,
        precio_base,
        salas ( id, nombre )
      `)
      .eq('pelicula_id', peliculaId)
      .gte('horario_inicio', inicioDia)
      .lte('horario_inicio', finDia)
      .order('horario_inicio', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // 3. Método auxiliar para conectar la ruta con el ID de la función y su sala
  async obtenerMapaButacasParaRuta(funcionId: string) {
    try {
      // Consultamos la tabla 'funciones' para obtener la sala_id de esta función específica
      const { data: funcionData, error: funcionError } = await this.supabase
        .from('funciones')
        .select('sala_id')
        .eq('id', funcionId)
        .single();

      if (funcionError) throw funcionError;
      if (!funcionData) throw new Error('No se encontró la función');

      // Llamamos al método principal que genera el mapa con la sala encontrada
      return await this.obtenerMapaButacas(funcionId, funcionData.sala_id);
    } catch (error) {
      console.error('Error en obtenerMapaButacasParaRuta:', error);
      throw error;
    }
  }

  // 4. Obtener el mapa de butacas de la sala y marcar las ocupadas para una función específica
  async obtenerMapaButacas(funcionId: string, salaId: string) {
    try {
      // Paso 1: Obtener todas las butacas físicas que pertenecen a esta sala
      const { data: butacasSala, error: errorButacas } = await this.supabase
        .from('butacas')
        .select('id, fila, numero, tipo, accesible')
        .eq('sala_id', salaId)
        .order('fila', { ascending: true })
        .order('numero', { ascending: true });

      if (errorButacas) throw errorButacas;
      if (!butacasSala || butacasSala.length === 0) return [];

      // Paso 2: Buscar todas las ventas asociadas a esta función
      const { data: ventasFuncion, error: errorVentas } = await this.supabase
        .from('ventas')
        .select('id')
        .eq('funcion_id', funcionId);

      if (errorVentas) throw errorVentas;

      const ventaIds = ventasFuncion ? ventasFuncion.map(v => v.id) : [];

      // Paso 3: Si hay ventas, buscar qué IDs de butacas están ocupados en el detalle de ventas
      const butacasOcupadasIds = new Set<string>();
      if (ventaIds.length > 0) {
        const { data: detallesVentas, error: errorDetalles } = await this.supabase
          .from('detalle_ventas_butacas')
          .select('butaca_id')
          .in('venta_id', ventaIds);

        if (errorDetalles) throw errorDetalles;

        if (detallesVentas) {
          detallesVentas.forEach(d => butacasOcupadasIds.add(d.butaca_id));
        }
      }

      // Paso 4: Agrupar las butacas por fila para la interfaz
      const filasMap: { [key: string]: any[] } = {};

      butacasSala.forEach(butaca => {
        const letraFila = butaca.fila;
        if (!filasMap[letraFila]) {
          filasMap[letraFila] = [];
        }

        filasMap[letraFila].push({
          id: butaca.id,
          letraFila: butaca.fila,
          numero: butaca.numero,
          tipo: butaca.tipo,
          accesible: butaca.accesible,
          ocupado: butacasOcupadasIds.has(butaca.id) // True si ya fue comprada
        });
      });

      // Transformar el objeto en un array ordenado para el @for de Angular
      const matrizFilas = Object.keys(filasMap).sort().map(letraFila => ({
        letraFila: letraFila,
        asientos: filasMap[letraFila]
      }));

      return matrizFilas;

    } catch (error) {
      console.error('Error al obtener el mapa de butacas:', error);
      throw error;
    }
  }

}