import { Component, input, computed, inject, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { PeliculaService } from '../../core/services/pelicula.service';
import { CineService } from '../../core/services/cine.service'; 
import { CopyClipBoard } from '../../shared/directives/copy-clip-board';

@Component({
  selector: 'app-pelicula-detail',
  standalone: true,
  imports: [CommonModule, CopyClipBoard],
  templateUrl: './pelicula-detail.html',
  styleUrl: './pelicula-detail.css'
})
export class PeliculaDetail {
  slug = input.required<string>(); 

  private peliculaService = inject(PeliculaService);
  private cineService = inject(CineService); 
  private router = inject(Router);

  // Estados reactivos con Signals
  diasDisponibles = signal<string[]>([]);
  diaSeleccionado = signal<string | null>(null);
  funcionesDelDia = signal<any[]>([]);
  funcionSeleccionada = signal<any | null>(null);
  
  // Estados para butacas (cambiado a objetos para control preciso por ID)
  cargandoButacas = signal<boolean>(false);
  butacasSala = signal<any[]>([]);
  asientosSeleccionados = signal<any[]>([]);

  // Signal computado para obtener los nombres de los asientos seleccionados (Ej: "A1, B5")
  asientosSeleccionadosNombres = computed(() => {
    return this.asientosSeleccionados().map(a => `${a.letraFila}${a.numero}`);
  });

  // Control de vistas (pasos)
  pasoActual = signal<'dias' | 'funciones' | 'butacas'>('dias');

  // Jerarquía de prioridad estricta para los formatos
  private ordenFormatos: { [key: string]: number } = {
    '2D': 1,
    '3D': 2,
    '4D': 3,
    'XD': 4
  };

  // Signal computado que ordena automáticamente las funciones del día por formato y horario
  funcionesOrdenadasPorFormato = computed(() => {
    const funciones = this.funcionesDelDia();
    if (!funciones || funciones.length === 0) return [];

    return [...funciones].sort((a, b) => {
      const ordenA = this.ordenFormatos[a.formato] || 99;
      const ordenB = this.ordenFormatos[b.formato] || 99;

      if (ordenA !== ordenB) {
        return ordenA - ordenB;
      }

      return new Date(a.horario_inicio).getTime() - new Date(b.horario_inicio).getTime();
    });
  });

  pelicula = computed(() => {
    const slugUrl = this.slug();
    const todasLasPeliculas = this.peliculaService.peliculas();
    
    if (!todasLasPeliculas || todasLasPeliculas.length === 0) return null;

    return todasLasPeliculas.find(p => {
      const slugPelicula = p.titulo
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
        
      return slugPelicula === slugUrl;
    });
  });

  constructor() {
    effect(() => {
      const p = this.pelicula();
      if (p && p.id) {
        this.cargarDias(p.id);
      }
    });
  }

  async cargarDias(peliculaId: string) {
    try {
      const dias = await this.cineService.obtenerDiasPorPelicula(peliculaId);
      this.diasDisponibles.set(dias ?? []);
    } catch (error) {
      console.error('Error al cargar días:', error);
      this.diasDisponibles.set([]);
    }
  }

  async seleccionarDia(dia: string) {
    this.diaSeleccionado.set(dia);
    const p = this.pelicula();
    if (p && p.id) {
      try {
        const funciones = await this.cineService.obtenerFuncionesPorDia(p.id, dia);
        this.funcionesDelDia.set(funciones ?? []);
        this.pasoActual.set('funciones'); 
      } catch (error) {
        console.error('Error al cargar funciones:', error);
        this.funcionesDelDia.set([]);
      }
    }
  }

  seleccionarFuncion(funcion: any) {
    this.funcionSeleccionada.set(funcion);
    
    // Obtenemos el slug actual de la película
    const slugActual = this.slug();

    // Navegamos a la nueva ruta enviando el slug y el id de la función
    this.router.navigate(['/pelicula', slugActual, 'butacas', funcion.id]);
  }

  async cargarMapaButacas(funcionId: string, salaId: string) {
    this.cargandoButacas.set(true);
    try {
      const mapa = await this.cineService.obtenerMapaButacas(funcionId, salaId);
      this.butacasSala.set(mapa ?? []);
    } catch (error) {
      console.error('Error al cargar butacas:', error);
      this.butacasSala.set([]);
    } finally {
      this.cargandoButacas.set(false);
    }
  }

  toggleAsiento(asiento: any) {
    if (asiento.ocupado) return;

    const actual = this.asientosSeleccionados();
    const existe = actual.some(a => a.id === asiento.id);

    if (existe) {
      this.asientosSeleccionados.set(actual.filter(a => a.id !== asiento.id));
    } else {
      this.asientosSeleccionados.set([...actual, asiento]);
    }
  }

  esAsientoSeleccionado(asiento: any): boolean {
    return this.asientosSeleccionados().some(a => a.id === asiento.id);
  }

  confirmarReserva() {
    const asientos = this.asientosSeleccionados();
    const funcion = this.funcionSeleccionada();
    const idsButacas = asientos.map(a => a.id);
    
    console.log(`Reservando butacas IDs:`, idsButacas);
    console.log(`Para la función ID: ${funcion.id}`);
    
    // Aquí puedes continuar con la lógica de inserción en la tabla 'ventas' y 'detalle_ventas_butacas'
  }

  volverADias() {
    this.diaSeleccionado.set(null);
    this.funcionesDelDia.set([]);
    this.pasoActual.set('dias');
  }

  volverAFunciones() {
    this.funcionSeleccionada.set(null);
    this.asientosSeleccionados.set([]);
    this.pasoActual.set('funciones');
  }

  volver(): void {
    this.router.navigate(['/home']);
  }
}