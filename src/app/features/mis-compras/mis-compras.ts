import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CineService } from '../../core/services/cine.service'; // Ajusta la ruta según tu estructura
import { AuthService } from '../../core/services/auth.service';     // Ajusta la ruta según tu estructura

@Component({
  selector: 'app-mis-compras',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-compras.html',
})
export class MisComprasComponent implements OnInit {
  private cineService = inject(CineService);
  private authService = inject(AuthService);
  public router = inject(Router);

  cargando = signal<boolean>(true);
  compras = signal<any[]>([]);

  async ngOnInit(): Promise<void> {
    await this.cargarMisCompras();
  }

  async cargarMisCompras(): Promise<void> {
    const user = this.authService.currentUser();
    if (!user) {
      this.cargando.set(false);
      return;
    }

    try {
      const supabaseClient = (this.cineService as any).supabase;

      // Consultamos la tabla 'ventas' uniendo con 'funciones' y 'peliculas'
      // Gracias a tu estructura, si tiene funcion_id es cine, si no, es del Candy Bar.
      const { data: ventas, error } = await supabaseClient
        .from('ventas')
        .select(`
          id,
          fecha_compra,
          total,
          codigo_qr,
          funcion_id,
          funciones (
            peliculas (
              titulo
            )
          )
        `)
        .eq('user_id', user.id)
        .order('fecha_compra', { ascending: false });

      if (error) throw error;

      // Mapeamos y separamos según corresponda de forma limpia
      const listaFormateada = (ventas || []).map((v: any) => {
        const esCine = v.funcion_id !== null && v.funcion_id !== undefined;
        return {
          id: v.id,
          tipo: esCine ? 'Entrada de Cine' : 'Candy Bar',
          titulo: esCine ? (v.funciones?.peliculas?.titulo || 'Función de Cine') : 'Compra en Candy Bar',
          detalle: esCine ? 'Butacas reservadas para la función' : 'Productos de confitería y bebidas',
          total: v.total,
          codigo_qr: v.codigo_qr,
          fecha_compra: v.fecha_compra
        };
      });

      this.compras.set(listaFormateada);

    } catch (e) {
      console.error('Error al cargar las compras del usuario:', e);
    } finally {
      this.cargando.set(false);
    }
  }

  formatearFecha(fechaStr: string): string {
    if (!fechaStr) return '';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString() + ' ' + fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}