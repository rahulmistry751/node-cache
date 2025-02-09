import express from 'express'
import Redis from 'ioredis'
import { MAX_CACHE_SIZE, PORT } from './constants.js';

const app = express();

const redis = new Redis({
    host:'127.0.0.1',
    port:6379,
});

app.use(express.json())

app.post('/cache',async (req,res)=>{
    const currentSize = await redis.keys('*');
    if(currentSize>=MAX_CACHE_SIZE){
        return res.status(400).json({error:true, message: 'Cache size exceeded. Cannot store more items.'})

    }

    const {key,value}= req.body;
    if(!key|| !value){
        return res.status(400).json({error:true, message: 'Key and Value must be provided.'})
    }

    await redis.set(key,value);

    return res.status(200).json({error:false, message:'Item stored successfully.'})
})

app.get('/cache/:key',async(req,res)=>{
    const {key}= req.params
    const value = await redis.get(key);
    if(!value){
        return res.status(404).json({error:true, message:'Key not found.'})
    }
    
    return res.status(200).json({error:false, key,value})
})


app.delete('/cache/:key',async(req,res)=>{
    const {key}= req.params;
    const exists = await redis.exists(key);
    if(!exists){
        return res.status(404).json({error:true, message:'Key not found.'})

    }   
    await redis.del(key);
    return res.status(200).json({error:false, message:'Item removed from cache.'})

})

app.get('/ping',async(req,res)=>{
    return res.status(200).json({message:'pong'})
})


app.listen(PORT,()=>{
    console.log(`Cache API running on http://localhost:${PORT}`)
})