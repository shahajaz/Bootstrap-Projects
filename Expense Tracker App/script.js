const form = document.getElementById("expenseForm");
const transactionList = document.getElementById("transactionList");
const filter = document.getElementById("filter");

const STORAGE_KEY = "expenseTrackerData";

function loadTransactions() {
    try {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

        if (!Array.isArray(data)) return [];

        return data.filter(t =>
            t &&
            typeof t.id === "string" &&
            typeof t.title === "string" &&
            Number.isFinite(t.amount) &&
            t.amount > 0 &&
            ["income", "expense"].includes(t.type) &&
            typeof t.category === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(t.date)
        );
    } catch {
        return [];
    }
}

let transactions = loadTransactions();

const formatMoney = amount =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR"
    }).format(amount);

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function saveTransactions() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
        return true;
    } catch {
        alert("Unable to save data in browser storage.");
        return false;
    }
}

function updateSummary() {
    const income = transactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

    document.getElementById("income").textContent = formatMoney(income);
    document.getElementById("expense").textContent = formatMoney(expense);
    document.getElementById("balance").textContent =
        formatMoney(income - expense);
}

function renderTransactions() {
    const selectedFilter = filter.value;

    const filtered = transactions
        .filter(t => selectedFilter === "all" || t.type === selectedFilter)
        .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

    if (!filtered.length) {
        transactionList.innerHTML = `
            <p class="text-muted text-center py-4">
                No transactions found.
            </p>`;
        return;
    }

    transactionList.innerHTML = filtered.map(t => `
        <div class="custom-transaction">
            <div>
                <h6 class="mb-1">${escapeHTML(t.title)}</h6>
                <small class="text-muted">
                    ${escapeHTML(t.category)} · ${escapeHTML(t.date)}
                </small>
            </div>

            <div class="d-flex align-items-center gap-3">
                <span class="transaction-amount ${
                    t.type === "income" ? "income-text" : "expense-text"
                }">
                    ${t.type === "income" ? "+" : "-"}${formatMoney(t.amount)}
                </span>

                <button
                    class="btn btn-outline-danger btn-sm custom-delete-btn"
                    data-id="${escapeHTML(t.id)}"
                    aria-label="Delete ${escapeHTML(t.title)}">
                    Delete
                </button>
            </div>
        </div>
    `).join("");
}

form.addEventListener("submit", event => {
    event.preventDefault();

    const title = document.getElementById("title").value.trim();
    const amount = Number(document.getElementById("amount").value);
    const type = document.getElementById("type").value;
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;

    const today = new Date();
    const todayString = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    if (
        !title ||
        title.length > 100 ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        amount > 1000000000000 ||
        !["income", "expense"].includes(type) ||
        !date ||
        date > todayString ||
        !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
        alert("Please enter valid transaction details.");
        return;
    }

    const transaction = {
        id: crypto.randomUUID(),
        title,
        amount: Math.round(amount * 100) / 100,
        type,
        category,
        date
    };

    transactions.push(transaction);

    if (!saveTransactions()) {
        transactions.pop();
        return;
    }

    form.reset();
    document.getElementById("date").value = todayString;

    updateSummary();
    renderTransactions();
});

transactionList.addEventListener("click", event => {
    const button = event.target.closest(".custom-delete-btn");
    if (!button) return;

    const previous = transactions;
    transactions = transactions.filter(t => t.id !== button.dataset.id);

    if (!saveTransactions()) {
        transactions = previous;
        return;
    }

    updateSummary();
    renderTransactions();
});

filter.addEventListener("change", renderTransactions);

const now = new Date();
document.getElementById("date").value = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
].join("-");
document.getElementById("date").max =
    document.getElementById("date").value;

updateSummary();
renderTransactions();