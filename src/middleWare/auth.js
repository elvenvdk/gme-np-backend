const jwt = require('jsonwebtoken');

/**
 * @function tokenVerify
 * @description Verifies token from frontend and compares to session token in db
 * @param {*} query token
 * @param {*} req header
 */

 exports.tokenVerify = async (req, res, next) => {
   const token = req.header('x-auth-token');
   console.log({token});
   if (!token) return res.status(401).json({ error: 'Token not provided.  Authorization denied.' })
   try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log({decoded});
    res.locals.userId = decoded.id;
    next();
   }
   catch(error) {
     res.status(401).json({error});
   }
 }
