# 💰 Presupuesto Personal

Una aplicación de presupuesto personal desarrollada con React que te permite controlar tus gastos en tiempo real.

## Características

- ✅ **Gestión de Presupuesto**: Configura tu presupuesto total
- ✅ **Seguimiento de Gastos**: Agrega y elimina gastos fácilmente
- ✅ **Múltiples Monedas**: Soporte para USD y Peso Dominicano (DOP)
- ✅ **Gráfico en Tiempo Real**: Visualización con gráfico de pastel con colores indicativos
- ✅ **Alertas Visuales**: 
  - 🟢 Verde: Presupuesto saludable (< 70% gastado)
  - 🟡 Amarillo: Precaución (70-90% gastado)
  - 🔴 Rojo: Límite alcanzado (> 90% gastado)
- ✅ **Persistencia Local**: Los datos se guardan automáticamente en localStorage
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
├── components/          # Componentes React
│   ├── BudgetForm.js   # Formulario de presupuesto
│   ├── ExpenseForm.js  # Formulario de gastos
│   ├── ExpenseList.js  # Lista de gastos
│   ├── BudgetSummary.js # Resumen del presupuesto
│   └── BudgetChart.js  # Gráfico de pastel
├── services/           # Lógica de negocio
│   ├── StorageService.js # Manejo de localStorage
│   └── BudgetService.js  # Lógica del presupuesto
├── utils/              # Utilidades
│   └── CurrencyFormatter.js # Formateo de monedas
├── App.js              # Componente principal
├── index.js            # Punto de entrada
└── index.css           # Estilos globales
```

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

## Dependencias

- **React 18**: Framework principal
- **Recharts**: Para los gráficos de pastel
- **React Scripts**: Herramientas de desarrollo

## Migración a Mobile

La aplicación está preparada para migración a React Native:

- Componentes modulares y reutilizables
- Lógica de negocio separada de la UI
- Servicios independientes de la plataforma
- Diseño responsivo como base

## Funcionalidades Futuras

- 📊 Más tipos de gráficos
- 📅 Filtros por fecha
- 🏷️ Categorías de gastos
- 📱 Aplicación móvil nativa
- ☁️ Sincronización en la nube
