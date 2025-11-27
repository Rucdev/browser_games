// app/calculator/hooks/useCalculator.ts
import { useState, useCallback } from 'react';

type Operator = '+' | '-' | '*' | '/' | null;

export const useCalculator = () => {
    const [displayValue, setDisplayValue] = useState('0');
    const [firstOperand, setFirstOperand] = useState<number | null>(null);
    const [operator, setOperator] = useState<Operator>(null);
    const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);

    const inputDigit = useCallback((digit: string) => {
        if (waitingForSecondOperand) {
            setDisplayValue(digit);
            setWaitingForSecondOperand(false);
        } else {
            setDisplayValue(displayValue === '0' ? digit : displayValue + digit);
        }
    }, [displayValue, waitingForSecondOperand]);

    const inputDecimal = useCallback(() => {
        if (waitingForSecondOperand) {
            setDisplayValue('0.');
            setWaitingForSecondOperand(false);
            return;
        }

        if (!displayValue.includes('.')) {
            setDisplayValue(displayValue + '.');
        }
    }, [displayValue, waitingForSecondOperand]);

    const clear = useCallback(() => {
        setDisplayValue('0');
        setFirstOperand(null);
        setOperator(null);
        setWaitingForSecondOperand(false);
    }, []);

    const performOperation = useCallback((nextOperator: Operator) => {
        const inputValue = parseFloat(displayValue);

        if (firstOperand === null) {
            setFirstOperand(inputValue);
        } else if (operator) {
            const currentValue = firstOperand || 0;
            const newValue = calculate(currentValue, inputValue, operator);

            setDisplayValue(String(newValue));
            setFirstOperand(newValue);
        }

        setWaitingForSecondOperand(true);
        setOperator(nextOperator);
    }, [displayValue, firstOperand, operator]);

    const calculate = (first: number, second: number, op: Operator): number => {
        switch (op) {
            case '+': return first + second;
            case '-': return first - second;
            case '*': return first * second;
            case '/': return first / second;
            default: return second;
        }
    };

    const handleEquals = useCallback(() => {
        if (!operator || firstOperand === null) return;

        const inputValue = parseFloat(displayValue);
        const result = calculate(firstOperand, inputValue, operator);

        setDisplayValue(String(result));
        setFirstOperand(null);
        setOperator(null);
        setWaitingForSecondOperand(true);
    }, [displayValue, firstOperand, operator]);

    return {
        displayValue,
        inputDigit,
        inputDecimal,
        clear,
        performOperation,
        handleEquals,
        operator // Exposed for UI highlighting
    };
};
