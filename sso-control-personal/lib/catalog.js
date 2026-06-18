// Catálogo base de puestos de personal de construcción.
// El administrador puede agregar/editar/eliminar puestos desde
// Configuración > Catálogo de puestos. Esta lista solo sirve como
// semilla inicial para precargar la base de datos la primera vez.

export const PUESTOS_CATALOGO = [
  // Personal técnico y administrativo
  { nombre: 'Ingeniero', categoria: 'Técnico y Administrativo' },
  { nombre: 'Arquitecto', categoria: 'Técnico y Administrativo' },
  { nombre: 'Supervisor', categoria: 'Técnico y Administrativo' },
  { nombre: 'Técnico', categoria: 'Técnico y Administrativo' },
  { nombre: 'Topógrafo', categoria: 'Técnico y Administrativo' },
  { nombre: 'Laboratorista', categoria: 'Técnico y Administrativo' },
  { nombre: 'Monitor SSO', categoria: 'Técnico y Administrativo' },
  { nombre: 'Administrativo', categoria: 'Técnico y Administrativo' },
  { nombre: 'Planillero', categoria: 'Técnico y Administrativo' },
  { nombre: 'Bodeguero', categoria: 'Técnico y Administrativo' },

  // Obra civil y acabados
  { nombre: 'Maestro de Obra', categoria: 'Obra Civil y Acabados' },
  { nombre: 'Caporal', categoria: 'Obra Civil y Acabados' },
  { nombre: 'Albañil', categoria: 'Obra Civil y Acabados' },
  { nombre: 'Ayudante', categoria: 'Obra Civil y Acabados' },
  { nombre: 'Carpintero', categoria: 'Obra Civil y Acabados' },
  { nombre: 'Armador', categoria: 'Obra Civil y Acabados' },
  { nombre: 'Pintor', categoria: 'Obra Civil y Acabados' },
  { nombre: 'Tablayesero', categoria: 'Obra Civil y Acabados' },
  { nombre: 'Ventanero', categoria: 'Obra Civil y Acabados' },

  // Especialidades
  { nombre: 'Electricista', categoria: 'Especialidades' },
  { nombre: 'Plomero', categoria: 'Especialidades' },
  { nombre: 'Soldador', categoria: 'Especialidades' },
  { nombre: 'Instalador', categoria: 'Especialidades' },
  { nombre: 'Técnico de Redes y Datos', categoria: 'Especialidades' },
  { nombre: 'Mecánico', categoria: 'Especialidades' },
  { nombre: 'Electromecánico', categoria: 'Especialidades' },

  // Estructuras metálicas
  { nombre: 'Montajista de Estructura Metálica', categoria: 'Estructuras Metálicas' },
  { nombre: 'Armador de Estructura Metálica', categoria: 'Estructuras Metálicas' },
  { nombre: 'Soldador Estructural', categoria: 'Estructuras Metálicas' },

  // Topografía y control de calidad
  { nombre: 'Auxiliar de Topografía', categoria: 'Topografía y Control de Calidad' },
  { nombre: 'Nivelador', categoria: 'Topografía y Control de Calidad' },
  { nombre: 'Laboratorista de Suelos', categoria: 'Topografía y Control de Calidad' },

  // Operadores
  { nombre: 'Operador de Maquinaria', categoria: 'Operadores' },
  { nombre: 'Operador de Excavadora', categoria: 'Operadores' },
  { nombre: 'Operador de Retroexcavadora', categoria: 'Operadores' },
  { nombre: 'Operador de Cargador', categoria: 'Operadores' },
  { nombre: 'Operador de Motoniveladora', categoria: 'Operadores' },
  { nombre: 'Operador de Rodo', categoria: 'Operadores' },
  { nombre: 'Operador de Montacargas', categoria: 'Operadores' },
  { nombre: 'Operador de Manlift', categoria: 'Operadores' },
  { nombre: 'Operador de Grúa', categoria: 'Operadores' },

  // Transporte y logística
  { nombre: 'Piloto', categoria: 'Transporte y Logística' },
  { nombre: 'Piloto de Pipa de Agua', categoria: 'Transporte y Logística' },
  { nombre: 'Piloto de Camión', categoria: 'Transporte y Logística' },
  { nombre: 'Ayudante de Piloto', categoria: 'Transporte y Logística' },

  // Servicios generales
  { nombre: 'Guardia de Seguridad', categoria: 'Servicios Generales' },
  { nombre: 'Personal de Limpieza', categoria: 'Servicios Generales' },

  // Otros
  { nombre: 'Otro', categoria: 'Otros' },
];

export const ESPECIALIDADES_EMPRESA = [
  'Obra Civil',
  'Electricidad',
  'Plomería',
  'Redes y Datos',
  'Estructuras Metálicas',
  'Movimiento de Tierras',
  'Topografía',
  'Laboratorio de Suelos',
  'Ventanería',
  'Tablayeso',
  'HVAC',
  'Seguridad',
  'Transporte',
  'Otro',
];

export const ESTADOS_PERSONAL = [
  { valor: 'presente', etiqueta: 'Presente', color: 'success' },
  { valor: 'ausente', etiqueta: 'Ausente', color: 'danger' },
  { valor: 'permiso', etiqueta: 'Permiso', color: 'warning' },
  { valor: 'incapacidad', etiqueta: 'Incapacidad', color: 'warning' },
  { valor: 'otro', etiqueta: 'Otro', color: 'primary' },
];
