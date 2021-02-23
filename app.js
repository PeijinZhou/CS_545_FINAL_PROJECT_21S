const express = require('express');
const app = express();
const session = require('express-session');
const static = express.static(__dirname + '/public');
const configRoutes = require('./routes');
const exphbs = require('express-handlebars');


app.use('/public', static);
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(session({
    name: 'AuthCookie',
    secret: 'some secret string!',
    resave: false,
    saveUninitialized: true
    }))

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.use('/private', (req, res, next) => {
  console.log(req.session.id);
  if (!req.session.user) {
    return res.redirect('/');
  } else {
    next();
  }
});
app.use('/login', (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/private');
  } else {
    //here I',m just manually setting the req.method to post since it's usually coming from a form
    next();
  }
});
app.use('/logout', async (req, res, next) => {
  if (!req.session.user) {
      req.session.fromOtherPage = true;
      return res.redirect('/login');
  } else {
      next();
  }
});
app.use('/registration', async (req, res, next) => {
  if (req.session.user) {
      return res.redirect('/');
  } else {
      next();
  }
});
 app.use('/ask',async (req,res,next)=>{
   if(!req.session.user){
     res.redirect('/login');
   }else{
     next();
   }
 });
 app.use('/question',async (req,res,next)=>{
  if(!req.session.user){
    res.redirect('/login');
  }else{
    next();
  }
});
 app.use('/user',async (req,res,next)=>{
  if(!req.session.user){
    res.redirect('/login');
  }else{
    next();
  }
});

configRoutes(app);
app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});
