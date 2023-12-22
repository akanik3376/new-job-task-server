const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 3000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

const uri = "mongodb+srv://task-manager:io8wifApxC5M46CB@cluster0.vfr78tp.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();

        const database = client.db("taskManagementDB");
        const taskCollection = database.collection("task");

        app.get("/api/v1/show-all-task/:email", async (req, res) => {
            const routeParamEmail = req.params.email;
            const queryParamEmail = req.query.email;

            const email = routeParamEmail || queryParamEmail;

            let query = {};
            if (email) {
                query = { email };
            }

            try {
                const result = await taskCollection.find(query).toArray();
                res.send(result);
            } catch (error) {
                console.error('Error fetching tasks:', error);
                res.status(500).send('Internal Server Error');
            }
        });

        app.get("/api/v1/show-all-task", async (req, res) => {
            const result = await taskCollection.find().toArray();
            res.send(result);

        });


        app.delete('/api/v1/show-all-task/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await taskCollection.deleteOne(query)
            res.send(result)
        })

        app.get('/api/v1/show-task/:id', async (req, res) => {
            const id = req.params.id

            const query = { _id: new ObjectId(id) }
            const result = await taskCollection.findOne(query)
            res.send(result)
        })

        app.patch("/api/v1/update/:id", async (req, res) => {
            const taskData = req.body;
            console.log(taskData);

            const taskId = req.params.id;
            console.log(taskId);

            const query = { _id: new ObjectId(taskId) };
            console.log(query);

            const editTask = {
                $set: {
                    title: taskData.title,
                    category: taskData.category,
                    date: taskData.date,
                    description: taskData.description,
                    userEmail: taskData.userEmail,
                },
            };

            try {
                const result = await taskCollection.updateOne(query, editTask);

                if (result.modifiedCount > 0) {
                    res.json({ modifiedCount: result.modifiedCount });
                } else {
                    res.status(404).json({ message: 'Task not found or no changes applied' });
                }
            } catch (error) {
                console.error('Error updating task:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });
        app.post("/api/v1/create-task", async (req, res) => {
            const task = req.body;

            const result = await taskCollection.insertOne(task);
            res.json({ insertedId: result.insertedId });
        });

        client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (error) {
        console.error("Error during MongoDB connection or route handling:", error);
    } finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get("/", (req, res) => {
    res.send('Server is running...');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
