"use strict";

/* =============================================
*                   Imports
================================================*/
/**
 * Dotenv to load the .env variables into the process
 */
require("dotenv").config();

/**
 * Gets the .env values
 */
const { SUBREDDIT } = process.env;

if(!SUBREDDIT) {
	console.error("ERROR: No SUBREDDIT env variable.\nPerhaps you forgot to add it?");
	process.exit(1);
}

/**
 * wrapper for reading/writting excel files. 
 */
const Excel = require("exceljs");

/**
 * Object with global data.
 */
const global = {};



/* =============================================
*                  Functions
================================================*/

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


function ready() {
	const { workbook, worksheet } = createWorkbook();
	global.workbook = workbook;
	global.worksheet = worksheet;
	global.worksheet.addRow({id:1, title:"wea", body:"la Wea", author:"sho", time: new Date()});

	workbook.xlsx.writeFile(`./data/${SUBREDDIT}.xlsx`)
		.then(() => {
			console.log("excel Created!");
		})
		.catch(err => console.error(err));
}

/**
 * Creates a standard workbook with a worksheet
 */
function createWorkbook() {
	const current = new Date();
	const workbook = new Excel.Workbook();
	workbook.creator = "js bot";
	workbook.created = current;
	workbook.modified = current;
	
	const worksheet = workbook.addWorksheet(SUBREDDIT);

	worksheet.columns = [
		{header: "Id", key: "id"},
		{header: "Title of Post", key: "title"},
		{header: "Body of Post", key: "body"},
		{header: "Author", key: "author"},
		{header: "Time of creation", key:"time"}
	];
	return {workbook, worksheet};
}

console.log(`[${dateNow()}] Ready!`);
ready();