require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// ⬇️  Cloudinary + Multer
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
app.use(cors());
app.use(express.json());

// ─────── MongoDB ───────
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=>console.log('MongoDB connected'))
  .catch(err=>console.error('Mongo err',err));

// ─────── Models ───────
const User = mongoose.model('User', new mongoose.Schema({
  username:{type:String,required:true,unique:true},
  email:{type:String,required:true,unique:true},
  passwordHash:{type:String,required:true},
}));

const Entry = mongoose.model('Entry', new mongoose.Schema({
  userId:{ type:mongoose.Schema.Types.ObjectId, ref:'User', required:true },
  title:{ type:String, required:true },
  content:{ type:String, required:true },
  date:{ type:Date, required:true },
  location:String,
  imageUrl:String,
},{timestamps:true}));

// ─────── Cloudinary config ───────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params:{ folder:'travel-journal', allowed_formats:['jpg','jpeg','png','gif'] }
});
const upload = multer({ storage });

// ─────── JWT helper ───────
function auth(req,res,next){
  const token = req.headers.authorization?.split(' ')[1];
  if(!token) return res.sendStatus(401);
  try{
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  }catch(e){ return res.sendStatus(403); }
}

// ─────── Auth routes ───────
app.post('/auth/signup', async(req,res)=>{
  const {username,email,password}=req.body;
  if(!username||!email||!password) return res.status(400).json({msg:'Missing'});
  if(await User.findOne({$or:[{username},{email}]}))
    return res.status(400).json({msg:'Username/Email taken'});
  const hash = await bcrypt.hash(password,10);
  await User.create({username,email,passwordHash:hash});
  res.status(201).json({msg:'User created'});
});

app.post('/auth/login', async(req,res)=>{
  const {email,password}=req.body;
  const user = await User.findOne({email});
  if(!user || !(await bcrypt.compare(password,user.passwordHash)))
    return res.status(400).json({msg:'Bad credentials'});
  const token = jwt.sign({userId:user._id,username:user.username},process.env.JWT_SECRET,{expiresIn:'1d'});
  res.json({token,username:user.username});
});

// ─────── Entries CRUD ───────

// create  (קובץ או URL)
app.post('/entries', auth, upload.single('image'), async(req,res)=>{
  const { title, content, date, location, imageUrl } = req.body;
  if(!title || !content || !date) return res.status(400).json({msg:'Missing fields'});

  const finalUrl = req.file?.path || imageUrl || '';
  const entry = await Entry.create({
    userId: req.user.userId,
    title, content, date, location, imageUrl: finalUrl,
  });
  res.status(201).json(entry);
});

// read all
app.get('/entries', auth, async(req,res)=>{
  const list = await Entry.find({userId:req.user.userId}).sort({date:-1});
  res.json(list);
});

// delete
app.delete('/entries/:id', auth, async(req,res)=>{
  await Entry.findOneAndDelete({_id:req.params.id,userId:req.user.userId});
  res.sendStatus(204);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>console.log('Server on',PORT));
