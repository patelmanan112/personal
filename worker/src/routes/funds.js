import { Hono } from 'hono';
import { getCollection } from '../services/mongodb.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinary.js';
import { requireAdmin } from '../middleware/auth.js';

const funds = new Hono();

// GET /api/funds/summary
funds.get('/summary', async (c) => {
  try {
    const contributionsCol = await getCollection(c.env, 'funds_contributions');
    const expensesCol = await getCollection(c.env, 'funds_expenses');

    // For D1 we added simple aggregate support. If it fails, fallback to fetch all.
    // Actually for D1 fallback or MongoDB, let's just get all and sum if aggregate fails.
    // Let's use simple aggregate if possible.
    let totalCollected = 0;
    let totalSpent = 0;
    let totalContributors = 0;
    let totalExpenses = 0;

    totalContributors = await contributionsCol.countDocuments({});
    totalExpenses = await expensesCol.countDocuments({});

    const cAgg = await contributionsCol.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]).toArray();
    totalCollected = cAgg[0]?.total || 0;
    
    const eAgg = await expensesCol.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]).toArray();
    totalSpent = eAgg[0]?.total || 0;

    return c.json({
      success: true,
      data: {
        totalCollected,
        totalSpent,
        remainingBalance: totalCollected - totalSpent,
        totalContributors,
        totalExpenses
      }
    });
  } catch (err) {
    console.error('Funds summary error:', err);
    return c.json({ success: false, message: err.message, stack: err.stack }, 500);
  }
});

// GET /api/funds/contributions
funds.get('/contributions', async (c) => {
  try {
    const collection = await getCollection(c.env, 'funds_contributions');
    // Implement simple pagination/search/filtering if needed, or return all
    // Given the prompt, let's implement basic filtering
    const search = c.req.query('search') || '';
    const paymentMode = c.req.query('paymentMode') || '';
    
    const filter = {};
    if (search) {
      filter.$or = [
        { contributorName: { $regex: search, $options: 'i' } }
      ];
    }
    if (paymentMode) {
      filter.paymentMode = paymentMode;
    }

    const records = await collection
      .find(filter)
      .sort({ date: -1, createdAt: -1 })
      .toArray();

    return c.json({ success: true, data: records });
  } catch (err) {
    console.error(err);
    return c.json({ success: false, message: 'Error fetching contributions' }, 500);
  }
});

// GET /api/funds/expenses
funds.get('/expenses', async (c) => {
  try {
    const collection = await getCollection(c.env, 'funds_expenses');
    const search = c.req.query('search') || '';
    const category = c.req.query('category') || '';
    
    const filter = {};
    if (search) {
      filter.$or = [
        { expenseName: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) {
      filter.category = category;
    }

    const records = await collection
      .find(filter)
      .sort({ date: -1, createdAt: -1 })
      .toArray();

    return c.json({ success: true, data: records });
  } catch (err) {
    console.error(err);
    return c.json({ success: false, message: 'Error fetching expenses' }, 500);
  }
});

// --- ADMIN ROUTES ---

// POST /api/funds/contributions
funds.post('/contributions', requireAdmin, async (c) => {
  try {
    const formData = await c.req.formData();
    const contributorName = formData.get('contributorName')?.trim();
    const amount = Number(formData.get('amount'));
    const date = formData.get('date');
    const paymentMode = formData.get('paymentMode');
    const note = formData.get('note')?.trim() || '';
    const image = formData.get('image');

    if (!contributorName || isNaN(amount) || amount <= 0 || !date || !paymentMode) {
      return c.json({ success: false, message: 'Invalid data provided' }, 400);
    }

    let imageUrl = null, imagePublicId = null;
    if (image && image.size > 0) {
      const result = await uploadToCloudinary(image, c.env);
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }

    const now = new Date();
    const id = crypto.randomUUID();
    const doc = {
      id,
      contributorName,
      amount,
      date,
      paymentMode,
      note,
      imageUrl,
      imagePublicId,
      createdAt: now,
      updatedAt: now
    };

    const collection = await getCollection(c.env, 'funds_contributions');
    await collection.insertOne(doc);

    return c.json({ success: true, data: doc }, 201);
  } catch (err) {
    console.error(err);
    return c.json({ success: false, message: 'Could not create contribution' }, 500);
  }
});

// DELETE /api/funds/contributions/:id
funds.delete('/contributions/:id', requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const collection = await getCollection(c.env, 'funds_contributions');
    
    const record = await collection.findOne({ id });
    if (!record) return c.json({ success: false, message: 'Not found' }, 404);

    if (record.imagePublicId) {
      await deleteFromCloudinary(record.imagePublicId, c.env).catch(e => console.error(e));
    }

    await collection.deleteOne({ id });
    return c.json({ success: true, message: 'Deleted' });
  } catch (err) {
    console.error(err);
    return c.json({ success: false, message: 'Error deleting' }, 500);
  }
});

