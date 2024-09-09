// Function to calculate and display amount per person
function updateAmountPerPerson() {
    const totalBill = parseFloat(document.getElementById('total-bill').value.trim());
    const phoneNumbers = document.querySelectorAll('.phone-number').length;
    
    if (totalBill > 0 && phoneNumbers > 0) {
        const roundedAmount = Math.ceil(totalBill);
        const amountPerPerson = Math.ceil(roundedAmount / phoneNumbers);
        document.getElementById('amount-per-person').textContent = amountPerPerson;
    } else {
        document.getElementById('amount-per-person').textContent = '0';
    }
}

// Add event listener to update amount per person when the total bill or phone numbers change
document.getElementById('total-bill').addEventListener('input', updateAmountPerPerson);

// Adds one new phone input field
document.getElementById('add-phone').addEventListener('click', () => {
    const phoneInputs = document.getElementById('phone-inputs');
    const newInput = document.createElement('div');
    newInput.className = 'phone-input';
    newInput.innerHTML = '<input type="text" class="phone-number" placeholder="Enter phone number" required /><button type="button" class="remove-button">Remove</button>';
    phoneInputs.appendChild(newInput);
    updateAmountPerPerson();
});

// Remove phone input field
document.getElementById('phone-inputs').addEventListener('click', (event) => {
    if (event.target.classList.contains('remove-button')) {
        const phoneInput = event.target.closest('.phone-input');
        phoneInput.remove();
        updateAmountPerPerson();
    }
});

document.getElementById('submit').addEventListener('click', () => {
    const tillNumber = document.getElementById('till-number').value.trim();
    const totalBill = document.getElementById('total-bill').value.trim();
    const phoneNumbers = Array.from(document.querySelectorAll('.phone-number'))
        .map(input => input.value.trim())
        .filter(value => value.length > 0);

    if (!tillNumber) {
        alert('Please enter the till number.');
        return;
    }

    if (!totalBill || isNaN(totalBill) || totalBill <= 0) {
        alert('Please enter a valid total bill amount.');
        return;
    }

    if (phoneNumbers.length === 0) {
        alert('Please enter at least one phone number.');
        return;
    }

    // Perform rounding of total bill
    const roundedAmount = Math.ceil(parseFloat(totalBill));

    fetch('/api/mpesa-prompt', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            tillNumber,
            phoneNumbers,
            amount: roundedAmount
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Payment prompts sent successfully.');
        } else {
            alert('Failed to send payment prompts.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error sending payment prompts.');
    });
});
