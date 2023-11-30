// Author: Andrew Naumann
// Section 1
// Description: This program allows the user to write a small journal entry talking about how they
// exemplified a principle from the book How to Win Friends and Influence People. Their
// entries are then posted to a public page where everyone can see each other's post.

// Declare variables for RDS

let port = process.env.PORT || "8081";
let hostname = process.env.RDS_HOSTNAME || "127.0.0.1";
let rds_port = process.env.RDS_PORT || "5432";
let rds_db_name = "HTWF";
let rds_username = process.env.RDS_USERNAME || "postgres";
let rds_password = process.env.RDS_PASSWORD || "Jewish66";

// Import necessary packages

const express = require("express");
let app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// Connect openai api to generate a scripture to relate to each principle.

const OpenAI = require("openai");
let dotenv = require("dotenv");
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Set up database connections

const knex = require("knex")({
  client: "pg",
  connection: {
    host: hostname,
    user: rds_username,
    password: rds_password,
    database: rds_db_name,
    port: rds_port,
  },
});

app.use(express.static(__dirname + "/"));

var currPrinciple = "";

// make get and post routes so that the user can upload their entry to the database and see the other ones that have been uploaded.

app.get("/", (req, res) => {
  knex
    .select()
    .from("principles")
    .then((result) => {
      let p = Math.floor(Math.random() * result.length);
      currPrinciple = result[p].p_name;

      res.render("index", {
        aPrinciple: result[p].p_name,
        iPKey: result[p].p_key,
      });
    });
});

// Add an entry to the database

app.post("/addresponse", (req, res) => {
  let user = req.body.username;
  let pName = currPrinciple;
  let sDescription = req.body.input;
  let date = req.body.datetime;

  knex("responses")
    .insert({
      user_name: user,
      p_name: pName,
      r_input: sDescription,
      r_date: date,
    })
    .then((results) => {
      res.redirect("responses");
    });
});

// Get all the responses from the table and send it to the responses page

app.get("/responses", (req, res) => {
  knex
    .select()
    .from("responses")
    .then((result) => {
      res.render("responses", { aResponses: result });
    });
});

// Show a generated scripture using the ChatGPT API

app.get("/scripture", async (req, res) => {
  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `What is a verse in the book of mormon or bible that could go with this principle from How to win friends and influence people: ${currPrinciple}. State the princple, the verse, and a one sentence interpretation of how they connect.`,
      },
    ],
  });

  const completionText = chatCompletion.choices[0].message.content;

  res.render("scripture", { verse: completionText });
});

app.listen(port, () => {
  console.log("the server is running.");
});
