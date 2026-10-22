# Sincronización Automática Continua con Google Sheets & Google Drive (SENA Inducción)

Sistema de persistencia reactiva y autoguardado desatendido para la plataforma de inducción SENA, que sincroniza automáticamente el progreso del aprendiz en Google Drive al aprobar estaciones y la evaluación final, sin requerir intervención manual ni reconfiguraciones continuas.

## User Review & Critical Decisions

> [!IMPORTANT]
> A continuación se resumen las decisiones acordadas para la automatización:

- **Momento de Sincronización Automática (Confirmado)**: El autoguardado en Google Sheets se disparará automáticamente al **aprobar cada módulo** y al **culminar con éxito la evaluación final** (emisión del certificado oficial).
- **Indicador de Estado Visual (Confirmado)**: Se integrará un **indicador discreto en la barra superior (`Header`)** que exhibe el estado en vivo (Sincronizando / Guardado en Drive a las HH:MM) y permite abrir la hoja con un solo clic.
- **Consentimiento Único de Autoguardado**: Al iniciar sesión con Google por primera vez, el usuario activa el modo de autoguardado continuo, eliminando los diálogos modales repetitivos (`window.confirm`) en cada módulo para garantizar una experiencia sin fricciones ni interrupciones.

---

## 1. Overview & Core Concept

### Qué hace la solución
Convierte la sincronización con Google Drive en un proceso transparente en segundo plano. Cuando el aprendiz interactúa con el prototipo:
1. Al completar un módulo (o al editar datos de perfil y superar el examen final), el sistema detecta el cambio de estado.
2. Si la cuenta de Google está vinculada, despacha una solicitud asíncrona no bloqueante a la API de Google Sheets.
3. Se actualiza o inserta la fila correspondiente en la hoja institucional de Drive (*"SENA - Registro Oficial de Inducción (Acuerdo 009 de 2024)"*).
4. El indicador en la barra superior se actualiza de manera discreta con la hora exacta del guardado.

### Audiencia y Beneficio
* **Aprendiz / Evaluador SENA**: Puede concentrarse 100% en superar los retos y dilemas éticos sin preocuparse por pulsar botones de guardado ni configurar tokens continuamente.
* **Instructores / Coordinación**: Tienen acceso inmediato y en tiempo real a las evidencias y certificados en la hoja de cálculo centralizada en Google Drive.

---

## 2. User Experience & Visual Design

### Flujo del Usuario
1. **Conexión Inicial Única**: Si aún no ha iniciado sesión, el header o modal muestra un acceso para conectar Google con un clic. La hoja oficial se crea o localiza automáticamente en Drive.
2. **Navegación Fluida**: El aprendiz avanza por las estaciones (Derechos, Deberes, Prohibiciones, etc.).
3. **Disparador Desatendido**: Al responder el quiz y obtener el puntaje aprobatorio, el sistema efectúa la sincronización en segundo plano sin interrumpir la celebración de confeti ni congelar la pantalla.
4. **Retroalimentación en Tiempo Real**:
   - Durante la sincronización: Ícono de Google Sheets con pulso verde sutil y texto: *"Guardando en Drive..."*.
   - Al completar: Texto discreto *"Guardado en Drive · 10:45 AM"* con enlace directo para abrir la hoja.
   - En caso de desconexión o fallo temporal: Estado *"Guardado localmente (Pendiente de sync)"* y reintento automático al recuperar conexión.

### Identidad Visual y Estilo
* **Alineación SENA**: Colores institucionales (`#39A900`, verde esmeralda y blanco/gris pizarra según el modo claro u oscuro).
* **Disciplina Anti-Slop**: Sin modales emergentes intrusivos que bloqueen el aprendizaje; uso de tipografía limpia (`Space Grotesk` y `Plus Jakarta Sans`) y micro-indicadores unboxed con separadores tipográficos sutiles.

---

## 3. Key Product Decisions & Trade-Offs

- **Disparo Reactivo Basado en Eventos vs. Polling Continuo**:
  - *Decisión elegida*: Disparar la sincronización inmediatamente tras eventos clave de aprendizaje (`handleModuleComplete` y `handleFinalExamSuccess`), con un debounce de seguridad (500 ms) para evitar ráfagas de llamadas a la cuota de la API de Google Sheets.
  - *Por qué*: Ahorra consumo de cuota de la API de Google y garantiza que solo se guarden hitos validados y consistentes.
