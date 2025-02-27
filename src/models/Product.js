import mongoose, { mongo } from "mongoose";

const variantSchema = new mongoose.Schema({
    images: [{
        type: String,
    }],
    color: String,
    ram: String,
    rom: String,
    price: {type: String, required: true},
    quantity: {type: Number, required: true, min: 0, max: 100, default: 0},
})

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Laptop', 'Smartphone', 'Tablet', 'Headphone']
    },
    brand: {
        type: String,
        required: true,
        trim: true
    },
    variants: [variantSchema],
    defaultVariant: {
        type: Number,
        default: 0
    },
    ratings: { 
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);

export default Product;