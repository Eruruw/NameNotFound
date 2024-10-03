// File paths for each image
const imagePaths = [
    "ItemsToBuy/image1.jpg",
    "ItemsToBuy/image2.jpg",
    "ItemsToBuy/image3.jpg",
    "ItemsToBuy/image4.jpg",
    "ItemsToBuy/image5.jpg",
]

let cart = [];

let index = 0;

function getImage() {
    const imageElement = document.getElementById("itemImage");
    imageElement.src = imagePaths[index];
}

function Like() {
    const currentItem = imagePaths[index];

    if(!cart.includes(currentItem)) {
        cart.push(imagePaths[index]);
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    
    index++;
    if(index >= imagePaths.length) {
        index = 0;
    }
    
    console.log("Added to cart");
    getImage();
}

function Dislike() {
    index++;
    if(index >= imagePaths.length) {
        index = 0;
    }
    console.log("Not Added to cart");
    getImage();
}

document.getElementById("likeBTN").addEventListener("click", Like);
document.getElementById("dislikeBTN").addEventListener("click", Dislike);

getImage();