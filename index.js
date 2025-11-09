const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config(); // ✅ load .env variables

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Be Ready to Code");
});

// ✅ Use environment variables for MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_CLUSTER}/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db(process.env.DB_NAME);
    const billsCollection = db.collection("bills");
    const myBillsCollection = db.collection("my-bills");

    // get all bills
    app.get("/bills", async (req, res) => {
      const result = await billsCollection.find().toArray();
      res.send(result);
    });

    app.get("/latest-bills", async (req, res) => {
      const result = await billsCollection.find().limit(6).toArray();
      res.send(result);
    });

    // get single bills by ID
    app.get("/bills/:id", async (req, res) => {
      const { id } = req.params;
      const result = await billsCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // get latest bids
    // app.get("/latest-models", async (req, res) => {
    //   const result = await modelCollection
    //     .find()
    //     .sort({ created_at: -1 })
    //     .limit(6)
    //     .toArray();
    //   res.send(result);
    // });

    // insert my-bills
    app.post("/my-bills", async (req, res) => {
      const data = req.body;
      const result = await myBillsCollection.insertOne(data);
      res.send(result);
    });
    // get bill by email
    app.get("/my-bills", async (req, res) => {
      const email = req.query.email;
      const myBills = await myBillsCollection.find({ email }).toArray();
      res.send(myBills);
    });
    // update my bills by id
    app.put("/my-bills/:id", async (req, res) => {
      const { id } = req.params;
      const data = req.body;
      const filter = { _id: new ObjectId(id) };
      const update = { $set: data };
      const result = await myBillsCollection.updateOne(filter, update);
      res.send(result);
    });

    // delete bills
    app.delete("/my-bills/:id", async (req, res) => {
      const { id } = req.params;
      const filter = { _id: new ObjectId(id) };
      const result = await myBillsCollection.deleteOne(filter);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log("✅ Connected to MongoDB successfully!");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
