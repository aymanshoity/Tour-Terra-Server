const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;

// middlewares
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.je93mhd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const packageCollections = client.db("Tour-Terra").collection("packages");
        const bookingCollections = client.db("Tour-Terra").collection("tourBookings");
        const whistleCollections = client.db("Tour-Terra").collection("whistle");
        const tourGuidesCollections = client.db("Tour-Terra").collection("tourGuides");



        // package related API
        app.get('/packages',async(req,res)=>{
            const cursor= await packageCollections.find().toArray()
            res.send(cursor)
        })
        app.get('/packages/:id',async(req,res)=>{
            const id=req.params.id;
            const query={_id: new ObjectId(id)}
            const cursor= await packageCollections.findOne(query)
            res.send(cursor)
        })
        // TourGuide Section
        app.get('/tourGuides',async(req,res)=>{
            const cursor=await tourGuidesCollections.find().toArray()
            res.send(cursor)
        })
        app.get('/tourGuides/:id',async(req,res)=>{
            const id=req.params.id;
            const query={_id:new ObjectId(id)}
            const cursor=await tourGuidesCollections.findOne(query)
            res.send(cursor)
        })
        // tour Booking related API
        app.post('/tourBookings',async(req,res)=>{
            const tour=req.body;
            const booking= await bookingCollections.insertOne(tour)
            res.send(booking)
        })
        app.get('/tourBookings',async(req,res)=>{
            const cursor=await bookingCollections.find().toArray()
            res.send(cursor)
        })
        app.get('/tourBookings/:email',async(req,res)=>{
            const email=req.params.email;
            const query={email:email}
            const cursor=await bookingCollections.find(query).toArray()
            res.send(cursor)
        })
        // whistle related API

        app.post('/whistle',async(req,res)=>{
            const package=req.body;
            const query={tourId:package.tourId}
            const existingTour=await whistleCollections.findOne(query)
            if(existingTour){
                return res.send({message:'Tour Already Added',insertedId:null})
            }
            const result=await whistleCollections.insertOne(package)
            res.send(result)
        })

        app.get('/whistle/:email',async(req,res)=>{
            const email=req.params.email;
            const query={email: email}
            const result=await whistleCollections.find(query).toArray()
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("Tour Terra is starting it's journey")
})
app.listen(port, () => {
    console.log(`Tour Terra is starting journey on port ${port}`)
})