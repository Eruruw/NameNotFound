// Listens for if the button submit is click, and then will run this code
document.getElementById("paymentForm").addEventListener("submit", function(event) {
    event.preventDefault(); 

    // Grabs the name, card number, experation date, and cvv
    const cardholderName = document.getElementById("name").value;
    const cardNumber = document.getElementById("cardNumber").value;
    const expiry = document.getElementById("expiry").value;
    const cvv = document.getElementById("cvv").value;

    // Create an object that will hold all of the payment information given
    const paymentInfo = {
        cardholderName,
        cardNumber,
        expiry,
        cvv
    };

    // Keeps a record of the previous payments
    const existingPayments = JSON.parse(localStorage.getItem("payments")) || [];

    // Add the new payment info to the array
    existingPayments.push(paymentInfo);

    // Save the updated array to local storage
    localStorage.setItem("payments", JSON.stringify(existingPayments));

    // Logs the payment information to the console (for demonstration purposes)
    console.log("Payment Information Stored:", paymentInfo); 

    // Could redirect to the thank you page
    window.location.href = "thankyou.html";

    // Listens to see if the return button is clicked and will then go to the app page
    document.getElementById("returnButton").addEventListener("click", function() {
        window.location.href = "index.html";
    });
});
