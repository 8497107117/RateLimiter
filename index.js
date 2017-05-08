'use strict'

const rateLimiter = () => (req, res, next) => {
	next();
};

module.exports = rateLimiter;
