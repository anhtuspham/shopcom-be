import tf from '@tensorflow/tfjs';
import UserAction from '../models/UserAction.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import path from 'path';
import fs from 'fs/promises';
const MODEL_PATH = path.join(process.cwd(), 'src', 'data');

// Lấy ma trận user-product
async function getUserProductMatrix() {
  try {
    const actions = await UserAction.find().lean();
    const users = await User.find().lean();
    const products = await Product.find().lean();

    const userIds = users.map(u => u._id.toString());
    const productIds = products.map(p => p._id.toString());

    const matrix = Array(userIds.length).fill().map(() => Array(productIds.length).fill(0));

    actions.forEach(action => {
      const userIndex = userIds.indexOf(action.userId.toString());
      const productIndex = productIds.indexOf(action.productId.toString());
      if (userIndex !== -1 && productIndex !== -1) {
        matrix[userIndex][productIndex] = action.totalScore;
      }
    });

    return { matrix, userIds, productIds };
  } catch (error) {
    console.error('Error in getUserProductMatrix:', error);
    throw error;
  }
}

// Huấn luyện và lưu mô hình
export async function trainAndSaveModel() {
  try {
    const { matrix, userIds, productIds } = await getUserProductMatrix();
    const ratings = tf.tensor2d(matrix);

    const numUsers = userIds.length;
    const numProducts = productIds.length;
    const latentFactors = 10;

    const userEmbedding = tf.variable(tf.randomNormal([numUsers, latentFactors]));
    const productEmbedding = tf.variable(tf.randomNormal([numProducts, latentFactors]));

    function predict() {
      return tf.matMul(userEmbedding, productEmbedding.transpose());
    }

    function loss(pred, actual) {
      return tf.losses.meanSquaredError(actual, pred);
    }

    const optimizer = tf.train.adam(0.1);
    for (let i = 0; i < 50; i++) {
      optimizer.minimize(() => loss(predict(), ratings));
    }

    const userEmbeddingData = userEmbedding.dataSync();
    const productEmbeddingData = productEmbedding.dataSync();
    await fs.mkdir(MODEL_PATH, { recursive: true });
    await fs.writeFile(`${MODEL_PATH}/user-embedding.json`, JSON.stringify(Array.from(userEmbeddingData)));
    await fs.writeFile(`${MODEL_PATH}/product-embedding.json`, JSON.stringify(Array.from(productEmbeddingData)));
    await fs.writeFile(`${MODEL_PATH}/userIds.json`, JSON.stringify(userIds));
    await fs.writeFile(`${MODEL_PATH}/productIds.json`, JSON.stringify(productIds));

    return { userEmbedding, productEmbedding, userIds, productIds };
  } catch (error) {
    console.error('Error in trainAndSaveModel:', error);
    throw error;
  }
}

// Tải mô hình đã lưu
export async function loadModel() {
  try {
    const userIds = JSON.parse(await fs.readFile(`${MODEL_PATH}/userIds.json`));
    const productIds = JSON.parse(await fs.readFile(`${MODEL_PATH}/productIds.json`));
    const userEmbeddingData = JSON.parse(await fs.readFile(`${MODEL_PATH}/user-embedding.json`));
    const productEmbeddingData = JSON.parse(await fs.readFile(`${MODEL_PATH}/product-embedding.json`));

    const numUsers = userIds.length;
    const numProducts = productIds.length;
    const latentFactors = 10;

    const userEmbedding = tf.variable(tf.tensor2d(userEmbeddingData, [numUsers, latentFactors]));
    const productEmbedding = tf.variable(tf.tensor2d(productEmbeddingData, [numProducts, latentFactors]));

    return { userEmbedding, productEmbedding, userIds, productIds };
  } catch (error) {
    console.log('No saved model found, training new model...', error);
    return await trainAndSaveModel();
  }
}

export async function decayScores() {
  try {
    const actions = await UserAction.find();
    const now = new Date();
    for (const action of actions) {
      action.actions = action.actions.map(a => {
        const daysOld = (now - a.timestamp) / (1000 * 60 * 60 * 24);
        a.score = a.score * Math.exp(-0.05 * daysOld);
        return a;
      });
      action.totalScore = action.actions.reduce((sum, a) => sum + a.score, 0);
      await action.save();
    }
  } catch (error) {
    console.error('Error in decayScores:', error);
    throw error;
  }
}

// Dự đoán sản phẩm đề xuất
export async function getRecommendations(userId) {
  try {
    const { userEmbedding, productEmbedding, userIds, productIds } = await loadModel();
    const userIndex = userIds.indexOf(userId.toString());

    if (userIndex === -1) {
      const products = await Product.find().sort({ 'ratings.average': -1 }).limit(10);
      return products.map(p => ({ productId: p._id, name: p.name, score: p.ratings.average }));
    }

    const predictions = tf.matMul(userEmbedding.slice([userIndex, 0], [1, -1]), productEmbedding.transpose());
    const scores = predictions.dataSync();

    const recommendations = productIds.map((productId, index) => ({
      productId,
      score: scores[index],
    })).sort((a, b) => b.score - a.score).slice(0, 10);

    const maxScore = Math.max(...recommendations.map(r => r.score));
    const normalizedRecommendations = recommendations.map(r => ({
      productId: r.productId,
      score: maxScore ? r.score / maxScore : r.score,
    }));

    const productDetails = await Product.find({ _id: { $in: normalizedRecommendations.map(r => r.productId) } });
    return normalizedRecommendations.map(r => {
      const product = productDetails.find(p => p._id.toString() === r.productId);
      return { _id: r.productId, name: product.name, brand: product.brand, defaultVariant: product.defaultVariant, ratings: product.ratings, score: r.score };
    });
  } catch (error) {
    console.error('Error in getRecommendations:', error);
    throw error;
  }
}