# Backend – BFF (.NET)

## Descripción
Este proyecto corresponde al backend de la prueba técnica y actúa como un **Backend for Frontend (BFF)**.

Su responsabilidad es consumir la API pública de Rick and Morty, organizara la información y exponer un contrato limpio y estable al frontend, evitando que el cliente consuma APIs externas directamente.

Backend:
- Centraliza el consumo de la API externa
- Resuelve los personajes asociados a cada episodio
- Expone endpoints pensados exclusivamente para el frontend
- Maneja errores de forma centralizada mediante middleware

---

## Requisitos
- .NET 8 SDK
- Acceso a Internet

---

Frontend:
- Consumir exclusivamente el backend (BFF)
- Renderizar episodios y personajes
- Manejar filtros y paginación
- Gestionar estados de carga y error

## Configuración
### appsettings.json
```json
{
  "RickAndMortyApi": {
    "BaseUrl": "https://rickandmortyapi.com/api"
  }
}
```

### environment.ts
```json
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5121/'
};
```

## Ejecución
### Desde la carpeta backend:
#### Comandos
- dotnet restore
- dotnet run

#### La API quedará disponible en:
- https://localhost:5151

#### Swagger (solo en ambiente de desarrollo):
- https://localhost:5151/swagger

### Desde la carpeta frontend:
#### Comandos:
- ng serve

#### La aplicación quedará disponible en:
- http://localhost:4200
