require("dotenv").config()

const { MongoClient } = require('mongodb');

console.log("env", process.env.USE_MONGO)
const uri = 'mongodb://localhost:8080';
const client = new MongoClient(uri);


const express = require("express"),
       app = express(),
       port = process.env.PORT || 8080,
       cors = require("cors");
const bodyParser = require('body-parser');
const fs = require("fs").promises;

app.use(cors());
app.use(bodyParser.json({ extended: true }));
app.listen(port, () => console.log("Backend server live on " + port));

app.get("/", (req, res) => {
    res.send({ message: "Connected to Backend server!" });
});

app.post("/add/item", addItem);

async function addItem (request, response) {
    try {
        // Converting Javascript object (Task Item) to a JSON string
        const id = request.body.jsonObject.id
        const task = request.body.jsonObject.task
        const curDate = request.body.jsonObject.currentDate
        const dueDate = request.body.jsonObject.dueDate
        const newTask = {
          ID: id,
          Task: task,
          Current_date: curDate,
          Due_date: dueDate
        }

        const data = await fs.readFile("database.json");
        const json = JSON.parse(data);
        json.push(newTask);
        await fs.writeFile("database.json", JSON.stringify(json))
        console.log('Successfully wrote to file') 
        response.sendStatus(200)
        if (process.env.USE_MONGO) {
            await client.connect();
            console.log('Connected successfully to server');
            const db = client.db("database.json");
            const collection = db.collection(newTask);
            collection.insertMany(newTask);
        }
    } catch (err) {
        console.log("error: ", err)
        response.sendStatus(500)
    }
};

