// app/calculator/components/Calculator.tsx
'use client';

import React from 'react';
import { Display } from './Display';
import { Keypad } from './Keypad';
import { useCalculator } from '../hooks/useCalculator';
import styles from '../styles/Calculator.module.css';

export const Calculator: React.FC = () => {
    const {
        displayValue,
        inputDigit,
        inputDecimal,
        clear,
        performOperation,
        handleEquals,
    } = useCalculator();

    return (
        <div className={styles.calculator}>
            <Display value={displayValue} />
            <Keypad
                onDigit={inputDigit}
                onOperator={performOperation as any}
                onClear={clear}
                onEquals={handleEquals}
                onDecimal={inputDecimal}
            />
        </div>
    );
};
