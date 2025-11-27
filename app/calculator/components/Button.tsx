// app/calculator/components/Button.tsx
import React from 'react';
import styles from '../styles/Calculator.module.css';
import { soundManager } from '../utils/sound';

interface ButtonProps {
    label: string;
    onClick: () => void;
    type?: 'digit' | 'operator' | 'clear' | 'equals';
    className?: string;
}

export const Button: React.FC<ButtonProps> = ({ label, onClick, type = 'digit', className }) => {
    const handleClick = () => {
        soundManager.play(type);
        onClick();
    };

    let buttonClass = styles.button;
    if (type === 'operator') buttonClass += ` ${styles.buttonOperator}`;
    if (type === 'clear') buttonClass += ` ${styles.buttonClear}`;
    if (type === 'equals') buttonClass += ` ${styles.buttonEquals}`;
    if (className) buttonClass += ` ${className}`;

    return (
        <button className={buttonClass} onClick={handleClick}>
            {label}
        </button>
    );
};
