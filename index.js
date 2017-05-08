'use strict'

const redis = require("redis");
const client = redis.createClient();
const REQUEST_LIMIT = 1000;
const RESET_TIME = 3600000;

client.on("error", (err) => {
	console.log(err);
});

const getIPRemaing = (ip) => {
	return new Promise((resolve, reject) => {
		client.hgetall(ip, (err, obj) => {
			if (err) reject(err);
			resolve(obj);
		});
	});
};

const setIPRemaing = (ip, obj) => {
	return new Promise((resolve, reject) => {
		const now = +new Date();
		let newValue;
		newValue = {
			remaining: obj ? obj.remaining - 1 : REQUEST_LIMIT - 1,
			resetTime: obj ? obj.resetTime : new Date(now + RESET_TIME)
		};
		client.hmset(ip, newValue);
		if (!obj) {
			client.expireat(ip, parseInt(now / 1000) + RESET_TIME / 1000);
		}
		resolve(newValue);
	});
};

async function checkLimit(ip) {
	const oldRemaining = await getIPRemaing(ip);
	const newRemaining = await setIPRemaing(ip, oldRemaining);
	return newRemaining;
};

const rateLimiter = () => (req, res, next) => {
	checkLimit(req.ip)
		.then(({ remaining, resetTime }) => {
			res.set({
				'X-RateLimit-Remaining': remaining >= 0 ? remaining : 0,
				'X-RateLimit-Reset': resetTime
			});
			if (remaining >= 0) {
				next();
			}
			else {
				res.sendStatus(429);
			}
		});
};

module.exports = rateLimiter;
