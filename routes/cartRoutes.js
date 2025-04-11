const express = require("express");
const router = express.Router();
const {verify} = require("../auth");
const cartController = require("../controllers/cartController");

router.get('/',verify,cartController.getCart);
router.post('/add-to-cart',verify,cartController.addToCart);
router.post('/update-quantity',verify,cartController.updateQuantity);
router.put('/clear-cart',verify,cartController.clearCart);
router.patch('/:productId/remove-from-cart',verify,cartController.removeFromCart);

module.exports = router;