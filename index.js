const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();

const port = process.env.PORT || 5000;

// middleware

app.use(express.json());
app.use(cors());

// console.log(process.env.DB_USER);
// console.log(process.env.DB_PASS);

// mongodb--->
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7pf2bll.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const equipmentCollection = client
      .db("equipmentDB")
      .collection("equipment");

    // app.get("/equipment", async (req, res) => {
    //   const cursor = equipmentCollection.find();
    //   const result = await cursor.toArray();
    //   res.send(result);
    // });

    app.post("/equipment", async (req, res) => {
      const newEquipment = req.body;
      console.log(newEquipment);
      const result = await equipmentCollection.insertOne(newEquipment);
      res.send(result);
    });

    app.put("/equipment/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateEquipment = req.body;
      const equipment = {
        $set: {
          name: updateEquipment.name,
          image: updateEquipment.image,
          category: updateEquipment.category,
          price: updateEquipment.price,
          rating: updateEquipment.rating,
          processingTime: updateEquipment.processingTime,
          stock: updateEquipment.stock,
          customization: updateEquipment.customization,
          description: updateEquipment.description,
        },
      };

      const result = await equipmentCollection.updateOne(
        filter,
        equipment,
        options
      );
      res.send(result);
    });

    app.delete("/equipment/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await equipmentCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/equipment/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await equipmentCollection.findOne(query);
      res.send(result);
    });

    // limit-6 data 
    app.get("/equipment", async (req, res) => {
      try {
        const category = req.query.category;
        // const query = category ? { category } : {};
        const query = category
          ? { category: { $regex: category, $options: "i" } }
          : {};


        const result = await equipmentCollection.find(query).limit(6).toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching equipment:", error);
        res.status(500).send("Error fetching equipment");
      }
    });


    
    app.get("/allequipment", async (req, res) => {
      try {
        const result = await equipmentCollection.find({}).toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching all equipment:", error);
        res.status(500).send("Error fetching all equipment");
      }
    });


    app.get("/equipment", async (req, res) => {
      try {
        const result = await equipmentCollection.find({}).toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching equipment:", error);
        res.status(500).send("Error fetching equipment");
      }
    });
    
    

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("hello");
});

app.listen(port, () => {
  console.log("Server is Running...");
});
