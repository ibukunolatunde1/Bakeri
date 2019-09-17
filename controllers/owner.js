const { validationResult } = require('express-validator');

const paystack = require('../api/paystack');
const Supplier = require('../models/suppliers');

exports.getIndex = (req, res, next) => {
    let balance;
    paystack
        .get('/balance')
        .then(result => {
            balance = result.data.data[0].balance /100.00;
            return paystack.get('/transferrecipient')
        })
        .then(data => {
            return Supplier.find()
        })
        .then(data => {
            res.render('index', {
                balance: balance,
                data: data,
                pageTitle: 'Bakeri',
                path: '/'
            })
        })
        .catch(err => {
            console.log(err)
        })
}

exports.getAddSupplier = (req, res, next) => {
    res.render('edit-supplier', {
        pageTitle: 'Add Supplier',
        path: '/add-supplier',
        editing: false,
        hasError: false,
        errorMessage: null
    })
}

exports.postAddSupplier = (req, res, next) => {
    const {name, email, accountNumber, description, amount, bankCode} = req.body;
    console.log(req.body);

    //TODO: Catch Errors in the req.body
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render('edit-supplier', {
            pageTitle: 'Add Supplier',
            path: '/add-supplier',
            editing: false,
            hasError: true,
            supplier: {
                name,
                email,
                accountNumber,
                amount,
                description
            },
            errorMessage: errors.array()[0].msg
        });
    }

    // TODO: Send data to paystack API
    paystack
        .post('/transferrecipient', {
            type: 'nuban',
            name: name,
            description: description,
            account_number: accountNumber.toString(),
            bank_code: bankCode,
            currency: 'NGN'
        })
        .then(result => {
            console.log(result.data);
            if(result.data.status !== true) {
                return res.redirect('/admin/add-supplier');
            }
            return result.data.data.recipient_code;
        })
        .then(recipientCode => {
            // TODO: Save the response to the database
            const supplier = new Supplier({
                name: name,
                email: email,
                accountNumber: accountNumber,
                bankCode: bankCode,
                amount: amount * 100,
                recipientId: recipientCode,
                description: description
            });
            supplier.save().then(result => {
                console.log('Created Supplier')
                console.log(result);
                res.redirect('/admin');
            })
        })
        .catch(err => {
            console.log(err);
            return res.redirect('/admin/add-supplier');
        })
}

exports.getEditSupplier = (req, res, next ) => {
    const editMode = req.query.edit;
    if(!editMode) {
        return res.redirect('/admin');
    }
    const supplierId = req.params.supplierId;
    //Find Supplier in the database
    Supplier.findById(supplierId)
        .then(supplier => {
            if(!supplier) {
                return res.redirect('/admin');
            }
            //If Supplier is found, extra the data from database
            res.render('edit-supplier', {
                pageTitle: 'Edit Supplier',
                path: '/edit-supplier',
                editing: editMode,
                supplier: supplier,
                hasError: false,
                errorMessage: null
            });
        })
        .catch(err => console.log(err));
}

//Not Working Yet
exports.postEditSupplier = (req, res, next) => {
    //TODO: Get data from the req.body
    const {supplierId, name, email, accountNumber, description, bankCode, amount} = req.body;

    //TODO: Find errors in req
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422).render('edit-supplier', {
            pageTitle: 'Edit Supplier',
            path: '/edit-supplier',
            editing: true,
            hasError: true,
            supplier: {
                name,
                email,
                accountNumber,
                amount,
                description
            },
            errorMessage: errors.array()[0].msg
        });
    }

    //TODO: Check if the data is in the database
    // Supplier
    //     .findById(supplierId)
    //     .then(supplier => {
    //         // Update on Paystack First
    //         console.log(supplier.recipientId);
    //         return paystack.put(`/transferrecipient/${supplier.recipientId}`, {
    //             name: name
    //         })
    //     })
    //     .then(data => {
    //         //Update on Database
    //         console.log(data.data);
    //     })
    //     .catch(err => console.log(err));
}

exports.getSupplier = (req, res, next) => {
    const supplierId = req.params.supplierId;
    Supplier.findById(supplierId)
        .then(supplier => {
            res.render('supplier-detail', {
                supplier: supplier,
                pageTitle: supplier.name,
                path: '/suppliers'
            })
        })
        .catch(err => console.log(err));
}


exports.postInitiateTransfer = (req, res, next) => {
    //Get customer from database
    const supplierId = req.params.supplierId;
    Supplier
        .findById(supplierId)
        .then(result => {
            if(!result) {
                return res.redirect('/admin');
            }
            return paystack.post('/transfer', {
                source: 'balance',
                reason: result.description,
                amount: result.amount,
                recipient: result.recipientId
            })
        })
        .then(result => {
            if(result.data.data.status !== 'success'){
                return res.status(200).json({message: 'Transfer queued'});
            }
            return res.status(200).json({message: 'Transfer Successful'});
        })
        .catch(err => console.log(err));
}

exports.postInitiateBulkTransfer = (req, res, next) => {
    Supplier.find()
        .then(data => {
            return data.map(d => {
                return {
                    amount: d.amount,
                    recipient: d.recipientId
                }
            })
        })
        .then(data => {
            return paystack.post('/transfer/bulk', {
                currency: 'NGN',
                source: 'balance',
                transfers: data
            })
        })
        .then(response => {
            return res.status(200).json({ message: response.data.message })
        })
        .catch(err => {
            return res.status(400).json({ message: 'Transaction Failed'});
            // console.log(err);
        });
}

exports.deleteSupplier = (req, res, next) => {
    const supplierId = req.params.supplierId;
    // Delete from Paystack first
    Supplier.findById(supplierId)
    .then(supplier => {
        if(!supplier) {
            console.log('No supplier');
            return res.status(404).json({message: 'No Product'});
        }
        const { recipientId } = supplier;
        return paystack.delete(`/transferrecipient/${recipientId}`)
    })
    .then(result => {
        return Supplier.deleteOne({ _id: supplierId })
    })
    .then(() => {
        return res.status(200).json({ message: 'deleted' });
    })
    .catch(err => {
        return res.status(500).json({ message: 'not able to delete' });
    })
}