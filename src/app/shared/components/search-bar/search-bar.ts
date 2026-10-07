import { Component, model } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css'
})
export class SearchBar {
  // model() — permite two-way binding entre padre e hijo
  // El padre puede usar [(termino)]="suSignal" para sincronizar el valor
  termino = model<string>('');

  limpiar(): void {
    this.termino.set('');
  }
}
