const express = require('express');
const {
  postContactsValidation,
  putContactsValidation,
} = require('../middlewares/validationMiddleware.js');
const router = express.Router();

const {
  get,
  getById,
  create,
  update,
  updateStatus,
  remove,
} = require('../controllers/contacts');
const {
  auth,
} = require('../middlewares/auth.js');

router.get('/', auth, get);
router.get('/:contactId', auth, getById);
router.post('/', auth, create);
router.delete('/:contactId', auth, remove);
router.put(
  '/:contactId',
  putContactsValidation,
  update
);
router.patch(
  '/:contactId/favorite',
  postContactsValidation,
  updateStatus
);

module.exports = router;
