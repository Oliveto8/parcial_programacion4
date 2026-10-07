import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode, LOCALE_ID } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { routes } from './app.routes';
// Importaciones para configurar el idioma español (Argentina)
import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
// Registramos los datos de localización
registerLocaleData(localeEsAr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),

    // Configurar español como idioma por defecto para toda la app
    { provide: LOCALE_ID, useValue: 'es-AR' },

    // Service Worker — se registra solo en producción
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};