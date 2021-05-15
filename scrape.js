const fs = require('fs');


const PATH1 = 'video-id.json';
const PATH2 = 'hash-path.json';
let add1, add2;

fs.readFile(PATH1, (err, data) => {
  if(err) {
    console.log(err);
  } else {
    add1 = JSON.parse(data);
  }
})

fs.readFile(PATH2, (err, data) => {
  if(err) {
    console.log(err);
  } else {
    add2 = JSON.parse(data);
  }
})


const writeKey = (path, add, key, value) => {
  add[key] = value;
  fs.writeFileSync(path, JSON.stringify(add), (error) => {
    if(error) {
      console.log(error);
    } else {
      console.log('uploaded');
    }
  });
}
