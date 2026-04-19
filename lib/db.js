export let transactions = [];

export function getTransactions() {
  return transactions;
}

export function addTransaction(data) {
  transactions.push({ id: Date.now(), ...data });
}

export function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
}