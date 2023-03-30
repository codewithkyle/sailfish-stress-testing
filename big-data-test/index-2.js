const fs = require('fs');
const glob = require('glob');
const crypto = require('crypto');

const images = {};
let responses = 0;
const token = process.argv[2];

function encodeFileToBase64(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, { encoding: 'base64' }, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}

function hash(data) {
    return crypto.createHash('md5').update(data).digest('hex');
}

async function sendRequest() {
    try {
        const request = await fetch(`http://127.0.0.1:8080/${token}`);
        if (request.status == 204){
            console.log('EOF');
            process.exit(0);
        }
        const response = await request.json();
        if (request.ok) {
            const h = hash(response.content);
            if ((!h in images)){
                console.log('Not found');
                process.exit(1);
            }
            responses++;
            console.log(responses);
        } else {
            console.error(response);
            process.exit(1);
        }
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
    setTimeout(sendRequest, 100);
}

async function loadImages(){
    const files = await glob("./images/*");
    for (const file of files){
        const b64 = await encodeFileToBase64(file);
        const h = hash(b64);
        images[h] = b64;
    }
    sendRequest();
}
loadImages();

