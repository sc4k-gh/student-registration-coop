import { getAuth } from '@clerk/express';

export const requireRole = (role) => {
  return (req, res, next) => {
    const auth = getAuth(req);
    
    if (!auth.has({ role })) {
      return res.status(403).json({ 
        error: `Forbidden: requires ${role} role` 
      });
    }
    
    next(); // Continue to next middleware/route
  };
};
