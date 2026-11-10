# Mi Billetera Lite

PWA para registrar gastos diarios sin depender de la conexión. Los datos se guardan en el navegador con IndexedDB, la interfaz se sirve desde caché mediante un Service Worker y la aplicación puede instalarse en móvil y escritorio.

## Funcionalidad

- Registro de gastos con concepto, monto y categoría.
- Total acumulado con desglose por categoría.
- Historial agrupado por día, del más reciente al más antiguo, con búsqueda y filtro por categoría.
- Eliminación con opción de deshacer.
- Funciona completamente en modo avión una vez cargada.

## Estructura

```
index.html        App Shell
manifest.json     Metadatos de instalación
sw.js             Service Worker (Cache First, Network Fallback)
css/styles.css
js/app.js         Estado, eventos y filtros
js/store.js       Acceso a IndexedDB
js/view.js        Render del resumen y el historial
js/categories.js  Catálogo de categorías
js/format.js      Formato de moneda, porcentajes y fechas
js/toast.js       Aviso con acción de deshacer
fonts/            IBM Plex (SIL Open Font License)
icons/
```

## Desarrollo local

El Service Worker requiere HTTPS o `localhost`:

```bash
npx serve .
```

Al modificar archivos del App Shell hay que incrementar la versión de `CACHE` en `sw.js` para que los clientes descarguen la nueva versión.

## Despliegue

Sitio estático sin build. Se publica directamente desde la raíz del repositorio.
