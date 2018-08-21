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
const {
	SUBREDDIT,
	RCLIENTID,
	RSECRET,
	RUSER,
	RPASS
} = process.env;

if (!SUBREDDIT) {
	console.error("ERROR: No SUBREDDIT env variable.\nPerhaps you forgot to add it?");
	process.exit(1);
}

if (!RCLIENTID) {
	console.error("ERROR: No RCLIENTID env variable.\nPerhaps you forgot to add it?");
	process.exit(1);
}

if (!RSECRET) {
	console.error("ERROR: No RSECRET env variable.\nPerhaps you forgot to add it?");
	process.exit(1);
}

if (!RUSER) {
	console.error("ERROR: No RUSER env variable.\nPerhaps you forgot to add it?");
	process.exit(1);
}

if (!RPASS) {
	console.error("ERROR: No RPASS env variable.\nPerhaps you forgot to add it?");
	process.exit(1);
}

/**
 * wrapper for reading/writting excel files. 
 */
const Excel = require("exceljs");

/**
 * snoowrap import.
 */
const snoowrap = require("snoowrap");

/* =============================================
*               global variables
================================================*/

/**
 * path for XLSX file
 */
const path = `./data/${SUBREDDIT}.xlsx`;

/**
 * Object that represents file data.
 */
const file = {};

/**
 * The id of the setinterval function
 */
let intervalId;

/* =============================================
*               Excel Functions
================================================*/

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
		{ header: "Id", key: "id" },
		{ header: "Title of Post", key: "title" },
		{ header: "Body of Post", key: "body" },
		{ header: "Author", key: "author" },
		{ header: "Time of creation", key: "time" }
	];
	return { workbook, worksheet };
}

/**
 * Writes the workbook into a file
 */
function writeBook() {
	file.workbook.xlsx.writeFile(path)
		.then(() => {
			console.log("excel Created!");
		})
		.catch(console.error);
}

/**
 * Loads an .xlsx file and adds it rows into the file object
 */
function loadBook() {
	return new Promise(resolve => {
		new Excel.Workbook().xlsx.readFile(path)
			.then(workbook => {
				addRows(workbook);
				resolve();
			})
			.catch(err => {
				if (err.message.includes("File not found:")) {
					console.log(`[${dateNow()}] No ${SUBREDDIT}.xlsx file found. A new one will be created on ${path}`);
					resolve();
				} else {
					console.log(err);
				}
			});
	});
}

/**
 * Adds the rows from a workbook to the workbook in the file variable.
 * @param {Excel.Workbook} workbook the workbook with the original rows
 */
function addRows(workbook) {
	workbook.eachSheet((worksheet, id) => {
		if (id === 1) {
			worksheet.eachRow(({ values: [, col1, col2, col3, col4, col5, col6] }, rownum) => {
				if (rownum > 1) {
					file.worksheet.addRow([col1, col2, col3, col4, col5, col6]);
				}
			});
		}
	});
}

/* =============================================
*                Reddit Stuff
================================================*/
/**
 * Configures the reddit wrapper with the enviroment variables.
 */
const reddit = new snoowrap({
	userAgent: "reddit posts to excel by u/cawolf_kreo",
	clientId: RCLIENTID,
	clientSecret: RSECRET,
	username: RUSER,
	password: RPASS
});

/**
 * Gets the post from the subreddit on the enviroment variables.
 */
function getSubredditPosts() {
	return reddit.getSubreddit(SUBREDDIT).getNew({ show: "all", limit: 100 });
}

/**
 * Adds the information of reddit posts to the file object, if any change was made
 */
function addPostsToFile() {
	let last = "";
	file.worksheet.eachRow((row, numRow) => {
		if (numRow === file.worksheet.rowCount) {
			last = row.values[6]; //Gets the fullname of the last post fetched
		}
	});
	if (last === "") {
		console.log("ok");
	}
}

function ready() {
	const { workbook, worksheet } = createWorkbook();
	file.workbook = workbook;
	file.worksheet = worksheet;
	loadBook()
		.then(() => {
			addPostsToFile();
		});
}

/* =============================================
*              General Functions
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
	return `${res} - ${hour}:${min}:${seconds}:${milis} ${hour > 12 ? "pm" : "am"}`;
}


// function ready() {
// 	const { workbook, worksheet } = createWorkbook();
// 	file.workbook = workbook;
// 	file.worksheet = worksheet;
// 	// file.worksheet.addRow({id:1, title:"wea", body:"la Wea", author:"sho", time: new Date()});

// 	// writeBook();
// 	loadBook()
// 		.then(addRows)
// 		.catch(console.error);
// }

console.log(`[${dateNow()}] Ready!`);
/**
 * Executes the ready() function
 */
ready();