import asyncHandler from 'express-async-handler';
import { getRecommendations } from '../utils/recommendation.js';

const getRecommendation = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const recommendations = await getRecommendations(userId);
        res.status(200).json(recommendations);
    } catch(error){
        res.status(500).json({message: error.message});
    }
})

export { getRecommendation }