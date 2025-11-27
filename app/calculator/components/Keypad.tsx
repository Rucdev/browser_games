// app/calculator/components/Keypad.tsx
import React from 'react';
import { Button } from './Button';
import styles from '../styles/Calculator.module.css';

interface KeypadProps {
    onDigit: (digit: string) => void;
    onOperator: (op: string) => void;
    onClear: () => void;
    onEquals: () => void;
    onDecimal: () => void;
}

export const Keypad: React.FC<KeypadProps> = ({
    onDigit,
    onOperator,
    onClear,
    onEquals,
    onDecimal,
}) => {
    return (
        <div className={styles.keypad}>
            <Button label="AC" onClick={onClear} type="clear" />
            <Button label="+/-" onClick={() => { }} type="operator" />
            <Button label="%" onClick={() => { }} type="operator" />
            <Button label="/" onClick={() => onOperator('/')} type="operator" />

            <Button label="7" onClick={() => onDigit('7')} />
            <Button label="8" onClick={() => onDigit('8')} />
            <Button label="9" onClick={() => onDigit('9')} />
            <Button label="×" onClick={() => onOperator('*')} type="operator" />

            <Button label="4" onClick={() => onDigit('4')} />
            <Button label="5" onClick={() => onDigit('5')} />
            <Button label="6" onClick={() => onDigit('6')} />
            <Button label="-" onClick={() => onOperator('-')} type="operator" />

            <Button label="1" onClick={() => onDigit('1')} />
            <Button label="2" onClick={() => onDigit('2')} />
            <Button label="3" onClick={() => onDigit('3')} />
            <Button label="+" onClick={() => onOperator('+')} type="operator" />

            <Button label="0" onClick={() => onDigit('0')} className={styles.buttonZero} />
            <Button label="." onClick={onDecimal} />
            <Button label="=" onClick={onEquals} type="equals" />
        </div>
    );
};