// POST /api/funds/expenses
funds.post('/expenses', requireAdmin, async (c) => {
  try {
    const formData = await c.req.formData();
    const expenseName = formData.get('expenseName')?.trim();
    const category = formData.get('category');
    const amount = Number(formData.get('amount'));
    const date = formData.get('date');
    const paidTo = formData.get('paidTo')?.trim() || '';
    const description = formData.get('description')?.trim() || '';
    const receipt = formData.get('receipt');

    if (!expenseName || !category || isNaN(amount) || amount <= 0 || !date) {
      return c.json({ success: false, message: 'Invalid data provided' }, 400);
    }

    let receiptUrl = null, receiptPublicId = null;
    if (receipt && receipt.size > 0) {
      const result = await uploadToCloudinary(receipt, c.env);
      receiptUrl = result.secure_url;
      receiptPublicId = result.public_id;
    }

    const now = new Date();
    const id = crypto.randomUUID();
    const doc = {
      id,
      expenseName,
      category,
      amount,
      date,
      paidTo,
      description,
      receiptUrl,
      receiptPublicId,
      createdAt: now,
      updatedAt: now
    };

    const collection = await getCollection(c.env, 'funds_expenses');
    await collection.insertOne(doc);

    return c.json({ success: true, data: doc }, 201);
  } catch (err) {
    console.error(err);
    return c.json({ success: false, message: 'Could not create expense' }, 500);
  }
});

// DELETE /api/funds/expenses/:id
funds.delete('/expenses/:id', requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const collection = await getCollection(c.env, 'funds_expenses');
    
    const record = await collection.findOne({ id });
    if (!record) return c.json({ success: false, message: 'Not found' }, 404);

    if (record.receiptPublicId) {
      await deleteFromCloudinary(record.receiptPublicId, c.env).catch(e => console.error(e));
    }

    await collection.deleteOne({ id });
    return c.json({ success: true, message: 'Deleted' });
  } catch (err) {
    console.error(err);
    return c.json({ success: false, message: 'Error deleting' }, 500);
  }
});

// PUT /api/funds/contributions/:id
funds.put('/contributions/:id', requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const formData = await c.req.formData();
    
    const contributorName = formData.get('contributorName')?.trim();
    const amount = Number(formData.get('amount'));
    const date = formData.get('date');
    const paymentMode = formData.get('paymentMode');
    const note = formData.get('note')?.trim() || '';
    const image = formData.get('image');

    const collection = await getCollection(c.env, 'funds_contributions');
    const record = await collection.findOne({ id });
    if (!record) return c.json({ success: false, message: 'Not found' }, 404);

    let imageUrl = record.imageUrl;
    let imagePublicId = record.imagePublicId;

    if (image && image.size > 0) {
      if (imagePublicId) {
        await deleteFromCloudinary(imagePublicId, c.env).catch(e => console.error(e));
      }
      const result = await uploadToCloudinary(image, c.env);
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }

    const updateDoc = {
      $set: {
        ...(contributorName && { contributorName }),
        ...(!isNaN(amount) && amount > 0 && { amount }),
        ...(date && { date }),
        ...(paymentMode && { paymentMode }),
        note,
        imageUrl,
        imagePublicId,
        updatedAt: new Date()
      }
    };

    await collection.updateOne({ id }, updateDoc);
    return c.json({ success: true, message: 'Updated' });
  } catch (err) {
    console.error(err);
    return c.json({ success: false, message: 'Could not update contribution' }, 500);
  }
});

// PUT /api/funds/expenses/:id
funds.put('/expenses/:id', requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const formData = await c.req.formData();

    const expenseName = formData.get('expenseName')?.trim();
    const category = formData.get('category');
    const amount = Number(formData.get('amount'));
    const date = formData.get('date');
    const paidTo = formData.get('paidTo')?.trim() || '';
    const description = formData.get('description')?.trim() || '';
    const receipt = formData.get('receipt');

    const collection = await getCollection(c.env, 'funds_expenses');
    const record = await collection.findOne({ id });
    if (!record) return c.json({ success: false, message: 'Not found' }, 404);

    let receiptUrl = record.receiptUrl;
    let receiptPublicId = record.receiptPublicId;

    if (receipt && receipt.size > 0) {
      if (receiptPublicId) {
        await deleteFromCloudinary(receiptPublicId, c.env).catch(e => console.error(e));
      }
      const result = await uploadToCloudinary(receipt, c.env);
      receiptUrl = result.secure_url;
      receiptPublicId = result.public_id;
    }

    const updateDoc = {
      $set: {
        ...(expenseName && { expenseName }),
        ...(category && { category }),
        ...(!isNaN(amount) && amount > 0 && { amount }),
        ...(date && { date }),
        paidTo,
        description,
        receiptUrl,
        receiptPublicId,
        updatedAt: new Date()
      }
    };

    await collection.updateOne({ id }, updateDoc);
    return c.json({ success: true, message: 'Updated' });
  } catch (err) {
    console.error(err);
    return c.json({ success: false, message: 'Could not update expense' }, 500);
  }
});

export default funds;

