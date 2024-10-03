function loadCartItems() {
    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    const cartItemsElement = document.getElementById("cartItems");

    cartItemsElement.innerHTML = '';

    if (cartItems.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent = "Your cart is empty.";
        emptyMessage.style.color = "white";
        cartItemsElement.appendChild(emptyMessage);
        return;
    }

    cartItems.forEach((item, index) => {
        const cartItemElement = document.createElement("div");
        cartItemElement.className = "cartItem";
        cartItemElement.style.color = "white";

        const imageElement = document.createElement("img");
        imageElement.src = item;
        imageElement.alt = "Item ${index + 1}";

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete Item";
        deleteButton.style.color = "black";
        deleteButton.onclick = () => removeItem(index);

        cartItemsElement.appendChild(cartItemElement);
        cartItemElement.appendChild(imageElement);
        cartItemElement.appendChild(deleteButton);
    });
}

function removeItem(index) {
    let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    cartItems.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cartItems));
    loadCartItems();
}

function removeAllItems() {
    console.log("Remove All button clicked");
    localStorage.removeItem("cart");
    loadCartItems();
}

const removeAllItemsButton = document.getElementById("removeAll")

removeAllItemsButton.addEventListener("click", removeAllItems);

window.onload = loadCartItems;