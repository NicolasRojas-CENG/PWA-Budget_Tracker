let db;
const request = indexedDB.open('budget-tracker', 1);

//Function used for upgrading versions.
request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

//When connection is successful.
request.onsuccess = function(event) {
    db = event.target.result;
    if (navigator.onLine) {
        uploadTransaction();
    }
};

//Error handling.
request.onerror = function(event) {
    console.log(event.target.errorCode);
};

//Function used to save data.
function saveRecord(record) {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const  budgetObjectStore = transaction.objectStore('new_transaction');
    budgetObjectStore.add(record);
}

//Function used to send data saved while offline to the database.
function uploadTransaction() {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('new_transaction');
    const getAll = budgetObjectStore.getAll();
    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                const transaction = db.transaction(['new_transaction'], 'readwrite');
                const budgetObjectStore = transaction.objectStore('new_transaction');
                budgetObjectStore.clear();
                alert('All saved transactions has been submitted!');
            })
            .catch(err => {
                console.log(err);
            });
        }
    }
}

//Listen for when the connection is up again.
window.addEventListener('online', uploadTransaction);