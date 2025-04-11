const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const bcrypt = require("bcryptjs");

module.exports.getCart = (req, res) => {

    return Cart.findOne({userId: req.user.id })
    .then((cart) => res.status(200).send({ cart }))
    .catch(err => res.status(500).send({ error: 'Internal Server Error' }))

}

module.exports.addToCart = (req, res) => {

    const { productId, quantity, subtotal } = req.body;

    // Check if the user already has a cart, if not, create one
    return Cart.findOne({userId: req.user.id })
    .then((cart) => {

        if (!cart) {
            cart = new Cart({
                userId:req.user.id,
                cartItems: [],
                totalPrice: 0,
            });
        }

        // Check if the product is already in the cart
        const existingCartItemIndex = cart.cartItems.findIndex(
            (item) => item.productId === productId
        );

        if (existingCartItemIndex !== -1) {
            // If the product is already in the cart, update the quantity and subtotal
            cart.cartItems[existingCartItemIndex].quantity += quantity;
            cart.cartItems[existingCartItemIndex].subtotal += subtotal;
        } else {
            // If the product is not in the cart, add it
            cart.cartItems.push({
                productId,
                quantity,
                subtotal,
            });
        }

        // Update the total price
        cart.totalPrice += subtotal;

        // Save the updated cart
        return cart.save()
        .then(updatedCart => res.status(201).send({ 
            message: 'Item added to cart successfully', 
            cart: updatedCart 
        }))
        .catch((error) => {
            res.status(500).json({ error: 'Internal Server Error' });
        });
    })
    .catch((error) => {
        res.status(500).send({ error: 'Internal Server Error' });
    });

}

module.exports.removeFromCart = (req, res) => {

    const productId = req.params.productId;

    // Check if the user already has a cart, if not, create one
    return Cart.findOne({userId: req.user.id })
    .then((cart) => {

        if (!cart) {
            return res.status(404).send({ message: 'Cart not found' });
        }

        // Find the index of the item to remove based on productId
        const itemIndex = cart.cartItems.findIndex(
            (item) => item.productId === productId
        );

        if (itemIndex === -1) {
            return res.status(404).send({ message: 'Item not found in cart' });
        }

        // Get the item's subtotal to subtract from the total price
        const itemSubtotal = cart.cartItems[itemIndex].subtotal;

        // Remove the item from the cart
        cart.cartItems.splice(itemIndex, 1);

        // Update the total price by subtracting the item's subtotal
        cart.totalPrice -= itemSubtotal;
        // Save the updated cart
        return cart.save()
        .then(updatedCart => res.status(200).send({ 
            message: 'Item removed from cart successfully', 
            updatedCart: updatedCart 
        }))
        .catch((error) => {
            res.status(500).json({ error: 'Internal Server Error' });
        });
    })
    .catch((error) => {
        res.status(500).json({ error: 'Internal Server Error' });
    });

}

module.exports.updateQuantity = (req, res) => {

    const { productId, newQuantity } = req.body;

        // Find the user's cart
    return Cart.findOne({ userId: req.user.id })
            .then((cart) => {
                if (!cart) {
                    return res.status(404).send({ message: 'Cart not found' });
                }

                // Find the index of the item to update based on productId
                const itemIndex = cart.cartItems.findIndex(
                    (item) => item.productId === productId
                );

                if (itemIndex === -1) {
                    return res.status(404).json({ message: 'Item not found in cart' });
                }

                // Get the current quantity and item's price
                const currentQuantity = cart.cartItems[itemIndex].quantity;
                const itemPrice = cart.cartItems[itemIndex].subtotal / currentQuantity;

                // Update the quantity
                cart.cartItems[itemIndex].quantity = newQuantity;

                // Recalculate the subtotal and total price
                cart.cartItems[itemIndex].subtotal = itemPrice * newQuantity;
                cart.totalPrice = cart.cartItems.reduce(
                    (total, item) => total + item.subtotal,
                    0
                );

                // Save the updated cart
                return cart.save()
                .then(updatedCart => res.status(200).send({ 
                    message: 'Item quantity updated successfully', 
                    updatedCart: updatedCart 
                }))
                .catch((error) => {
                    res.status(500).json({ error: 'Internal Server Error' });
                });

            })
            .catch((error) => {
                res.status(500).json({ error: 'Internal Server Error' });
            });
};

module.exports.clearCart = (req, res) => {
    
    const userId = req.user.id;

    // Find the user's cart
    Cart.findOne({ userId })
        .then((cart) => {
            if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }

            // Clear all items from the cart
            cart.cartItems = [];
            cart.totalPrice = 0;

            // Save the updated cart
            return cart.save()
            .then(updatedCart => res.status(200).send({ 
                message: 'Cart cleared successfully', 
                cart: updatedCart 
            }))
            .catch((error) => {
                res.status(500).json({ error: 'Internal Server Error' });
            });
        })
        .catch((error) => {
            res.status(500).json({ error: 'Internal Server Error' });
        });
}