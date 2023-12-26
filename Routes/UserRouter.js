const express = require('express')
const { authenticateToken } = require('../config/JwtToken');
const { register, login, AllUsers, editUser, UpdateUsers, deleteUser, Accept_User, addToCart, Allcart, Deletecart, UpdateCart, editUserbytoken } = require('../controllers/userController');
const { Addmenus, Allmenus, editmenu, Updatemenus, AddmenusCategory, AllCategory, deletemenuCategory, deletemenu, filterMenus } = require('../controllers/menuCategoryController');
const { editTeacher, UpdateTeacher, deleteTeacher, AllTeachers, UpdateTeachersocail_Media, UpdateTeacherBankDetails, AllResturants, editResturant, deleteResturant, UpdateResturant, UpdateResturantBankDetails, UpdateResturantSocail_Media } = require('../controllers/doctorController');
const { OrderMake, getOrder, allOrder } = require('../controllers/orderController');


const router = express.Router();


router.post('/register', register);
router.post('/login', login);
router.get('/AllUsers', AllUsers)
router.get('/editUser/:id', editUser)
router.get('/AllResturants', AllResturants)
router.put('/UpdateUsers/:id', UpdateUsers)
router.post('/Addmenus', Addmenus)
router.get('/Allmenus', Allmenus)
router.get('/editmenu/:id', editmenu)
router.put('/Updatemenus/:id', Updatemenus)
router.post('/AddmenusCategory', AddmenusCategory)
router.get('/AllCategory', AllCategory)
router.delete('/deletemenuCategory/:id', deletemenuCategory)
router.delete('/deletemenu/:id', deletemenu)
router.delete('/deleteUser/:id', deleteUser)
router.get('/editResturant/:id', editResturant)
router.put('/UpdateResturant/:id', UpdateResturant)
router.delete('/deleteResturant/:id', deleteResturant)
router.put('/UpdateResturantSocail_Media/:id', UpdateResturantSocail_Media)
router.put('/UpdateResturantBankDetails/:id', UpdateResturantBankDetails)
router.post('/Accept_User/:id', Accept_User)
router.post('/addToCart', addToCart)
router.get('/Allcart/:id', Allcart)
router.delete('/Deletecart/:id', Deletecart)
router.put('/UpdateCart/:id', UpdateCart)
router.get('/editUserbytoken/:token', editUserbytoken)
router.post('/OrderMake', OrderMake)
router.get('/filterMenus', filterMenus)
router.get('/getOrder/:id', getOrder)
router.get('/allOrder', allOrder)

module.exports = router;