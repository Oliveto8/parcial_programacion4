import { Component, input, signal, effect } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class About {
  // input() de ruta para query params — Angular inyecta '?version=X'
  // como input gracias a withComponentInputBinding()
  version = input<string>('');

  // signal() para mostrar la versión actual
  versionActual = signal('1.0');

  constructor() {
    // effect() — actualiza la versión si viene por query param
    effect(() => {
      const v = this.version();
      if (v) {
        this.versionActual.set(v);
      }
    });
  }
}
