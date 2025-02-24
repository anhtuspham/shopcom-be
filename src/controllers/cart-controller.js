import asyncHandler from 'express-async-handler';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// add product to cart
const addProductToCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    const product = await Product.findById(productId);
    if (!product) {
        return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    const cart = await Cart.findOne({ userId });
    if(!cart){
        const newCart = new Cart({
            userId,
            products: [{ productId, quantity}],
            totalPrice: product.price * quantity
        })
    }
});

export {
    addProductToCart
}