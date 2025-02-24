import asyncHandler from 'express-async-handler';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// add product to cart
const addProductToCart = asyncHandler(async (req, res) => {
    const { productId, variantIndex, quantity } = req.body;
    
    const userId = req.user._id;

    const product = await Product.findById(productId);
    if (!product) {
        return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    if(!product.variants[variantIndex]){
        return res.status(400).json({message: "Biến thể không tồn tại"});
    }

    const variant = product.variants[variantIndex];

    let cart = await Cart.findOne({ userId });
    if(!cart){
        cart = new Cart({
            userId,
            products: [{ productId, variantIndex, price: variant.price, quantity}],
            totalPrice: variant.price * quantity
        })
    } else {        
        const productIndex = cart.products.findIndex(
            (p) => p.productId.toString() === productId && p.variantIndex === parseInt(variantIndex)
        );
        
        if(productIndex !== -1){
            cart.products[productIndex].quantity += parseInt(quantity);
        } else {
            cart.products.push({ productId, variantIndex, price: variant.price, quantity})
        }
    };

    cart.totalPrice = cart.products.reduce((sum, product) => sum + product.quantity * product.price, 0);

    await cart.save();
    res.status(200).json({message: "Thêm sản phẩm vào giỏ hàng thành công", cart});
});

export {
    addProductToCart
}