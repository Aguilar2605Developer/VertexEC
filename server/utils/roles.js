const roleCatalog = [
  {
    key: 'user',
    label: 'Cliente',
    description: 'Solicita cotizaciones, revisa propuestas y recibe la entrega final.',
    responsibilities: [
      'Enviar solicitudes de cotización',
      'Aprobar o rechazar propuestas',
      'Revisar entregables finales'
    ]
  },
  {
    key: 'admin',
    label: 'Administrador',
    description: 'Gestión del sistema, usuarios y permisos corporativos.',
    responsibilities: [
      'Gestionar usuarios',
      'Supervisar el flujo de cotizaciones',
      'Configurar parámetros del sistema'
    ]
  },
  {
    key: 'project_manager',
    label: 'Gerente de Proyecto / Coordinador General',
    description: 'Lidera procesos, coordina equipos, define plazos, revisa calidad y entrega final de la cotización.',
    responsibilities: [
      'Coordinar el equipo de trabajo',
      'Definir cronogramas y plazos',
      'Revisar calidad y entregar cotización final'
    ]
  },
  {
    key: 'architect',
    label: 'Arquitecto',
    description: 'Revisión y definición de planos arquitectónicos, especificaciones, alcances y memoria descriptiva.',
    responsibilities: [
      'Definir planos arquitectónicos',
      'Establecer especificaciones técnicas',
      'Desarrollar memoria descriptiva'
    ]
  },
  {
    key: 'structural_engineer',
    label: 'Ingeniero Estructural',
    description: 'Realiza cálculos estructurales, memorias de cálculo y costos relacionados.',
    responsibilities: [
      'Cálculos estructurales',
      'Generar memorias de cálculo',
      'Presupuestar costos estructurales'
    ]
  },
  {
    key: 'installations_engineer',
    label: 'Ingeniero de Instalaciones',
    description: 'Diseña y presupone instalaciones eléctricas, sanitarias y mecánicas.',
    responsibilities: [
      'Diseñar instalaciones eléctricas',
      'Diseñar instalaciones sanitarias',
      'Diseñar instalaciones mecánicas'
    ]
  },
  {
    key: 'estimator',
    label: 'Estimador / Presupuestador',
    description: 'Realiza metrados, análisis unitario (APU), precios de mercado y hoja de presupuesto.',
    responsibilities: [
      'Realizar metrados completos',
      'Calcular análisis unitario de precios',
      'Elaborar hoja de presupuesto'
    ]
  },
  {
    key: 'drafter',
    label: 'Dibujante / Modelador (CAD o BIM)',
    description: 'Produce y corrige planos, modelos y documentación técnica.',
    responsibilities: [
      'Producir planos técnicos',
      'Modelar en CAD o BIM',
      'Corregir planos según revisiones'
    ]
  },
  {
    key: 'technical_reviewer',
    label: 'Revisor / Director Técnico',
    description: 'Revisión final de la cotización antes de enviarla al cliente.',
    responsibilities: [
      'Revisar alcance y costos',
      'Validar documentación técnica',
      'Autorizar el envío al cliente'
    ]
  }
];

const roleMap = roleCatalog.reduce((map, role) => {
  map[role.key] = role;
  return map;
}, {});

module.exports = { roleCatalog, roleMap };