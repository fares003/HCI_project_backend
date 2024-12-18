const List = require('../model/lists');
const Item = require('../model/items');
const User = require('../model/users');
const mongoose = require("mongoose");

const createListWithItems = async (req, res) => {
  try {
    const { listname, category, owner, items } = req.body;

    // Validate required fields
    if (!listname || !category || !owner) {
      return res.status(400).json({ message: "List name, category, and owner are required." });
    }

    // Check if the owner exists
    const user = await User.findById(owner);
    if (!user) {
      return res.status(404).json({ message: "Owner not found." });
    }

    // Create the list
    const newList = new List({
      listname,
      category,
      owner,
    });

    // Add items if provided
    const createdItems = [];
    if (items && items.length > 0) {
      for (const item of items) {
        const { name, photo, description, price } = item;

        // Validate required fields for each item
        if (!name || !photo || !description || !price) {
          return res.status(400).json({ message: "Each item must include name, photo, description, and price." });
        }

        // Create the item
        const newItem = new Item({
          name,
          photo,
          description,
          price,
          list: newList._id,
          owner,
        });
        const savedItem = await newItem.save();
        createdItems.push(savedItem._id);
      }
    }
    
    // Save the list with the items
    newList.items = createdItems;
    const savedList = await newList.save();

    res.status(201).json({
      message: "List and items created successfully.",
      list: savedList,
      items: createdItems,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const deleteList = async (req, res) => {
  try {
    const { listId } = req.params; // Get list ID from the request parameters

    // Find the list by its ID
    const list = await List.findById(listId).populate('items');
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Delete all the items associated with the list
    if (list.items && list.items.length > 0) {
      await Item.deleteMany({ _id: { $in: list.items } }); // Delete items by their IDs
    }

    // Delete the list itself using deleteOne()
    await List.deleteOne({ _id: listId });

    res.status(200).json({ message: 'List and its items deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getLists = async (req, res) => {
    try {

      const lists = await List.find()
        .populate({
          path: 'items',
          select: 'name photo description price -_id',
        })
        .populate({
          path: 'owner',
          select: 'firstname lastname email -_id', 
        })
        .exec();
  
      if (!lists || lists.length === 0) {
        return res.status(404).json({ message: "No lists found." });
      }
  
      res.status(200).json({
        message: "Lists retrieved successfully.",
        lists,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error." });
    }
  };

  
  const getListById = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find the list by its ID
      const list = await List.findById(id).populate('owner', 'firstname lastname email'); // Populate owner details (optional fields)
  
      if (!list) {
        return res.status(404).json({ message: 'List not found' });
      }
  
      // Find all items belonging to this list
      const items = await Item.find({ list: id });
  
      res.status(200).json({
        listDetails: list,
        items: items,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  const getItemById = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find the item by its ID and populate owner and list details
      const item = await Item.findById(id)
        .populate('owner', 'firstname lastname email')
        .populate('list', 'listname category');
  
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }
  
      // Calculate the average rating from the reviews
      let averageRating = 1;  // Default to 1 if no reviews
      if (item.reviews && item.reviews.length > 0) {
        const totalRating = item.reviews.reduce((sum, review) => sum + review.rating, 0);
        averageRating = totalRating / item.reviews.length;
      }
  
      // Ensure average rating is within the 1 to 5 range
      averageRating = Math.min(Math.max(averageRating, 1), 5);
  
      res.status(200).json({
        item: item,
        averageRating: averageRating,  // Return the average rating
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  


  const getAllItems = async (req, res) => {
    try {
      const { search, category, minPrice, maxPrice } = req.query;
  
      // Convert category query to an array if it's not already
      const categories = Array.isArray(category) ? category : [category];
  
      // Build query dynamically
      let query = {};
  
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { 'list.category': { $regex: search, $options: 'i' } },
          { 'list.listname': { $regex: search, $options: 'i' } },
        ];
      }
  
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }
  
      let itemsQuery = Item.find(query);
  
      if (categories && categories.length > 0) {
        // Support multiple categories, use $in to check if any category matches
        itemsQuery = itemsQuery.populate({
          path: 'list',
          match: { category: { $in: categories.map((cat) => new RegExp(cat, 'i')) } },
          select: 'listname category',
        });
      } else {
        itemsQuery = itemsQuery.populate('list', 'listname category');
      }
  
      // Populate the owner information
      itemsQuery = itemsQuery.populate('owner', 'firstname lastname email');
  
      const items = await itemsQuery;
  
      // Filter out items with no matching 'list' when filtering by category
      const filteredItems = items.filter((item) => item.list !== null);
  
      // Add average rating for each item
      const itemsWithRatings = filteredItems.map((item) => {
        let averageRating = 1; // Default to 1 if no reviews
        if (item.reviews && item.reviews.length > 0) {
          const totalRating = item.reviews.reduce((sum, review) => sum + review.rating, 0);
          averageRating = totalRating / item.reviews.length;
        }
        // Ensure average rating is within the 1 to 5 range
        averageRating = Math.min(Math.max(averageRating, 1), 5);
  
        return {
          ...item._doc, // Spread the existing item document fields
          averageRating, // Add averageRating as a new field
        };
      });
  
      res.status(200).json({ items: itemsWithRatings });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  const addReview = async (req, res) => {
    try {
      const { ownerId, review, rating } = req.body;  // Get rating from the request body
  
      // Validate input
      if (!ownerId || !review) {
        return res.status(400).json({ error: "ownerId and review are required" });
      }
  
      // Set default rating if not provided
      const reviewRating = rating !== undefined ? rating : 1;  // Default to 1 if rating is not provided
  
      // Find the product by ID
      const { productId } = req.params;
      const product = await Item.findById(productId);
  
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
  
      // Create the review object with date and rating
      const newReview = {
        review,
        owner: ownerId,
        createdAt: new Date(), // Add the current date/time
        rating: reviewRating,  // Add the rating
      };
  
      // Add the review to the product
      product.reviews.push(newReview);
  
      // Save the updated product
      await product.save();
  
      res.status(200).json({ message: "Review added successfully", product });
    } catch (error) {
      console.error("Error adding review:", error);
      res.status(500).json({ error: "Failed to add review" });
    }
  };
  
  
  const getReviews = async (req, res) => {
    try {
      const { productId } = req.params;
  
      // Find the product by ID and populate reviews with owner details
      const product = await Item.findById(productId).populate({
        path: 'reviews.owner',
        select: 'firstname lastname',
      });
  
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      res.status(200).json({
        message: 'Reviews retrieved successfully',
        reviews: product.reviews.map((review) => ({
          review: review.review,
          owner: review.owner,
          createdAt: review.createdAt, // Include date/time in the response
        })),
      });
    } catch (error) {
      console.error('Error retrieving reviews:', error);
      res.status(500).json({ message: 'Failed to retrieve reviews' });
    }
  };
  const getReviewsByOwnerId = async (req, res) => {
    try {
      const { ownerId } = req.params;
  
      console.log("Provided Owner ID:", ownerId);
  
      const items = await Item.find({
        "reviews.owner": ownerId,
      }).populate({
        path: "reviews.owner",
        select: "firstname lastname",
      });
  

  
      if (!items || items.length === 0) {
        return res.status(404).json({ message: "No reviews found for this owner" });
      }
  
      const reviews = items.flatMap((item) =>
        item.reviews
          .filter((review) => {
     
            return review.owner._id.toString() === ownerId.toString();
          })
          .map((review) => ({
            review: review.review,
            owner: review.owner,
            createdAt: review.createdAt,
            rating: review.rating || 1,
            item: {
              name: item.name,
              id: item._id,
            },
          }))
      );
  

  
      res.status(200).json({
        message: "Reviews retrieved successfully",
        reviews,
      });
    } catch (error) {
      console.error("Error retrieving reviews:", error);
      res.status(500).json({ message: "Failed to retrieve reviews" });
    }
  };
  
  
const getCategories = async (req, res) => {
  try {
    // Fetch distinct categories from the List schema
    const categories = await List.distinct('category');

    res.status(200).json({
      categories: categories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
const getListsByUserId = async (req, res) => {
  try {
    const { userId } = req.params; // Extract user ID from the request parameters

    // Fetch all lists belonging to the specified user
    const lists = await List.find({ owner: userId }).populate('items', 'name photo price'); // Populate item details if needed

    if (!lists || lists.length === 0) {
      return res.status(404).json({ message: 'No lists found for this user' });
    }

    res.status(200).json({
      message: 'Lists retrieved successfully',
      lists,
    });
  } catch (error) {
    console.error('Error fetching lists:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {deleteList,getReviewsByOwnerId,getListsByUserId, createListWithItems,getLists ,getListById,getAllItems,getCategories,getItemById,addReview,getReviews};
