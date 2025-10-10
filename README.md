# 💰 Presupuesto e Inversiones

Una aplicación completa de gestión financiera personal desarrollada con React que te permite controlar tus gastos y gestionar tus inversiones a largo plazo.

## 🎯 Características Principales

### Módulo de Presupuesto
- ✅ **Gestión de Múltiples Presupuestos**: Crea y administra varios presupuestos
- ✅ **Seguimiento de Gastos en Tiempo Real**: Agrega y elimina gastos fácilmente
- ✅ **Múltiples Monedas**: Soporte para USD y Peso Dominicano (RD$)
- ✅ **Gráfico de Pastel Interactivo**: Visualización con colores indicativos
- ✅ **Alertas Visuales**: 
  - 🟢 Verde: Presupuesto saludable (< 70% gastado)
  - 🟡 Amarillo: Precaución (70-90% gastado)
  - 🔴 Rojo: Límite alcanzado (> 90% gastado)
- ✅ **Historial Completo**: Ve todos tus presupuestos con fechas

### Módulo de Inversiones 📈
- ✅ **Portafolios Múltiples**: Gestiona inversiones en eToro y Hapi
- ✅ **Distribución Automática**: Reparte aportes según porcentajes configurados
- ✅ **Proyecciones a 10 Años**: Visualiza el crecimiento con 3 escenarios (7%, 8%, 9%)
- ✅ **Cálculo de Dividendos**: Estima ingresos pasivos mensuales y anuales
- ✅ **Gráficos Interactivos**: Proyecciones con Recharts
- ✅ **Alertas de Milestones**: Notificaciones al alcanzar metas de inversión
- ✅ **Exportar a Excel**: Genera reportes completos con todas tus inversiones
- ✅ **Backup en JSON**: Crea copias de seguridad de todos tus datos

### Almacenamiento y Datos
- ✅ **IndexedDB**: Base de datos local robusta (hasta 50MB+)
- ✅ **Migración Automática**: Convierte datos de localStorage a IndexedDB
- ✅ **Exportar/Importar**: Respaldo completo en JSON y Excel
- ✅ **Persistencia Garantizada**: Los datos no se pierden al cerrar el navegador
- ✅ **Diseño Responsivo**: Compatible con dispositivos móviles

## Arquitectura

La aplicación sigue los principios SOLID y Clean Code:

- **Single Responsibility**: Cada componente y servicio tiene una responsabilidad específica
- **Open/Closed**: Fácil extensión sin modificar código existente
- **Liskov Substitution**: Los servicios pueden ser intercambiados
- **Interface Segregation**: Interfaces específicas y enfocadas
- **Dependency Inversion**: Dependencias inyectadas, no hardcodeadas

### Estructura del Proyecto

```
src/
├── components/                  # Componentes React
│   ├── Navigation.js           # Navegación entre módulos
│   ├── BudgetForm.js           # Formulario de presupuesto
│   ├── BudgetSelector.js       # Selector de presupuestos
│   ├── ExpenseForm.js          # Formulario de gastos
│   ├── ExpenseList.js          # Lista de gastos
│   ├── BudgetSummary.js        # Resumen del presupuesto
│   ├── BudgetChart.js          # Gráfico de pastel
│   ├── InvestmentDashboard.js  # Dashboard de inversiones
│   ├── InvestmentSummary.js    # Resumen de inversiones
│   ├── PortfolioCard.js        # Tarjeta de portafolio
│   ├── ContributionForm.js     # Formulario de aportes
│   └── ProjectionChart.js      # Gráfico de proyecciones
├── services/                    # Lógica de negocio
│   ├── DatabaseService.js      # Manejo de IndexedDB
│   ├── StorageService.js       # Manejo de localStorage (legacy)
│   ├── BudgetService.js        # Lógica del presupuesto (legacy)
│   ├── BudgetServiceDB.js      # Lógica del presupuesto con DB
│   ├── InvestmentService.js    # Lógica de inversiones
│   └── ExportService.js        # Exportar/Importar datos
├── utils/                       # Utilidades
│   └── CurrencyFormatter.js    # Formateo de monedas
├── App.js                       # Componente principal
├── index.js                     # Punto de entrada
└── index.css                    # Estilos globales
```

