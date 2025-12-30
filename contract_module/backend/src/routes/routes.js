const express = require('express');
const router = express.Router();


// Import controllers
const contractController = require('../controllers/contractController');
const generateWord = require('../controllers/generatedWord');

// Route for getting contracts
router.get('/getContracts', contractController.getContracts);

// Route for getting catalogs tables
router.get('/catalogs_tables', contractController.getCatalogsTables);

// Route for getting suppliers
router.get('/suppliers', contractController.getSuppliers);


// Rpute for add a new contract
router.post('/CreateContracts', contractController.createContract);

// Route for add a new addition
router.post('/CreateAddition/:id', contractController.createAddition);

// Route for update a existen contract
router.get('/getContractById/:id', contractController.getContractById);
router.post('/UpdateContracts/:id', contractController.updateContract);


// Route for dowload and generate word
router.get('/downloadWord/:id', generateWord.downloadContractWord);



// Route for generate hash for signe
router.get('/sign/:id/:status', contractController.signed);
// router.get('/generateHash/:id/:status', contractController.signed);
// router.get('/changeStatus/:id/:status', contractController.changeStatus);


module.exports = router;






