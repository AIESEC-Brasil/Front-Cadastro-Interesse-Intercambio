"use client";

import React from 'react';
import styles from './style.module.css';

interface LoadSpinnerProps {
  aberta: boolean;
  message?: string;
}
  import type { LoadSpinnerProps } from '../../type/components';

/** Bloqueia a interação durante operações assíncronas de envio. */
export default function LoadSpinner({ aberta, message = 'Carregando...' }: LoadSpinnerProps) {
  if (!aberta) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.containerModal}>
        {/* Spinner */}
        <div className={styles.spinner}></div>
        
        {/* Texto com efeito de onda mapeando cada letra */}
        <div className={styles.textoOnda}>
          {message.split('').map((letra, index) => (
            <span
              key={index}
              className={`${letra === ' ' ? styles.espaco : styles.letra}`}
              style={{
                animationDelay: `${index * 0.08}s`,
              }}
            >
              {letra === ' ' ? '\u00A0' : letra}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}