const express = require('express');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.get('/', adminController.getAllAdmins);
router.post('/', adminController.addAdmin);
router.get('/:id', adminController.getAdmin);
router.put('/:id', adminController.updateAdmin);
router.delete('/:id', adminController.deleteAdmin);

module.exports = router;
