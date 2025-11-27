// app/calculator/page.tsx
import React from 'react';
import { Calculator } from './components/Calculator';
import styles from './styles/Calculator.module.css';

export default function CalculatorPage() {
    return (
        <div className={styles.container}>
            <Calculator />
        </div>
    );
}
