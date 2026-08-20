// worker/src/routes/public.js
// GET /api/id/:uniqueId — Public member verification endpoint.

import { Hono } from 'hono';
import { getCollection } from '../services/mongodb.js';

const publicRoutes = new Hono();

publicRoutes.get('/:uniqueId', async (c) => {
  const uniqueId = c.req.param('uniqueId');

  if (!uniqueId || !/^UALG-\d{4}-[A-Z0-9]{6}$/.test(uniqueId)) {
    return c.json({
      success: false,
      message: 'Invalid membership ID format.',
      verified: false,
    }, 400);
  }

  try {
    const collection = await getCollection(c.env);

    const member = await collection.findOne(
      { uniqueId },
      {
        // Only project the fields needed for public verification — never expose internals
        projection: {
          _id: 0,
          uniqueId: 1,
          fullName: 1,
          age: 1,
          bloodGroup: 1,
          city: 1,
          photoUrl: 1,
          createdAt: 1,
          // mobileNumber is included but may be masked on the frontend for privacy
          mobileNumber: 1,
        },
      }
    );

    if (!member) {
      return c.json({
        success: false,
        message: 'This membership ID could not be verified.',
        verified: false,
      }, 404);
    }

    return c.json({
      success: true,
      message: 'ID Verified Successfully.',
      verified: true,
      data: member,
    });

  } catch (err) {
    console.error('Public ID lookup error:', err);
    return c.json({
      success: false,
      message: 'Verification service temporarily unavailable. Please try again.',
      verified: false,
    }, 503);
  }
});

export default publicRoutes;
