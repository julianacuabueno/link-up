import { Router } from 'express';
var router = Router();

/* GET home page. */
router.get('/api/test-get', function(req, res, next) {
  res.json({ title: 'Express' });
});

export default router;
