const express = require('express');
const cors = require('cors');
require('dotenv').config()
const jwt=require('jsonwebtoken')
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
        const wishlistCollections = client.db("Tour-Terra").collection("wishlist");
        const tourGuidesCollections = client.db("Tour-Terra").collection("tourGuides");
        const touristCollections = client.db("Tour-Terra").collection("tourists");
        const reviewCollections = client.db("Tour-Terra").collection("reviews");
        const blogsCollections = client.db("Tour-Terra").collection("blogs");
        // const commentsCollections = client.db("Tour-Terra").collection("comments");


        // jwt related API
        app.post('/jwt',async(req,res)=>{
            const tourist=req.body;
            const token=jwt.sign(tourist,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'})
            res.send({token})
        })
        // middleware

        const verifyToken=(req,res,next)=>{
            console.log('inside verify token',req.headers.authorization)
            if(!req.headers.authorization){
                return res.status(401).send({message: 'unAuthorized access'});
            }
            const token=req.headers.authorization.split(' ')[1];
            jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
                if(err){
                    return res.status(401).send({message: 'unAuthorized access'});
                }
                req.decoded=decoded;
                next()
            })
        }

        // users related API
        app.get('/tourists',verifyToken,async(req,res)=>{
            const cursor=await touristCollections.find().toArray()
            res.send(cursor)
        })

        app.get('/tourists/admin/:email',verifyToken,async(req,res)=>{
            const email=req.params.email;
            if(email !== req.decoded.email){
                return res.status(403).send({message: 'Forbidden access'});
            }
            const query={email:email}
            const result= await touristCollections.findOne(query)
            let admin=false;
            if(result){
                admin=result?.role==='admin'
            }
            res.send({admin})
        })
        app.get('/tourists/tourGuide/:email',verifyToken,async(req,res)=>{
            const email=req.params.email;
            if(email !== req.decoded.email){
                return res.status(403).send({message: 'Forbidden access'});
            }
            const query={email:email}
            const result= await touristCollections.findOne(query)
            let tourGuide=false;
            if(result){
                tourGuide=result?.role==='tour guide'
            }
            res.send({tourGuide})
        })
        app.post('/tourists',async(req,res)=>{
            const tourist=req.body;
            const query={email:tourist.email}
            const existingTourist=await touristCollections.findOne(query)
            if(existingTourist){
                return res.send({message:'tourist already exists',insertedId:null})
            }
            const result=await touristCollections.insertOne(tourist)
            res.send(result)
        })
        app.patch('/tourists/:id',async(req,res)=>{
            const id=req.params.id;
            const query={_id:new ObjectId(id)}
            const existingRole=req.body;
            const updatedRole={
                $set:{
                    role:existingRole.role
                }
            }
            const result=await touristCollections.updateOne(query,updatedRole)
            res.send(result)
        })


        // package related API
        app.post('/packages',async(req,res)=>{
            const package=req.body
            const cursor= await packageCollections.insertOne(package)
            res.send(cursor)
        })
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
        app.get('/tourGuides/guide/:email',async(req,res)=>{
            const email=req.params.email;
            const query={tourGuideEmail:email}
            const cursor=await tourGuidesCollections.findOne(query)
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
        app.get('/tourBookings/guide/:name',async(req,res)=>{
            const name=req.params.name;
            const query={guideName:name}
            const cursor=await bookingCollections.find(query).toArray()
            res.send(cursor)
        })
        app.delete('/tourBookings/guide/:id',async(req,res)=>{
            const id=req.params.id;
            const query={tourId: id}
            const result=await bookingCollections.deleteOne(query)
            res.send(result)
        })
        app.patch('/tourBookings/guide/:id',async(req,res)=>{
            const id=req.params.id;
            const query={tourId: id}
            const existingStatus=req.body
            const updatedStatus={
                $set:{
                    status:existingStatus.status
                }
            }
            const result=await bookingCollections.updateOne(query,updatedStatus)
            res.send(result)
        })
        app.delete('/tourBookings/:id',async(req,res)=>{
            const id=req.params.id;
            const query={_id: new ObjectId(id)}
            const result=await bookingCollections.deleteOne(query)
            res.send(result)
        })
        // whistle related API

        app.post('/wishlist',async(req,res)=>{
            const package=req.body;
            const query={tourId:package.tourId}
            const existingTour=await wishlistCollections.findOne(query)
            if(existingTour){
                return res.send({message:'Tour Already Added',insertedId:null})
            }
            const result=await wishlistCollections.insertOne(package)
            res.send(result)
        })

        app.get('/wishlist/:email',async(req,res)=>{
            const email=req.params.email;
            const query={email: email}
            const result=await wishlistCollections.find(query).toArray()
            res.send(result)
        })

        app.delete('/wishlist/:id',async(req,res)=>{
            const id=req.params.id;
            const query={_id: new ObjectId(id)}
            const result=await wishlistCollections.deleteOne(query)
            res.send(result)
        })
        // review related API

        app.get('/reviews',async(req,res)=>{
            const cursor=await reviewCollections.find().toArray()
            res.send(cursor)
        })
        app.post('/reviews',async(req,res)=>{
            const review=req.body;
            const cursor=await reviewCollections.insertOne(review)
            res.send(cursor)
        })

        // blogs related API
        app.get('/blogs',async(req,res)=>{
            const cursor=await blogsCollections.find().toArray()
            res.send(cursor)
        })
        app.get('/blogs/:id',async(req,res)=>{
            const id=req.params.id
            const query={_id: new ObjectId(id)}
            const cursor=await blogsCollections.findOne(query)
            res.send(cursor)
        })
        app.post('/blogs',verifyToken,async(req,res)=>{
            const blog=req.body;
            const cursor=await blogsCollections.insertOne(blog)
            res.send(cursor)
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