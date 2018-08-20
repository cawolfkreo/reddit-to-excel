"use strict";
console.log(`[${dateNow()}] Ready!`);

/** This function generates a new date with the current
* time and parses it into a string for logging
* purposes.*/
function dateNow() {
	const rightNow = new Date();
	const hour = rightNow.getHours();
	const min = rightNow.getMinutes();
	const seconds = rightNow.getSeconds();
	const milis = rightNow.getMilliseconds();
	const res = rightNow.toISOString().slice(0, 10).replace(/-/g, "/");
	return `${res} - ${hour}:${min}:${seconds}:${milis} ${hour > 12? "pm":"am"}`;
}