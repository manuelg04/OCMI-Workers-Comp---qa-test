# OCMI Workers Comp - Ingeniero de Automatización de QA

Esta prueba permite un enfoque práctico para evaluar las habilidades de automatización de pruebas de un candidato. La prueba está diseñada para completarse en 3-5 horas.

Se proporciona un servidor que ejecuta Express y una aplicación simple de React. Estas aplicaciones proporcionan la siguiente funcionalidad:

- Autenticación
- Operaciones CRUD para Posts
- Los usuarios pueden especificar su libro favorito usando la API de OpenLibrary

Serás responsable de escribir pruebas para verificar que estas funcionalidades funcionen como se espera. Ten en cuenta que **no rechazaremos una prueba incompleta**. Enviar lo que hayas completado es suficiente.

Intentamos mantener el proyecto lo más simple posible, pero si tienes alguna pregunta, no dudes en contactarnos.

- [Requisitos del Sistema](#requisitos-del-sistema)
- [Comenzando](#comenzando)
- [Requisitos de las Pruebas](#requisitos-de-las-pruebas)
- [Estructura del Repositorio](#estructura-del-repositorio)
- [Herramientas](#herramientas)
- [Ejemplos](#ejemplos)

## Requisitos del Sistema

- NodeJS 20.x o superior
- Yarn 4.x o superior
- Recomendamos un sistema basado en Unix (Linux, MacOS) para esta evaluación

Por simplicidad, usamos SQLite como base de datos. No necesitas instalar ningún software de base de datos. La aplicación automáticamente creará una base de datos SQLite en el archivo `database.sqlite` en la raíz del proyecto.

## Comenzando

1. Haz fork o clona este repositorio
2. Sube tu código a un repositorio público en GitHub
3. Envía un correo a [cristian@ocmiwc.com](mailto:cristian@ocmiwc.com) con el enlace a tu repositorio
4. Vuelve a tu proyecto e instala las dependencias usando `yarn`
5. Ejecuta las aplicaciones del servidor y cliente usando `npx nx run server:serve` y `npx nx run client:serve`
6. El servidor se ejecutará en `http://localhost:3000` y el cliente en `http://localhost:4200`
7. Puedes ejecutar pruebas usando `npx nx run <app>:test` o `npx nx run <app>-e2e:e2e`
8. Sube los cambios conforme avances, revisaremos tu progreso

Tienes hasta el **15 de noviembre** para enviar tu prueba. Revisaremos tu código y te daremos retroalimentación. La única fase adicional será una entrevista técnica con nuestro equipo.

**IMPORTANTE: Por favor, no asumas que rechazaremos una prueba incompleta. Buscamos calidad, no cantidad.**

## Uso de Inteligencia Artificial

Nos gusta que nuestras pruebas sean prácticas y realistas. Por lo tanto, **permitimos** el uso de herramientas de IA para ayudarte a escribir tus pruebas, ya que las utilizamos en nuestras operaciones diarias.

Sin embargo, esperamos que entiendas el código que estás escribiendo y no dependas únicamente de herramientas de IA para generar tus pruebas.

## Solución de Problemas

Si encuentras algún problema, no dudes en contactarnos. Estamos aquí para ayudarte a tener éxito.

## Requisitos de la Prueba

No queremos que esta prueba ocupe demasiado de tu tiempo, así que no buscamos una suite de pruebas exhaustiva. Escribe lo que creas necesario para asegurar que la funcionalidad esté funcionando como se espera.

Idealmente, tus pruebas deberían demostrar principalmente el conocimiento de cada concepto básico de pruebas, pero no escribas demasiadas pruebas solo por escribirlas.

Aquí hay algunos ejemplos de lo que podrías incluir:

- Pruebas Unitarias
- Pruebas de Integración
- Pruebas E2E (Automatización de Navegador para tu aplicación cliente)
- Mocking y Spying
- Gestión de Datos de Prueba

En cuanto a los requisitos:

- Envía lo que hayas completado, no te preocupes por terminar todo
- Intenta tomar menos de 5 horas para completar la prueba
- Debe estar escrito en TypeScript
- Debes incluir al menos **3** pruebas por aplicación
  - Pruebas Unitarias: 3 en servidor, 3 en cliente
  - Pruebas E2E: 3 en server-e2e, 3 en client-e2e
  - Cuantas más, mejor

## Estructura del Repositorio

El repositorio es un monorepo que contiene cuatro aplicaciones:

- server: Un servidor Express que proporciona una API para la aplicación React
- client: Una aplicación React que consume la API
- server-e2e: Pruebas E2E para el servidor (Vitest, misma sintaxis que Jest)
- client-e2e: Pruebas E2E para el cliente (Playwright, pero puedes usar cualquier otra herramienta)

## Herramientas

Las siguientes herramientas están disponibles, pero eres libre de usar cualquier otra herramienta con la que te sientas cómodo:

- Vitest (Para Pruebas Unitarias, igual que Jest)
- Playwright (Para Automatización de Navegador)
- Supertest (Para Pruebas de API)
- React Testing Library (Para Pruebas de Componentes React)
- Nx (Para Gestión de Monorepo)

En nuestras operaciones diarias, también utilizamos Nx como herramienta de monorepo para gestionar nuestros proyectos. Si no estás familiarizado con Nx, aquí están las notas principales:

### Ejecutando la API

- Servir: `npx nx run server:serve`
- Pruebas Unitarias: `npx nx run server:test`
- Pruebas E2E: `npx nx run server-e2e:e2e`

### Ejecutando la Aplicación React

- Servir: `npx nx run client:serve`
- Pruebas Unitarias: `npx nx run client:test`
- Pruebas E2E: `npx nx run client-e2e:e2e`

## Ejemplos

Encontrarás un ejemplo para cada tipo de prueba:

- Prueba Unitaria del Servidor: `apps/server/src/routes/auth.spec.ts`
- Prueba Unitaria del Cliente: `apps/client/src/pages/root.spec.tsx`
- Prueba E2E del Servidor: `apps/server-e2e/src/server/posts.e2e.ts`
- Prueba E2E del Cliente: `apps/client-e2e/src/client/posts.e2e.ts`

Puedes usar estos como guías sobre cómo usar las herramientas proporcionadas.
