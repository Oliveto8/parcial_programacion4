import { Component, signal, computed, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PeliculaCard } from '../../shared/components/pelicula-card/pelicula-card';
import { SearchBar } from '../../shared/components/search-bar/search-bar';
import { PeliculaService } from '../../core/services/pelicula.service';
import { Pelicula } from '../../core/models/pelicula.interface';

@Component({
  selector: 'app-home',
  imports: [PeliculaCard, SearchBar],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private peliculaService = inject(PeliculaService);
  private router = inject(Router);

  peliculas = this.peliculaService.peliculas;
  filtroBusqueda = signal('');
  private fechaActual = new Date().toISOString().split('T')[0];

  // 1. Películas en Cartelera
  peliculasEnCartelera = computed(() => {
    const termino = this.filtroBusqueda().toLowerCase();
    
    const enCartelera = this.peliculas().filter(p => {
      // Si el administrador la desactivó manualmente, se oculta de la cartelera
      if (!p.activa) return false;
      
      if (!p.fecha_estreno) return true;
      return String(p.fecha_estreno) <= this.fechaActual;
    });

    if (!termino) return enCartelera;

    return enCartelera.filter(pelicula =>
      pelicula.titulo.toLowerCase().includes(termino) ||
      pelicula.generos.some(g => g.toLowerCase().includes(termino))
    );
  });

  // 2. Próximos Estrenos (Ordenados del más cercano al más lejano)
  peliculasProximas = computed(() => {
    const termino = this.filtroBusqueda().toLowerCase();
    
    const proximas = this.peliculas()
      .filter(p => {
        if (!p.fecha_estreno) return false;
        return String(p.fecha_estreno) > this.fechaActual;
      })
      // Ordenar por fecha de estreno ascendente (la más próxima primero)
      .sort((a, b) => String(a.fecha_estreno).localeCompare(String(b.fecha_estreno)));

    if (!termino) return proximas;

    return proximas.filter(pelicula =>
      pelicula.titulo.toLowerCase().includes(termino) ||
      pelicula.generos.some(g => g.toLowerCase().includes(termino))
    );
  });

  constructor() {
    effect(() => {
      console.log(`🎬 Filtro activo: "${this.filtroBusqueda()}"`);
    });
  }

  private generarSlug(titulo: string): string {
    return titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  onVerFunciones(pelicula: Pelicula): void {
    const slug = this.generarSlug(pelicula.titulo);
    this.router.navigate(['/pelicula', slug]);
  }
}