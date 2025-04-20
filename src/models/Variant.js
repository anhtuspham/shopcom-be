import mongoose from "mongoose";

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

const Variant = mongoose.model("Variant", variantSchema);

export default Variant;