import { Component, computed, signal } from '@angular/core';

interface Contacto {
  id: number;
  nombre: string;
  telefono: string;
  email: string;
  grupo: string;
  favorito: boolean;
}

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  contactos = signal<Contacto[]>([]);
  busqueda = signal('');

  grupos = ['Todos', 'Clase', 'Familia', 'Trabajo'];
  grupoSeleccionado = signal('Todos');

  numFavoritos = computed(() =>
    this.contactos().filter(c => c.favorito).length
  );

  filtrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    const grupo = this.grupoSeleccionado();

    return this.contactos().filter(c => {
      const coincideNombre = c.nombre.toLowerCase().includes(texto);
      const coincideGrupo = grupo === 'Todos' || c.grupo === grupo;
      return coincideNombre && coincideGrupo;
    });
  });

  constructor() {
    this.cargar();
  }

  async cargar() {
    const respuesta = await fetch('/contactos.json');
    const datos: Contacto[] = await respuesta.json();

    const guardados = localStorage.getItem('miagenda_favoritos');
    if (guardados !== null) {
      const idsFavoritos: number[] = JSON.parse(guardados);
      const datosConFavoritos = datos.map(c => ({
        ...c,
        favorito: idsFavoritos.includes(c.id)
      }));
      this.contactos.set(datosConFavoritos);
    } else {
      this.contactos.set(datos);
    }
  }

  iniciales(nombre: string): string {
    return nombre
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(palabra => palabra[0].toUpperCase())
      .join('');
  }

  cambiarFavorito(id: number) {
    this.contactos.update(lista => {
      const nuevaLista = lista.map(c =>
        c.id === id ? { ...c, favorito: !c.favorito } : c
      );

      const idsFavoritos = nuevaLista
        .filter(c => c.favorito)
        .map(c => c.id);
      localStorage.setItem('miagenda_favoritos', JSON.stringify(idsFavoritos));

      return nuevaLista;
    });
  }
}
