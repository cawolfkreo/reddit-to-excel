"use strict";

/* =============================================
*                   Imports
================================================*/
/**
 * Dotenv to load the variables from a .env file into the process
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
		{ header: "Id", key: "id", width: 8},
		{ header: "Title of Post", key: "title", width: 114 },
		{ header: "Body of Post", key: "body", width: 65 },
		{ header: "Author", key: "author", width: 25 },
		{ header: "Time of creation", key: "time", width: 15 },
		{ header: "Fullname of post object", key: "fullname", width: 22}
	];
	return { workbook, worksheet };
}

/**
 * Writes the workbook into a file
 */
function writeBook() {
	file.workbook.xlsx.writeFile(path)
		.then(() => {
			console.log(`[${dateNow()}] Added posts to excel file succesfully!!`);
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
 * @param {String} fullname The fullname of the last submission in the file.
 */
function getSubredditPosts(fullname) {
	if (fullname !== "") {
		return reddit.getSubreddit(SUBREDDIT).getNew({ show: "all", before:fullname })
			.fetchAll({amount:1500});
	} else {
		return reddit.getSubreddit(SUBREDDIT).getNew({ show: "all", limit: 200 });
	}
}

/**
 * Adds the information of reddit posts to the file object
 */
function addPostsToFile() {
	let last = "";
	file.worksheet.eachRow((row, numRow) => {
		if (numRow === file.worksheet.rowCount && numRow !== 1) {
			last = row.values[6]; //Gets the fullname of the last post fetched
		}
	});
	console.log(`[${dateNow()}] Getting new posts from ${SUBREDDIT}`);
	getSubredditPosts(last)
		.then( submissions => {
			console.log(`[${dateNow()}] Got ${submissions.length} posts from reddit r/${SUBREDDIT}`);
			if (submissions.length>0){
				for (let i = submissions.length - 1; i >=0; i-- ){
					const { id, title, selftext, author, created_utc, name } = submissions[i];
					const time = new Date(created_utc * 1000);
					const username = "u/"+author.name;
					const row = {id, title, body: selftext, author: username, time, fullname: name};
					file.worksheet.addRow(row);
				}
				console.log(`[${dateNow()}] Adding posts to excel file...`);
				writeBook();
			}
		})
		.catch(console.err);
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
	const res = rightNow.toISOString().slice(0, 10).replace(/-/g, "/");
	return `${res} - ${hour % 12}:${min}:${seconds>=10? seconds:"0"+seconds} ${hour > 12 ? "pm" : "am"}`;
}

/**
 * @summary Once everything is loaded, the script will execute this function
 * and it will start and create the event loop of the bot
 */
function ready() {
	const { workbook, worksheet } = createWorkbook();
	file.workbook = workbook;
	file.worksheet = worksheet;
	console.log(`[${dateNow()}] Loading excel file...`);
	loadBook()
		.then(() => {
			addPostsToFile();
			setInterval(addPostsToFile,300000);
		});
}

console.log(`[${dateNow()}] Ready!`);
/**
 * Executes the ready() function
 */
ready();