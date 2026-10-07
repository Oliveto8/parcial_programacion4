import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-candy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './candy-card.html',
  styleUrl: './candy-card.css'
})
export class CardCandyComponent {
  // Recibe la información individual de un producto del candy
  @Input() producto: any; 

  // Emite el evento hacia el componente padre cuando el usuario interactúa
  @Output() agregarAlCarrito = new EventEmitter<any>();

  onAgregar(): void {
    this.agregarAlCarrito.emit(this.producto);
  }
}