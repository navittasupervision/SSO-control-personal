# Control de Personal SSO

Aplicación web para el control diario de personal de construcción en obra,
con dos roles:

- **Administrador**: gestiona empresas, monitores SSO, catálogo de puestos,
  colores de la app, ve el dashboard con gráficas y descarga reportes en PDF.
- **Monitor SSO**: ingresa con usuario + PIN y captura el personal del día
  para las empresas que se le asignaron.

Construida con **Next.js**, **Firebase** (Firestore + Authentication) y
**Tailwind CSS**. No requiere plan de pago de Firebase (funciona en el plan
gratuito Spark).

---

## 1. Crear el proyecto en Firebase

1. Ve a [console.firebase.google.com](https://console.firebase.google.com) y crea un proyecto nuevo.
2. En **Build > Authentication**, pestaña **Sign-in method**, habilita el proveedor **Correo electrónico/contraseña**.
3. En **Build > Firestore Database**, crea la base de datos (modo producción, elige la región más cercana, ej. `us-central` o `southamerica-east1`).
4. En **Configuración del proyecto > Tus apps**, agrega una app **Web** (ícono `</>`) y copia el objeto `firebaseConfig` que te muestra.

## 2. Configurar las variables de entorno

1. Copia `.env.local.example` como `.env.local`.
2. Rellena cada variable con los valores que copiaste de Firebase:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_SETUP_KEY=elige-una-clave-temporal-segura
```

`.env.local` nunca se sube a GitHub (ya está en `.gitignore`).

## 3. Desplegar las reglas de seguridad de Firestore

1. Abre **Firestore Database > Reglas** en la consola de Firebase.
2. Copia y pega el contenido completo de [`firebase/firestore.rules`](./firebase/firestore.rules).
3. Publica.

## 4. Crear el documento de arranque (bootstrap)

Las reglas de seguridad solo permiten crear el primer administrador mientras
exista esta "puerta" abierta:

1. En **Firestore Database > Datos**, crea manualmente la colección `settings`.
2. Dentro, crea el documento con ID `bootstrap`.
3. Agrega el campo `adminExists` de tipo **boolean** con valor `false`.

## 5. Instalar dependencias y ejecutar en local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Te redirigirá a `/login`,
donde verás un enlace para crear el primer administrador.

## 6. Crear el primer administrador

1. Ve a `http://localhost:3000/setup-inicial`.
2. Ingresa la **clave de configuración** (la que pusiste en `NEXT_PUBLIC_SETUP_KEY`), tu nombre y un PIN de 4 a 6 dígitos.
3. Al crear el administrador, el campo `adminExists` se marca automáticamente como `true` y la página de arranque queda inutilizada (por seguridad). Si necesitas crear otro admin más adelante, hazlo desde **Monitores SSO** ya logueado.

## 7. Uso diario

- **Administrador**: inicia sesión, ve a **Empresas** y agrega las empresas/subcontratistas. Luego en **Catálogo de puestos**, presiona "Cargar catálogo sugerido" para precargar los puestos típicos de construcción (puedes editarlos después). Luego en **Monitores SSO**, crea un usuario por cada Monitor SSO, asígnale un PIN y las empresas que le corresponde supervisar.
- **Monitor SSO**: en la pantalla de login, toca su nombre, ingresa su PIN y queda en **Captura diaria**, donde registra el personal de la empresa asignada (nombre, puesto, estado: presente/ausente/permiso/incapacidad/otro).
- **Reportes**: el administrador filtra por empresa y rango de fechas en **Reportes**, revisa la tabla y descarga el PDF con el botón "Generar PDF".
- **Configuración**: el administrador puede cambiar el nombre de la app y los 5 colores principales; se guardan en Firestore y se aplican para todos los usuarios.

## 8. Desplegar a producción

La forma más simple es con **Vercel** (gratis para este tipo de proyecto):

1. Sube este proyecto a tu repositorio de GitHub (ver sección siguiente).
2. Ve a [vercel.com](https://vercel.com), conecta tu cuenta de GitHub e importa el repositorio `SSO-control-personal`.
3. En la configuración del proyecto en Vercel, agrega las mismas variables de entorno del paso 2 (Settings > Environment Variables).
4. Despliega. Vercel te dará una URL pública (ej. `sso-control-personal.vercel.app`).

También puedes usar **Firebase Hosting** si lo prefieres (`firebase init hosting`, `next build && next export`* o usando el adaptador de Next para Firebase), pero Vercel es más directo para un proyecto Next.js.

## 9. Subir el proyecto a tu repositorio de GitHub

Ver instrucciones en el chat donde se entregó este proyecto, o ejecuta desde la carpeta del proyecto:

```bash
git init
git remote add origin https://github.com/navittasupervision/SSO-control-personal.git
git add .
git commit -m "Primera versión: control de personal SSO"
git branch -M main
git push -u origin main
```

---

## Estructura del proyecto

```
lib/            Lógica de datos y utilidades (Firebase, PDF, catálogo, etc.)
context/        Contextos de React (sesión y tema)
components/     Componentes de UI reutilizables y gráficas
pages/           Rutas de Next.js (login, dashboard, captura, etc.)
firebase/        Reglas de seguridad de Firestore
styles/          Estilos globales (Tailwind)
```

## Notas de seguridad

- Los PIN nunca se guardan en texto plano en Firestore: se usan como
  contraseña dentro de Firebase Authentication, que los cifra.
- Cambia o elimina el valor de `NEXT_PUBLIC_SETUP_KEY` después de crear el
  primer administrador, ya que la página `/setup-inicial` queda visible
  (aunque inutilizable una vez `adminExists` es `true`).
- Si necesitas eliminar por completo la cuenta de acceso de un monitor
  (no solo su perfil), hazlo también desde **Authentication** en la consola
  de Firebase.
