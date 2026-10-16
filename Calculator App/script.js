const display = document.getElementById("display");
const expression = document.getElementById("expression");
const buttons = document.querySelectorAll(".calc-btn");

let currentInput = "0";
let justCalculated = false;

// Update calculator display
function updateDisplay() {
    display.value = currentInput;
}

// Clear calculator
function clearCalculator() {
    currentInput = "0";
    expression.textContent = "";
    justCalculated = false;
    updateDisplay();
}

// Add numbers and operators
function appendValue(value) {
    if (justCalculated) {
        currentInput = "0";
        expression.textContent = "";
        justCalculated = false;
    }

    if ("+-*/".includes(value)) {
        if (currentInput === "Error") {
            currentInput = "0";
        }

        const last = currentInput.slice(-1);

        if ("+-*/".includes(last)) {
            currentInput = currentInput.slice(0, -1) + value;
        } else {
            currentInput += value;
        }

        updateDisplay();
        return;
    }

    if (currentInput === "Error") {
        currentInput = "0";
    }

    const parts = currentInput.split(/[+\-*/]/);
    const lastNumber = parts[parts.length - 1];

    // Prevent multiple decimal points in a number
    if (value === ".") {
        if (lastNumber.includes(".")) return;

        if (lastNumber === "") {
            currentInput += "0";
        }
    }

    // Replace initial zero
    if (currentInput === "0" && value !== ".") {
        currentInput = value;
    } else {
        currentInput += value;
    }

    updateDisplay();
}

// Calculate result
function calculate() {
    const input = currentInput;

    // Accept arithmetic characters only
    if (!/^[0-9+\-*/.()\s]+$/.test(input)) {
        currentInput = "Error";
        updateDisplay();
        return;
    }

    try {
        const result = Function(
            '"use strict"; return (' + input + ')'
        )();

        if (!Number.isFinite(result)) {
            throw new Error("Invalid calculation");
        }

        expression.textContent = input + " =";

        currentInput = String(
            Number.parseFloat(result.toPrecision(12))
        );

        justCalculated = true;
        updateDisplay();
    } catch {
        currentInput = "Error";
        updateDisplay();
    }
}

// Delete last character
function deleteLast() {
    if (justCalculated || currentInput === "Error") {
        clearCalculator();
        return;
    }

    currentInput = currentInput.slice(0, -1) || "0";
    updateDisplay();
}

// Toggle sign of the last number
function toggleSign() {
    if (currentInput === "Error") return;

    const match = currentInput.match(/(\d*\.?\d+)$/);

    if (!match) return;

    const number = match[0];
    const start = match.index;
    const before = currentInput.slice(0, start);

    if (
        before.endsWith("-") &&
        (before.length === 1 || "+-*/".includes(before.at(-2)))
    ) {
        currentInput = before.slice(0, -1) + number;
    } else {
        currentInput = before + "(-" + number + ")";
    }

    justCalculated = false;
    updateDisplay();
}

// Convert last number to a percentage
function percentage() {
    if (currentInput === "Error") return;

    const match = currentInput.match(/(\d*\.?\d+)$/);

    if (!match) return;

    const number = Number(match[0]) / 100;
    const start = match.index;

    currentInput =
        currentInput.slice(0, start) + String(number);

    justCalculated = false;
    updateDisplay();
}

// Handle button clicks
buttons.forEach(button => {
    button.addEventListener("click", () => {
        const value = button.dataset.value;
        const action = button.dataset.action;

        if (value !== undefined) {
            appendValue(value);
        } else if (action === "clear") {
            clearCalculator();
        } else if (action === "delete") {
            deleteLast();
        } else if (action === "sign") {
            toggleSign();
        } else if (action === "percent") {
            percentage();
        } else if (action === "calculate") {
            calculate();
        }
    });
});

// Keyboard support
document.addEventListener("keydown", event => {
    const key = event.key;

    if (/^[0-9.]$/.test(key)) {
        appendValue(key);
    } else if ("+-*/".includes(key)) {
        appendValue(key);
    } else if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculate();
    } else if (key === "Backspace") {
        deleteLast();
    } else if (key === "Escape") {
        clearCalculator();
    } else if (key === "%") {
        percentage();
    }
});

// Initialize calculator
updateDisplay();
