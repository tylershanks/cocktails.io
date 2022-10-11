import mongoose from "mongoose";

const recipeSchema = mongoose.Schema({
    creator: String,
    drinkName: String,
    counts: [Number],
    units: [String],
    ingredients: [String],
    garnishes: [String],
    steps: [String],
    glass: String,
    likes: {
        type: [String],
        default: []
    },
    message: String,
    name: String,
    public: Boolean
});

const PostRecipe = mongoose.model('PostRecipe', recipeSchema);

export default PostRecipe;