## 📊 Configuración de Portafolios

La aplicación viene preconfigurada con tu estrategia de inversión:

### eToro (50% del aporte total)
- **SPY** (50%): S&P 500 ETF
- **QQQ** (25%): Nasdaq 100 ETF
- **VXUS** (15%): Mercados Internacionales
- **BND** (10%): Bonos del Tesoro USA

### Hapi (50% del aporte total)
- **AMZN** (20%): Amazon
- **GOOGL** (20%): Alphabet/Google
- **MSFT** (15%): Microsoft
- **AAPL** (10%): Apple
- **O** (10%): Realty Income (REIT)
- **STAG** (10%): STAG Industrial (REIT)
- **VICI** (10%): VICI Properties (REIT)
- **BTCUSD** (5%): Bitcoin

## Instalación y Uso

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Ejecutar la aplicación**:
   ```bash
   npm start
   ```

3. **Abrir en el navegador**:
   La aplicación se abrirá automáticamente en `http://localhost:3000`

## 📦 Dependencias

- **React 18**: Framework principal
- **Recharts**: Gráficos interactivos (pastel y líneas)
- **idb**: Wrapper para IndexedDB
- **xlsx**: Exportación a Excel
- **React Scripts**: Herramientas de desarrollo

## 🚀 Uso de la Aplicación

### Módulo de Presupuesto
1. Crea un nuevo presupuesto con nombre, monto y moneda
2. Agrega gastos con descripción y monto
3. Visualiza en tiempo real el estado de tu presupuesto
4. Cambia entre múltiples presupuestos
5. Exporta tus datos cuando lo necesites

### Módulo de Inversiones
1. **Agregar Aporte**: 
   - Usa "Distribución Automática" para dividir automáticamente entre eToro (50%) y Hapi (50%)
   - O usa "Aporte Manual" para invertir en un portafolio específico
2. **Ver Proyecciones**: Haz clic en "Ver Proyecciones" en cualquier portafolio
3. **Exportar Datos**: 
   - "Exportar a Excel": Genera un reporte completo con todas las hojas
   - "Crear Backup": Descarga un archivo JSON con todos tus datos

### Exportar/Importar Datos
- **Backup JSON**: Archivo completo con presupuestos e inversiones
- **Excel**: Reportes con múltiples hojas (Resumen, Portafolios, Proyecciones, etc.)
- Los archivos se descargan automáticamente con fecha

## 📱 Migración a Mobile

La aplicación está preparada para migración a React Native:

- Componentes modulares y reutilizables
- Lógica de negocio separada de la UI
- Servicios independientes de la plataforma
- IndexedDB puede migrarse a AsyncStorage o SQLite
- Diseño responsivo como base

## 🔮 Funcionalidades Futuras

- 📊 Más tipos de gráficos y análisis
- 📅 Filtros por fecha y período
- 🏷️ Categorías de gastos e inversiones
- 📱 Aplicación móvil nativa (React Native)
- ☁️ Sincronización en la nube
- 🔔 Notificaciones push para alertas
- 📧 Reportes automáticos por email
- 🤖 Recomendaciones con IA

## 🛡️ Seguridad y Privacidad

- ✅ Todos los datos se almacenan **localmente** en tu navegador
- ✅ No se envía información a servidores externos
- ✅ Tú controlas tus backups y exportaciones
- ✅ Compatible con modo incógnito (datos temporales)

## 📝 Notas Importantes

- Los datos de inversiones son **proyecciones estimadas** basadas en rendimientos históricos
- Las tasas de retorno (7%, 8%, 9%) son promedios y pueden variar
- Los dividendos son estimaciones basadas en yields actuales
- Siempre consulta con un asesor financiero para decisiones importantes

## 🤝 Contribuir

Este proyecto sigue principios SOLID y Clean Code. Si deseas contribuir:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de uso personal. Todos los derechos reservados.
