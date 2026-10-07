import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { PeliculaService } from '../../core/services/pelicula.service';
import { Pelicula } from '../../core/models/pelicula.interface';

@Component({
  selector: 'app-add-pelicula',
  imports: [ReactiveFormsModule],
  templateUrl: './add-pelicula.html',
  styleUrl: './add-pelicula.css'
})
export class AddPelicula {
  private peliculaService = inject(PeliculaService);
  private router = inject(Router);

  listaGenerosDisponibles = ['Acción', 'Comedia', 'Drama', 'Ciencia Ficción', 'Terror', 'Aventura', 'Romance', 'Animación', 'Suspenso'];
  formatosDisponibles = ['2D', '3D', 'IMAX', '4DX'];
  restriccionesEdad = ['ATP', '+13', '+16', '+18'];

  peliculaForm = new FormGroup({
    titulo: new FormControl('', [Validators.required, Validators.minLength(2)]),
    sinopsis: new FormControl('', [Validators.required, Validators.minLength(10)]),
    duracion_minutos: new FormControl<number | null>(null, [Validators.required, Validators.min(30)]),
    portada_url: new FormControl('', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]),
    
    // Aquí definimos los controles como arrays de strings
    generos: new FormControl<string[]>([], [Validators.required]),
    restriccion_edad: new FormControl('ATP', [Validators.required]),
    activa: new FormControl(true, [Validators.required]),
    fecha_estreno: new FormControl('', [Validators.required]),
    formato: new FormControl<string[]>([], [Validators.required])
  });

  get f() {
    return this.peliculaForm.controls;
  }

  // Método auxiliar para manejar el marcado y desmarcado de los checkboxes
  onCheckboxChange(event: any, controlName: 'generos' | 'formato'): void {
    const valorActual = this.peliculaForm.get(controlName)?.value as string[] || [];
    const targetValue = event.target.value;

    if (event.target.checked) {
      // Si lo marca, lo agregamos al array
      this.peliculaForm.get(controlName)?.setValue([...valorActual, targetValue]);
    } else {
      // Si lo desmarca, lo filtramos y lo sacamos del array
      this.peliculaForm.get(controlName)?.setValue(valorActual.filter(item => item !== targetValue));
    }
    
    this.peliculaForm.get(controlName)?.markAsTouched();
  }

  async onSubmit(): Promise<void> {
    this.peliculaForm.markAllAsTouched();

    if (this.peliculaForm.invalid) {
      alert('⚠️ Por favor completa todos los campos obligatorios y selecciona al menos un género y formato.');
      return;
    }

    const formValue = this.peliculaForm.getRawValue();

    // Como ya son arrays de strings limpios, se pasan directamente
    const nuevaPelicula: Omit<Pelicula, 'id'> = {
      titulo: formValue.titulo!,
      sinopsis: formValue.sinopsis!,
      duracion_minutos: formValue.duracion_minutos!,
      portada_url: formValue.portada_url!,
      generos: formValue.generos!,          // Ej: ['Acción', 'Drama']
      restriccion_edad: formValue.restriccion_edad!,
      activa: formValue.activa!,
      fecha_estreno: formValue.fecha_estreno!,
      formato: formValue.formato!           // Ej: ['2D', 'IMAX']
    };

    const exito = await this.peliculaService.agregarPelicula(nuevaPelicula);

    if (exito) {
      alert(`🎬 Película "${formValue.titulo}" agregada exitosamente a la cartelera!`);
      this.router.navigate(['/home']);
    } else {
      alert('❌ Error al agregar la película. Revisa la consola para más detalles.');
    }
  }
}