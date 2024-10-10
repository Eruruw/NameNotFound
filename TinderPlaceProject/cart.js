function loadCartItems() {

    // Retrieve cart items from localStorage, or use an empty array if nothing is found
    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    
    // Get the element where cart items will be displayed
    const cartItemsElement = document.getElementById("cartItems");

    // Clear any existing content in the cart items element
    cartItemsElement.innerHTML = '';

    // If the cart is empty, display a message
    if (cartItems.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent = "Your cart is empty.";
        emptyMessage.style.color = "white";
        cartItemsElement.appendChild(emptyMessage);
        return;
    }

    // Loop through each cart item
    cartItems.forEach((item, index) => {

        // Create a container for each cart item
        const cartItemElement = document.createElement("div");
        cartItemElement.className = "cartItem";
        cartItemElement.style.color = "white";

        // Create an image element for the cart item
        const imageElement = document.createElement("img");
        imageElement.src = item;
        imageElement.alt = `Item ${index + 1}`;

        // Create a delete button for the cart item
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete Item";
        deleteButton.style.color = "black";
        deleteButton.onclick = () => removeItem(index);

        // Append the image and delete button to the cart item container
        cartItemsElement.appendChild(cartItemElement);
        cartItemElement.appendChild(imageElement);
        cartItemElement.appendChild(deleteButton);
    });
}

function removeItem(index) {
    // Retrieve cart items from localStorage
    let cartItems = JSON.parse(localStorage.getItem("cart")) || [];

    // Remove the selected item by its index
    cartItems.splice(index, 1);

    // Update localStorage with the new cart after removal
    localStorage.setItem("cart", JSON.stringify(cartItems));

    // Reload the cart items to reflect changes
    loadCartItems();
}