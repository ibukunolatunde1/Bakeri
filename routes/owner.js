const express = require('express');
const { body } = require('express-validator');

const ownerController = require('../controllers/owner');

const router = express.Router();

router.get('/', ownerController.getIndex);
router.get('/add-supplier', ownerController.getAddSupplier);
router.post(
    '/add-supplier', 
    [
        body('name').isString().trim().withMessage('No Name'),
        body('email').isEmail().normalizeEmail().trim().withMessage('Enter a valid email'),
        body('accountNumber').isNumeric().isLength({min: 10, max: 10}).withMessage('Enter a valid account number'),
        body('amount').isFloat().withMessage('Enter amount in numbers')
    ],
    ownerController.postAddSupplier
    );
router.get('/edit-supplier/:supplierId', ownerController.getEditSupplier);
router.post(
    '/edit-supplier',
    [
        body('name').isString().trim().withMessage('No Name'),
        body('email').isEmail().normalizeEmail().trim().withMessage('Enter a valid email'),
        body('accountNumber').isNumeric().isLength({min: 10, max: 10}).withMessage('Enter a valid account number'),
        body('amount').isFloat().withMessage('Enter amount in numbers')
    ], 
    ownerController.postEditSupplier
    );
router.get('/supplier/:supplierId', ownerController.getSupplier);
router.post('/suppliers/pay', ownerController.postInitiateBulkTransfer);

module.exports = router;