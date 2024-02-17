var express = require('express');
var router = express.Router();
const localStrategy = require("passport-local")
const User = require("../models/userModel");
const passport = require('passport');
passport.use(new localStrategy(User.authenticate()));

const {sendmail} = require("../utils/sendmail");
const Expense = require('../models/expenseModel');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index',{admin:req.user});
});


router.post('/signup', function (req, res, next) {
  User.register({
    username: req.body.username,
    email: req.body.email,
    fullname: req.body.fullname
  },
    req.body.password
  )
  res.redirect('/');
});

// router.get('/signin', function (req, res, next) {
//   res.render('signin')
// })
router.post('/signin', passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/"
}), function (req, res, next) { });

router.get('/logout', function (req, res, next) {
  req.logOut(function (err) {
    if (err) { return next(err) }
    res.redirect("/");
  })
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/")
}

router.get('/forget',function(req, res,next){
  res.render('forget',{admin:req.user})
})

// router.post('/forget', async function (req, res, next) {

//   try {
//    const user = await User.findOne({ username: req.body.username })
//     if (!user)
//       return res.send("User not found! <a href='/forget'>Try Again</a>.");

//      await user.setPassword(req.body.newPassword)
//     await user.save();
//     res.redirect("/signin")
//   } catch (error) {
//     res.send(error)
//   }

// });
router.post("/sendmail", async function (req, res, next) {
  try {
      const user = await User.findOne({ email: req.body.email });
      if (!user)
          return res.send("User Not Found! <a href='/forget'>Try Again</a>");

      sendmail(user.email, user, res, req);
      // res.redirect("/verify")
  } catch (error) {
      console.log(error);
      res.send(error);
  }
});
// router.get("/match-otp",function(req,res,next){
//   res.render("match-otp")
// })
router.post("/match-otp/:id", async function (req, res, next) {
  try {
      const user = await User.findById(req.params.id);
      if (!user)
          return res.send("User not found! <a href='/forget'>Try Again</a>.");

      if (user.token == req.body.token) {
          user.token = -1;
          await user.setPassword(req.body.newpassword);
          await user.save();
          res.redirect("/");
      } else {
          user.token = -1;
          await user.save();
          res.send("Invalid Token! <a href='/forget'>Try Again<a/>");
      }
  } catch (error) {
      res.send(error);
  }
});

router.get('/profile',isLoggedIn,async function (req, res, next) {
  try {
    const user  = await req.user.populate("expenses");
    // console.log(req.user,expenses);
    res.render('profile',{
      expenses:user.expenses,
      admin:req.user,
    })
   

  } catch (error) {
    res.send(error)
  }

});


// router.get('/createexpense', isLoggedIn, function (req, res, next) {
//   res.render('createexpense',{admin:req.user})
// });
router.post('/createexpense',isLoggedIn ,async function(req, res, next){

  try {
    const expense = new Expense(req.body);
    req.user.expenses.push(expense._id)
    expense.user= req.user._id;
     await expense.save();
     await req.user.save();
    res.redirect("/profile");

  } catch (error) {
    res.send(error);
  }
}); 

  router.get('/filter', async function (req, res, next) {
    try {
      let {expenses} = await req.user.populate("expenses");
     expenses = expenses.filter((e)=>e[req.query.key] == req.query.value);
     console.log(expenses);
    res.render('profile',{admin:req.user,expenses});
    } catch (error) {
      console.log(error);
      res.send(error);
    }
    
})

router.get("/delete/:id", isLoggedIn, async function(req,res,next){
  try {
   const expenseIndex = req.user.expenses.findIndex((e)=>e._id===req.params.id);
  //  console.log("expenseIndex",+expenseIndex)
   req.user.expenses.splice(expenseIndex,1)
   await req.user.save();

   await Expense.findByIdAndDelete(req.params.id);
   res.redirect("/profile");
  } catch (error) {
    res.send(error)
  }
  
})

router.get("/update/:id",function(req,res,next){
 const expenseId = Expense.findById(req.params.id)
 res.render("update",{admin:req.user ,expenseId:expenseId, id:req.params.id})
});

router.post("/update/:id",async function(req,res,next){
  try {
    await Expense.findByIdAndUpdate(req.params.id,req.body)
     res.redirect("/profile");
  } catch (error) {
    res.send(error)
  }
  
 })

module.exports = router;
