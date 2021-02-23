const userRoutes = require("./users");
const askRoutes = require('./ask')
const loginRoutes = require('./login');
const mainRoutes = require('./main');
const questionRoutes = require('./question');
const registrationRoutes = require("./registration");
const logoutRoutes = require("./logout");
const resetRoutes = require("./reset");
const constructorMethod = (app) => {
    app.use('/user', userRoutes);
    app.use('/ask', askRoutes);
    app.use('/question', questionRoutes);
    app.use('/registration', registrationRoutes);
    app.use('/login',loginRoutes);
    app.use('/reset', resetRoutes)
    app.use('/logout',logoutRoutes);
    app.use('/',mainRoutes)
    app.use("*", (req, res) => {
        res.redirect("/");
    })
}

module.exports = constructorMethod;
