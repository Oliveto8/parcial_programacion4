import { Injectable, signal, computed, inject, DestroyRef } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Pelicula } from '../models/pelicula.interface';
import { RealtimeChannel } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class PeliculaService {
  private supabase = inject(SupabaseService).client;
  private destroyRef = inject(DestroyRef);

  // Signal privado para la lista de películas
  private peliculasSignal = signal<Pelicula[]>([]);

  // Signal para indicar estado de carga
  cargando = signal(false);

  // Computed público de solo lectura para los componentes
  peliculas = computed(() => this.peliculasSignal());

  private channel!: RealtimeChannel;

  constructor() {
    this.cargarPeliculasDesdeDB();
    this.channel = this.iniciarRealtime();

    this.destroyRef.onDestroy(() => {
      this.supabase.removeChannel(this.channel);
    });
  }

  // ============================================================
  // CARGAR PELÍCULAS DESDE SUPABASE
  // ============================================================
  private async cargarPeliculasDesdeDB(): Promise<void> {
    this.cargando.set(true);

    const { data, error } = await this.supabase
      .from('peliculas')
      .select('*')
      .order('titulo', { ascending: true });

    if (error) {
      console.error('❌ Error al cargar películas desde Supabase:', error.message);
    } else {
      this.peliculasSignal.set(data || []);
      console.log(`✅ Se cargaron ${data?.length ?? 0} películas desde Supabase`);
    }

    this.cargando.set(false);
  }

  // ============================================================
  // REALTIME — Escucha cambios en la tabla 'peliculas' en tiempo real
  // ============================================================
  private iniciarRealtime(): RealtimeChannel {
    return this.supabase
      .channel('peliculas-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'peliculas' },
        (payload) => {
          console.log('🔄 Cambio en tiempo real (Películas):', payload.eventType, payload);

          switch (payload.eventType) {
            case 'INSERT':
              this.peliculasSignal.update(peliculas => [...peliculas, payload.new as Pelicula]);
              break;

            case 'UPDATE':
              this.peliculasSignal.update(peliculas =>
                peliculas.map(p => p.id === (payload.new as Pelicula).id
                  ? payload.new as Pelicula
                  : p
                )
              );
              break;

            case 'DELETE':
              this.peliculasSignal.update(peliculas =>
                peliculas.filter(p => p.id !== (payload.old as { id: string }).id)
              );
              break;
          }
        }
      )
      .subscribe();
  }

  // Obtener una película por ID de forma reactiva
  getPeliculaById(id: string) {
    return computed(() => this.peliculasSignal().find(pelicula => pelicula.id === id));
  }

  // ============================================================
  // AGREGAR PELÍCULA (Panel Admin)
  // ============================================================
  async agregarPelicula(pelicula: Omit<Pelicula, 'id'>): Promise<boolean> {
    const { error } = await this.supabase
      .from('peliculas')
      .insert([pelicula]);

    if (error) {
      console.error('❌ Error al agregar película:', error.message);
      return false;
    }

    console.log(`🎬 Nueva película agregada: "${pelicula.titulo}"`);
    return true;
  }

  // ============================================================
  // MODIFICAR / DESACTIVAR PELÍCULA
  // ============================================================
  async actualizarEstadoPelicula(id: string, activa: boolean): Promise<boolean> {
    const { error } = await this.supabase
      .from('peliculas')
      .update({ activa })
      .eq('id', id);

    if (error) {
      console.error('❌ Error al actualizar estado de película:', error.message);
      return false;
    }
    return true;
  }
}