- **Persistencia de Sesión y Reconexión Silenciosa**:
  - *Decisión elegida*: Utilizar el estado de sesión de Firebase Auth persistente (`onAuthStateChanged` / `initAuth`) para recuperar el token en memoria sin obligar al usuario a interactuar con el flujo de login en cada visita.
  - *Por qué*: Resuelve directamente el dolor expresado de "tener que hacer la configuración continuamente".
- **Cola de Reintentos en Segundo Plano (Offline Resilience)**:
  - *Decisión elegida*: Si el usuario realiza un avance sin conexión o con token temporalmente no disponible, el estado local almacena una bandera `needsSync: true`, que se sincroniza automáticamente en cuanto el servicio de Google esté disponible.

---

## 4. Technical Architecture & Data Strategy

### Diagrama de Arquitectura del Sistema

```
┌────────────────────────────────────────────────────────────────────────┐
│                        App.tsx (Flujo Principal)                      │
│                                                                        │
│  [Progreso Módulo] ───► handleModuleComplete() ──┐                     │
│  [Evaluación Final] ──► handleFinalExamSuccess() ┼─► triggerAutoSync() │
│  [Perfil Actualizado] ─► handleSaveProfile() ────┘         │           │
└────────────────────────────────────────────────────────────┼───────────┘
                                                             │
                                                             ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 AutoSyncManager (Servicio / Hook)                     │
│                                                                        │
│  1. Comprueba token de Google y hoja vinculada en Drive                │
│  2. Aplica debounce y encola el registro del aprendiz                  │
│  3. Notifica cambio de estado a Header: syncing | synced | error       │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   googleSheetsService.ts (API v4)                      │
│                                                                        │
│  - findOrCreateInductionSpreadsheet() (Localiza o crea en Drive)      │
│  - syncLearnerToSheet() (Upsert atómico por Documento + Ficha)         │
│  - Formato institucional SENA (Pestaña 'Aprendices Inducción')         │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│         Google Drive / Sheets (Cuenta del Usuario en Google)           │
│                                                                        │
│   Hoja: "SENA - Registro Oficial de Inducción (Acuerdo 009 de 2024)"   │
│   15 Columnas institucionales actualizadas en tiempo real               │
└────────────────────────────────────────────────────────────────────────┘
```

### Componentes y Entidades Involucradas

1. **`AutoSyncStatusIndicator` (en `Header.tsx`)**:
   - Muestra el estado actual del autoguardado:
     - 🟢 *Sincronizado en Drive (HH:MM)* + botón de acceso directo a la hoja.
     - 🟡 *Sincronizando cambios...* (ícono giratorio sutil).
     - ⚪ *Conectar Drive para autoguardado* (si aún no hay sesión activa).
2. **`useAutoSync` / `triggerAutoSync` (en `App.tsx` & `googleSheetsService.ts`)**:
   - Función centralizada que recibe `(learner, gameState)`.
   - Recupera el token activo en memoria desde `googleAuth.ts`.
   - Realiza la sincronización asíncrona de forma segura y actualiza el timestamp de última sincronización.
3. **Manejo de Permisos y Modales**:
   - `GoogleSheetsModal.tsx` se mantiene disponible como panel avanzado de consulta e historial de filas, pero ya no es un requisito obligatorio para que los datos viajen a Google Drive.

### Plan de Verificación
1. **Prueba de Aprobación de Módulo**: Superar una estación interactiva y constatar que el indicador superior pase a "Sincronizando..." y luego a "Guardado en Drive · [Hora]", reflejando los nuevos módulos completados en Google Sheets.
2. **Prueba de Evaluación Final**: Aprobar el examen final de 10 preguntas y constatar la actualización inmediata de la calificación, estado "APROBADO" y código del certificado en Google Sheets.
3. **Prueba de Persistencia**: Recargar la página y verificar que la vinculación se mantiene activa sin tener que volver a configurar ni pulsar botones adicionales.
