// Interface que mapea la tabla 'libros' de Supabase
// Los nombres usan snake_case para coincidir con las columnas de la DB

export interface Pelicula {
  id: string;
  titulo: string;
  portada_url: string;
  duracion_minutos: number;
  restriccion_edad: string;
  generos: string[];
  activa: boolean;
  sinopsis?: string;
  fecha_estreno?: string;// Ej: '2026-05-12'
  formato?: string[]; // O simplemente string
}