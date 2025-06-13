
// 
// 

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// console.log(process.env.DB_USER)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.yyvxar9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

const artifactsCollections=client.db('artifactDB').collection('artifacts')


app.get('/artifacts',async(req,res)=>{
  // const cursor=artifactsCollections.find();
  // const result=await cursor.toArray();
  const result=await artifactsCollections.find().toArray();
  res.send(result);
})



app.get('/artifacts/:id',async(req,res)=>{
  const id=req.params.id;
  const query={_id: new ObjectId(id)}
  const result=await artifactsCollections.findOne(query);
  res.send(result);
})


 app.post('/artifacts',async(req,res)=>{
  const payload=req.body;
  console.log(payload);
  const result=await artifactsCollections.insertOne(payload);
  res.send(result);
 })


    app.get('/artifact/:email',async(req,res)=>{
      const email=req.params.email;
      const query={adderEmail:email}
      const cursor=artifactsCollections.find(query)
      const result=await cursor.toArray()
      res.send(result);
    })


    app.get('/arts', async (req, res) => {
  try {
    const search = req.query.search || ''; 
    const query = {
      name: { $regex: search, $options: 'i' } 
    };

    const result = await artifactsCollections.find(query).toArray();
    res.send(result);
  } catch (error) {
    console.error('Error searching artifacts:', error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});



app.put('/artifacts/:id', async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const options = { upsert: true };
  const updatedArtifact = req.body;

  const UpdatedDoc = {
    $set: {
      name: updatedArtifact.name,
      imageUrl: updatedArtifact.imageUrl,
      type: updatedArtifact.type,
      context: updatedArtifact.context,
      description: updatedArtifact.description,
      createdAt: updatedArtifact.createdAt,
      discoveredAt: updatedArtifact.discoveredAt,
      discoveredBy: updatedArtifact.discoveredBy,
      presentLocation: updatedArtifact.presentLocation,
      adderName: updatedArtifact.adderName,
      adderEmail: updatedArtifact.adderEmail,
    }
  };

  try {
    const result = await artifactsCollections.updateOne(filter, UpdatedDoc, options);
    res.send(result);
  } catch (error) {
    console.error('Error updating artifact:', error);
    res.status(500).send({ message: 'Failed to update artifact' });
  }
});



app.delete('/artifacts/:id',async(req,res)=>{
  const id=req.params.id;
  const query={_id: new ObjectId(id)}
  const result=await artifactsCollections.deleteOne(query);
  res.send(result);
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





app.get('/',(req,res)=>{
    res.send('artifacts  server is getting')
});

app.listen(port,()=>{
    console.log(`artifacts server is running on port ${port}`)
})