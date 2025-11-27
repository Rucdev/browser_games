// app/calculator/components/Display.tsx
import React from 'react';
import styles from '../styles/Calculator.module.css';

interface DisplayProps {
    value: string;
}

export const Display: React.FC<DisplayProps> = ({ value }) => {
    return (
        <div className={styles.display}>
            {value}
        </div>
    );
};
