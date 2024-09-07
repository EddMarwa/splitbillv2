document.addEventListener('DOMContentLoaded', () => {
    const billForm = document.getElementById('bill-form');
    const billList = document.getElementById('bills');

    billForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const billName = document.getElementById('bill-name').value;
        const billAmount = document.getElementById('bill-amount').value;

        const listItem = document.createElement('li');
        listItem.textContent = `${billName}: KSH ${billAmount}`;
        billList.appendChild(listItem);

        billForm.reset();
    });
});
