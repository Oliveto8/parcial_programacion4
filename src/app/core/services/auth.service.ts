import { Injectable, signal, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { User, Session } from '@supabase/supabase-js';
import { Usuario } from '../models/usuario.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase = inject(SupabaseService).client;

  // Signals para manejar el estado de autenticación
  currentUser = signal<User | null>(null);
  currentSession = signal<Session | null>(null);

  // Signal con los datos del usuario de la tabla 'usuarios' (nombre, apellido, rol)
  // Se carga automáticamente al iniciar sesión
  currentUserData = signal<Usuario | null>(null);

  constructor() {
    this.initAuthSession();
  }

  // Inicializa la sesión y escucha cambios (login, logout, token refresh)
  private initAuthSession() {
    // Obtener sesión inicial
    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this.currentSession.set(session);
      this.currentUser.set(session?.user ?? null);
      // Si hay sesión activa, cargar datos del usuario desde la tabla 'usuarios'
      if (session?.user) {
        this.cargarDatosUsuario(session.user.id);
      }
    });

    // Escuchar cambios de estado en la autenticación
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.currentSession.set(session);
      this.currentUser.set(session?.user ?? null);
      if (session?.user) {
        this.cargarDatosUsuario(session.user.id);
      } else {
        this.currentUserData.set(null);
      }
    });
  }

  // En tu AuthService (auth.service.ts)
async cargarDatosUsuario(authId: string) {
  const { data, error } = await this.supabase
    .from('usuarios')
    .select('*')
    .eq('id', authId)
    .single();

  if (data) {
    // AQUÍ ES CLAVE: Actualizamos el signal con los datos de tu tabla 'usuarios' (incluyendo el rol)
    this.currentUserData.set(data);
  } else {
    console.error('Error al cargar datos del usuario desde la tabla usuarios:', error);
  }
}

  // Registrar un nuevo usuario (retorna una promesa con la respuesta de Supabase)
  async signUp(email: string, password: string, nombre : string, apellido : string) {
    return this.supabase.auth.signUp({ email, password,
      options:{
        data:{
          nombre: nombre,
          apellido:apellido
        }
      }
    });
  }

  // Iniciar sesión
  async signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  // Cerrar sesión
  async signOut() {
    return this.supabase.auth.signOut();
  }
}
