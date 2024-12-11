const List = require('../model/lists');
const Item = require('../model/items');
const User = require('../model/users');

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
          match: { category: { $in: categories.map(cat => new RegExp(cat, 'i')) } },
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
  
      res.status(200).json({ items: filteredItems });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
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
module.exports = { createListWithItems,getLists ,getListById,getAllItems,getCategories};
