document.addEventListener("DOMContentLoaded", () => {
    const billForm = document.getElementById("bill-form");
    const phoneNumbersContainer = document.getElementById("phone-numbers-container");
    const addPhoneButton = document.getElementById("add-phone");
    const resultDiv = document.getElementById("result");

    // Add a new phone number input field when "+ Add Phone Number" is clicked
    addPhoneButton.addEventListener("click", () => {
        const newPhoneNumberInput = document.createElement("input");
        newPhoneNumberInput.type = "tel";
        newPhoneNumberInput.classList.add("phone-number");
        newPhoneNumberInput.placeholder = "Enter phone number";
        phoneNumbersContainer.appendChild(newPhoneNumberInput);
    });

    // Handle form submission and calculate bill splitting
    billForm.addEventListener("submit", (event) => {
        event.preventDefault();

        // Get the total bill amount
        const totalAmount = document.getElementById("total-amount").value;

        // Get all the phone numbers
        const phoneNumbers = Array.from(document.querySelectorAll(".phone-number")).map(input => input.value);

        // Calculate the bill per person and round it up to the nearest whole number
        const billPerPerson = Math.ceil(totalAmount / phoneNumbers.length);

        // Display the result
        resultDiv.innerHTML = `
            <p>Total Bill: KSH ${totalAmount}</p>
            <p>Each person needs to pay: KSH ${billPerPerson}</p>
            <button id="prompt-payment">Prompt Payment</button>
        `;

        // Add event listener for "Prompt Payment" button
        const promptPaymentButton = document.getElementById("prompt-payment");
        promptPaymentButton.addEventListener("click", () => {
            sendPaymentPrompts(phoneNumbers, billPerPerson);
        });
    });

    // Function to send payment prompts (placeholder for actual M-Pesa integration)
    function sendPaymentPrompts(phoneNumbers, billPerPerson) {
        alert(`Prompting payment of KSH ${billPerPerson} to the following numbers:\n${phoneNumbers.join(", ")}`);
        // Placeholder for actual M-Pesa API logic
    }
});
// Send payment prompt requests to the backend
function sendPaymentPrompts(phoneNumbers, billPerPerson) {
    fetch('/prompt-payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            phoneNumbers: phoneNumbers,
            amount: billPerPerson
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Payment prompts sent successfully!');
        } else {
            alert('Payment prompt failed!');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('There was an error sending the payment prompts.');
    });
}
