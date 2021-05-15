const express = require('express');
const cors = require('cors')
const { create } = require('ipfs-http-client')
const upload = require('express-fileupload');
const BufferList = require('bl/BufferList');
const axios = require('axios');
const NodeCache = require( "node-cache" );

const myCache = new NodeCache();

const ipfsClient = create('https://ipfs.infura.io:5001');

app = express()
app.use(cors())
app.use(upload())

const KEY = 'AIzaSyCD5f10-K7BRGaLYreW6I5SRLMiPUocCQ8';
const date = new Date();
const todayDate = date.toISOString().split('T')[0];

const categoryMapping = {
  2 : 'Autos & Vehicles',
  1 : 'Film & Animation',
  10 : 'Music',
  15 : 'Pets & Animals',
  17 : 'Sports',
  18 : 'Short Movies',
  19 : 'Travel & Events',
  20 : 'Gaming',
  21 : 'Videoblogging',
  22 : 'People & Blogs',
  23 : 'Comedy',
  24 : 'Entertainment',
  25 : 'News & Politics',
  26 : 'Howto & Style',
  27 : 'Education',
  28 : 'Science & Technology',
  29 : 'Nonprofits & Activism',
  30 : 'Movies',
  31 : 'Anime/Animation',
  32 : 'Action/Adventure',
  33 : 'Classics',
  34 : 'Comedy',
  35 : 'Documentary',
  36 : 'Drama',
  37 : 'Family',
  38 : 'Foreign',
  39 : 'Horror',
  40 : 'Sci',
  41 : 'Thriller',
  42 : 'Shorts',
  43 : 'Shows',
  44 : 'Trailers'
}

const getData = async (path) => {
  const content = new BufferList()
  const chunks = []
  for await (const chunk of ipfsClient.cat(path)) {
    chunks.push(chunk)
  }
  return JSON.parse(Buffer.concat(chunks).toString());
}

const getCategory = async (videoId) => {
  const url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${videoId}&key=${KEY}`;
  const resp = await axios.get(url);
  try {
    const category =  categoryMapping[resp.data.items[0].snippet.categoryId];
    return category;
  } catch(error) {
    return;
  }
}

const processData = async (data) => {
  const finalData = {};
  let category;
  for (var i = 0; i < data.length; i++) {
    const watchDate = data[i].time.split('T')[0]
    if (watchDate === todayDate) {
      const videoId = data[i].titleUrl.split('=')[1];
      console.log(videoId)
      if (myCache.get(videoId)) {
        category = myCache.get(videoId)
      } else {
        category = await getCategory(videoId);
        myCache.set(videoId, category);
      }
      console.log(category)
      // Inside watchDate condition
      if (finalData[category]) {
        finalData[category] += 1;
      } else {
        finalData[category] = 1;
      }
    }
  }
  return finalData;
}

app.post('/upload', async (req, res) => {
  const file = req.files.file;
  const resp = await ipfsClient.add(file.data);
  let finalData = {};
  if (myCache.get(resp.path)) {
    console.log('already there.....')
    finalData = myCache.get(resp.path);
  } else {
    const data = await getData(resp.path);
    finalData = await processData(data);
    myCache.set(resp.path, finalData);
  }
  console.log(finalData);
  console.log(myCache.getStats());
  const response = {
    statusCode: 200,
    body: JSON.stringify(finalData)
  };
  return res.status(200).send(response);
})

app.listen(5000)
