import React from 'react';

/**
 * Componente Card: contenedor principal con fondo, sombra y padding.
 * @param {{ children: React.ReactNode, className?: string }} props
 */
export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-white shadow-md rounded-lg p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Componente CardContent: sección interna con margen superior.
 * @param {{ children: React.ReactNode, className?: string }} props
 */
export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`mt-2 ${className}`} {...props}>
      {children}
    </div>
  );
}
