
import e from "express";
import mongoose from "mongoose";
import PostRecipe from "../models/recipeContent.js";

export const getRecipes = async (req, res) => {
    const { page } = req.query;
    const userName = req.query.userName;

    try {
        const LIMIT = 10;
        const startIndex = (Number(page) -1) * LIMIT // get the starting index of every page
        
        const total = await PostRecipe.countDocuments({});
        const recipes = await PostRecipe.find({ $or: [{public: true}, {creator: userName}]}).collation({locale: "en" }).sort({ drinkName: 1}).limit(LIMIT).skip(startIndex);

        res.status(200).json({ data: recipes, currentPage: Number(page), numberOfPages: Math.ceil(total / LIMIT) });
    } catch (error) {
        res.status(404).json({message: error.message})
    }
}

export const getRecipesBySearch = async (req, res) => {
    const { searchQuery } = req.query
    const userName = req.query.userName

    try {
        const title = new RegExp(searchQuery, 'i');
        const recipes = await PostRecipe.find({ $and: [{ $or: [{public: true}, {creator: userName}]}, { $or: [{drinkName: title}, {ingredients: title}, {garnishes: title}, {steps: title}, {glass: title}] } ]}).collation({locale: "en" }).sort({ drinkName: 1});

        res.json({ data: recipes });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const createRecipe = async (req, res) => {
    const recipe = req.body;

    const newRecipe = new PostRecipe({ ...recipe, creator: req.userId });
    try {
        await newRecipe.save();

        res.status(201).json(newRecipe);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}

export const updateRecipe = async (req, res) => {
    const { id: _id } = req.params;
    const recipe = req.body;

    if(!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send('No post with that id');

    const updatedRecipe = await PostRecipe.findByIdAndUpdate(_id, { ...recipe, _id }, { new: true })

    res.json(updatedRecipe)
}

export const deleteRecipe = async (req, res) => {
    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No post with that id');

    await PostRecipe.findByIdAndRemove(id);

    res.json({ message: 'Recipe deleted successfully' });
}

export const likeRecipe = async (req, res) => {
    const { id } = req.params;

    if(!req.userId) return res.json ({ message: 'Unauthenticated' });

    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No post with that id');

    const recipe = await PostRecipe.findById(id);

    const index = recipe.likes.findIndex((id) => id === String(req.userId));

    if (index === -1){
        recipe.likes.push(req.userId);
    }else{
        recipe.likes = recipe.likes.filter((id) => id !== String(req.userId));
    }

    const updatedRecipe = await PostRecipe.findByIdAndUpdate(id, recipe, { new: true });

    res.json(updatedRecipe);
}