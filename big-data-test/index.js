const fs = require('fs');
const glob = require('glob');
const crypto = require('crypto');

const images = {};
const imgHashes = [];
let responses = 0;
let imgIdx = 0;
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
    imgIdx++;
    if (imgIdx >= imgHashes.length) {
        imgIdx = 0;
    }
    try {
        const request = await fetch(`http://127.0.0.1:8080/${token}`, {
            method: 'PUT',
            body: images[imgHashes[imgIdx]],
        });
        if (request.status === 202) {
            responses++;
            console.log(responses);
            if (responses === 10_000) {
                process.exit(0);
            }
            sendRequest();
        } else {
            const response = await request.text();
            console.log(response);
        }
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

async function loadImages(){
    const files = await glob("./images/*");
    for (const file of files){
        const b64 = await encodeFileToBase64(file);
        const h = hash(b64);
        images[h] = b64;
        imgHashes.push(h);
    }
    sendRequest();
}
loadImages();

