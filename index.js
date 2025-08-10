
// 
// 
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const admin = require("firebase-admin");

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


// Initialize Firebase Admin SDK
const serviceAccount = require("./FIREBASE_SERVICE_ACCOUNT.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// JWT verification middlewar
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({ error: true, message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return res.status(403).send({ error: true, message: "Forbidden" });
  }
};




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
    // await client.connect();

const artifactsCollections=client.db('artifactDB').collection('artifacts')

// All
app.get('/artifacts',async(req,res)=>{
  // const cursor=artifactsCollections.find();
  // const result=await cursor.toArray();
  const result=await artifactsCollections.find().toArray();
  res.send(result);
})


// Top Liked
app.get('/top-liked-artifacts', async (req, res) => {
  const result = await artifactsCollections
    .find({ likes: { $exists: true } })
    .toArray();

  const sorted = result
    .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
    .slice(0, 6);

  res.send(sorted);
});



// details er jonno single id diye
app.get('/artifacts/:id',async(req,res)=>{
  const id=req.params.id;
  const query={_id: new ObjectId(id)}
  const result=await artifactsCollections.findOne(query);
  res.send(result);
})


 app.post('/artifacts',verifyToken,async(req,res)=>{
  const payload=req.body;

if (!payload.likes) {
      payload.likes = [];
    }

  console.log(payload);
  const result=await artifactsCollections.insertOne(payload);
  res.send(result);
 })


//  my artifacts
    app.get('/artifact/:email',verifyToken,async(req,res)=>{
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


// update 
app.put('/artifacts/:id',verifyToken, async (req, res) => {
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


// Toggle like/dislike an artifact
app.patch('/artifacts/:id/toggleLike', async (req, res) => {
  const artifactId = req.params.id;
  const { email } = req.body;

  try {
    const artifact = await artifactsCollections.findOne({ _id: new ObjectId(artifactId) });
    if (!artifact) {
      return res.status(404).send({ message: 'Artifact not found' });
    }

    let updatedLikes;
    let liked;

    if (Array.isArray(artifact.likes) && artifact.likes.includes(email)) {
      // Dislike
      updatedLikes = artifact.likes.filter(e => e !== email);
      liked = false;
    } else {
      // Like
      updatedLikes = Array.isArray(artifact.likes) ? [...artifact.likes, email] : [email];
      liked = true;
    }

    await artifactsCollections.updateOne(
      { _id: new ObjectId(artifactId) },
      { $set: { likes: updatedLikes } }
    );

    res.send({
      liked,
      likesCount: updatedLikes.length
    });

  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
});




app.get('/liked-artifacts', async (req, res) => {
  try {
    
    const likedArtifacts = await artifactsCollections
      .find({ likes: { $exists: true, $ne: [] } })
      .toArray();

    res.send(likedArtifacts);
  } catch (error) {
    console.error('Failed to fetch liked artifacts:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});



app.delete('/artifacts/:id',verifyToken,async(req,res)=>{
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