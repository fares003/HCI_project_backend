const List = require('../model/lists');
const Item = require('../model/items');
const User = require('../model/users');
const mongoose = require("mongoose");


const addToWishlist = async (req, res) => {
    try {
      const { userId, itemId } = req.body;
  
      // Validate required fields
      if (!userId || !itemId) {
        return res.status(400).json({ message: "User ID and Item ID are required." });
      }
  
      // Check if the user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
  
      // Check if the item exists
      const item = await Item.findById(itemId);
      if (!item) {
        return res.status(404).json({ message: "Item not found." });
      }
  
      // Add the item to the user's wishlist if it's not already there
      if (!user.wishlist.includes(itemId)) {
        user.wishlist.push(itemId);
        await user.save();
        return res.status(200).json({ message: "Item added to wishlist.", wishlist: user.wishlist });
      }
  
      res.status(400).json({ message: "Item is already in the wishlist." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error." });
    }
  };
  const removeFromWishlist = async (req, res) => {
    try {
      const { userId, itemId } = req.body;
  
      // Validate required fields
      if (!userId || !itemId) {
        return res.status(400).json({ message: "User ID and Item ID are required." });
      }
  
      // Check if the user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
  
      // Remove the item from the wishlist
      const itemIndex = user.wishlist.indexOf(itemId);
      if (itemIndex !== -1) {
        user.wishlist.splice(itemIndex, 1);
        await user.save();
        return res.status(200).json({ message: "Item removed from wishlist.", wishlist: user.wishlist });
      }
  
      res.status(400).json({ message: "Item not found in the wishlist." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error." });
    }
  };
  const getWishlist = async (req, res) => {
    try {
      const { userId } = req.params;
  
      // Check if the user exists
      const user = await User.findById(userId).populate('wishlist');
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
  
      res.status(200).json({ wishlist: user.wishlist });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error." });
    }
  };
  const sellerInsightsController = {

    getWishlistInsights: async (req, res) => {
      try {
        const { sellerId } = req.params;
  
        // Ensure ObjectId is created with 'new'
        const sellerObjectId = new mongoose.Types.ObjectId(sellerId);
  
        const wishlistData = await User.aggregate([
          {
            $unwind: "$wishlist", // Flatten the wishlist array
          },
          {
            $lookup: {
              from: "items", // Join with the Item collection
              localField: "wishlist",
              foreignField: "_id",
              as: "wishlistDetails",
            },
          },
          {
            $unwind: "$wishlistDetails", // Flatten the wishlistDetails array
          },
          {
            $match: { "wishlistDetails.owner": sellerObjectId }, // Use new ObjectId here
          },
          {
            $group: {
              _id: "$wishlistDetails._id", // Group by item ID
              itemName: { $first: "$wishlistDetails.name" },
              totalWishlisted: { $sum: 1 }, // Count occurrences in wishlists
              averagePrice: { $avg: "$wishlistDetails.price" },
            },
          },
          { $sort: { totalWishlisted: -1 } }, // Sort by popularity
        ]);
  
        res.status(200).json({
          sellerId,
          wishlistInsights: wishlistData,
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch wishlist insights." });
      }
    },
    // Additional function to track sold items from wishlists
    trackSoldItems: async (req, res) => {
      try {
        const { itemId } = req.params;
  
        // Find all users who have the item in their wishlist
        const usersWithItemInWishlist = await User.find({ wishlist: itemId });
  
        // Count how many users have wishlisted the item
        const wishlistCount = usersWithItemInWishlist.length;
  
        res.status(200).json({
          itemId,
          wishlistCount,
          message: `Item has been wishlisted by ${wishlistCount} users.`,
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to track sold items." });
      }
    },
  };
module.exports = { addToWishlist,removeFromWishlist,getWishlist,sellerInsightsController };
  