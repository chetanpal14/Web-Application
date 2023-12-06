const { ObjectId } = require('mongodb');
const { getDB } = require('./db');

const collectionName = 'TravelCollections';

const getAllTravelCollections = async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection(collectionName);

    const category = req.query.category;
    const query = category ? { category: category } : {};

    if (category && category !== 'bug' && category !== 'feature') {
      return res.status(400).json({ error: 'Invalid category. Category must be "bug" or "feature".' });
    }

    const priority = req.body.priority;

    if (priority !== 1 && priority !== 2 && priority !== 3) {
      return res.status(400).json({ error: 'Invalid priority. Priority must be 1, 2, or 3.' });
    }

    const data = await collection.find(query).toArray();

    res.json({
      message: 'List of Travel Collections',
      data
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const addTravelCollections = async (req, res) => {
  try {
    const db = getDB();

    let fields = ['title', 'description', 'priority', 'category'];

    const missingFields = fields.filter(field => !(field in req.body));

    if (missingFields.length > 0) {
      const errorMessage = `Missing fields: ${missingFields.join(', ')}`;
      return res.status(400).json({ error: errorMessage });
    }

    const collection = db.collection(collectionName);

    const newTravelCollections = {
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority,
      category: req.body.category
    };

    const result = await collection.insertOne(newTravelCollections);

    if (result.acknowledged) {
      const updatedData = await collection.find({}).toArray();
      res.json({
        message: 'Travel Collections added.',
        data: updatedData
      });
    } else {
      res.status(500).json({ error: 'Failed to add travel collection' });
    }

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const updateTravelCollections = async (req, res) => {
  try {
    const db = getDB();

    const collection = db.collection(collectionName);
    const TravelCollectionsIdToUpdate = req.params.id;

    let keysToUpdate = ['Username', 'Email', 'Password'];

    const updatedData = {};
    for (const key of keysToUpdate) {
      if (req.body[key] !== undefined) {
        updatedData[key] = req.body[key];
      }
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(TravelCollectionsIdToUpdate) },
      { $set: updatedData }
    );

    if (result.matchedCount) {
      const updatedDocument = await collection.findOne({ _id: new ObjectId(TravelCollectionsIdToUpdate) });
      res.json({
        message: 'Collection updated.',
        data: updatedDocument
      });
    } else {
      res.status(500).json({ error: 'Failed to update story' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const deleteTravelCollections = async (req, res) => {
  try {
    const db = getDB();
    const travelCollectionsIdToDelete = req.params.id;
    const collection = db.collection(collectionName);

    if (!ObjectId.isValid(TravelCollectionsIdToDelete)) {
      return res.status(400).json({ error: 'Invalid travel collection ID' });
    }

    const result = await collection.deleteOne({ _id: new ObjectId(TravelCollectionsIdToDelete) });

    if (result.deletedCount === 1) {
      res.json({ message: 'Travel Collections deleted successfully.' });
    } else {
      res.status(404).json({ error: 'Travel Collections not found' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getAllTravelCollections,
  addTravelCollections,
  updateTravelCollections,
  deleteTravelCollections
};
