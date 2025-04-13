import mongoose, { mongo } from "mongoose";

const variantSchema = new mongoose.Schema({
    images: [{
        type: String,
    }],
    color: String,
    ram: String,
    rom: String,
    price: {type: Number, required: true},
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
        type: variantSchema,
        default: undefined,
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

productSchema.pre('save', function (next) {
    if (this.isModified('variants')) {
        this.defaultVariant = this.variants[0];
    }
    next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;