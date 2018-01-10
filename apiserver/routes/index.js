var express = require('express');
const TinderCont = require("../../lib/index");
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post("/start_fun", (req,res,next) => {
  console.log(req.body);
  let auth_token = req.body.auth_token;
  let limit = req.body.desired_matches;

  if(!auth_token){
    return next({status: 400, message: "Dude! Dont play with me.. you know you need to pass the token"});
  }

  if(!limit){
    return next({status: 400, message: "Really ? You dont want any matches ? Think again Broh..."});
  }



  let preferences = {
    bio_required: req.body.hasOwnProperty("bio_required") ? req.body.bio_required : undefined,
    age_range : req.body.age_range || undefined,
    distance_range : req.body.

  }
  return res.json({status:1});
});

module.exports = router;
