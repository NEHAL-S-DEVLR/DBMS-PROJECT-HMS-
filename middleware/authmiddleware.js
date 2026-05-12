const isLoggedIn = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }

    return res.status(401).json({
        message: "Please login first",
        redirect: "/HTML/login.html",
    });
};

module.exports = isLoggedIn;
