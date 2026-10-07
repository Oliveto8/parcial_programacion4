import { Component, Input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pelicula } from '../../../core/models/pelicula.interface';

@Component({
  selector: 'app-pelicula-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pelicula-card.html',
  styleUrl: './pelicula-card.css'
})
export class PeliculaCard {
  @Input({ required: true }) pelicula!: Pelicula;
  
  // NUEVO: Indicador para saber si debe mostrarse como próximo estreno
  @Input() esProximo: boolean = false;

  verFunciones = output<Pelicula>();

  onVerClick(): void {
    this.verFunciones.emit(this.pelicula);
  }

  // Agrega este método dentro de la clase PeliculaCard en tu .ts
formatearFecha(fecha: string | Date | undefined): string {
  if (!fecha) return '';
  const fechaStr = typeof fecha === 'string' ? fecha : fecha.toISOString().split('T')[0];
  return fechaStr.split('-').reverse().join('/');
}
}