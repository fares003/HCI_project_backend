const express = require('express');
const router = express.Router();
const lists=require('../controllers/lists')

router.post('/',lists.createListWithItems).get('/',lists.getLists).get('/:userId',lists.getListsByUserId).delete('/:listId',lists.deleteList)
router.get('/:id',lists.getListById);
module.exports=router