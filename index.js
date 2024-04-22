// const express = require('express');
// const bodyParser = require('body-parser');
// const fs = require('fs');
// const stream = require('stream');

// const app = express();


// app.use(bodyParser.raw({ limit: '50mb', extended: true }));
// app.use(bodyParser.json({ limit: '50mb' })); // Adjust '50mb' as needed
// app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
// // Customize the file storage path
// // const filePath = './uploads/data.txt'; 

// // const JSONStream = require('JSONStream');

   

// app.post('/upload', (req, res) => {
//   const data = req.body;
//   const fileName = data.folderName + '/' + data.fileName;
//   fs.writeFile(fileName, data.content, (err) => {
//     if (err) {
//       res.status(500).send('Error writing file' )
//     } else {
//       res.status(200).send('File written successfully');
//     }
//   });
// });
// app.post('/uploadfilestream', (req, res) => {
//     const data = req.body;
//     const fileName = data.folderName + '/' + data.fileName;
//     const writeStream = fs.createWriteStream(fileName);
//     writeStream.write(data.content);
//     writeStream.end();
//     res.status(200).send('File written successfully');
//   });

//   app.post('/write-data', (req, res) => {
//     const writeStream = fs.createWriteStream('./uploads/data.txt', { mode: 0o755 }, { flags: 'a' });

//     const readableStream = stream.Readable.from(req.body.content);
    
//     readableStream.pipe(writeStream)
//       .on('finish', () => {
//         console.log('Data written to file successfully');
//         res.status(200).send('Data written to file successfully');
//       });
  
//   });

// app.listen(3000, () => {
//   console.log('Server listening on port 3000');
// });  



// Load the necessary modules and define a port
const express = require('express');
const app = express();
app.use(express.json());
//app.use(express.text());
const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 3000;

// Take in the request & filepath, stream the file to the filePath
const uploadFile = (req, filePath) => {
  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(filePath);
    // With the open - event, data will start being written
    // from the request to the stream's destination path
    stream.on('open', () => {
      console.log('Stream open ...  0.00%');
      req.pipe(stream);
    });

    // Drain is fired whenever a data chunk is written.
    // When that happens, print how much data has been written yet.
    stream.on('drain', () => {
      const written = parseInt(stream.bytesWritten);
      const total = parseInt(req.headers['content-length']);
      const pWritten = ((written / total) * 100).toFixed(2);
      console.log(`Processing  ...  ${pWritten}% done`);
    });

    // When the stream is finished, print a final message
    // Also, resolve the location of the file to calling function
    stream.on('close', () => {
      console.log('Processing  ...  100%');
      resolve(filePath);
    });
    // If something goes wrong, reject the primise
    stream.on('error', (err) => {
      console.error(err);
      reject(err);
    });
  });
};

// Add a basic get - route to check if server's up
app.get('/', (req, res) => {
  res.status(200).send(`Server up and running`);
});

// Add a route to accept incoming post requests for the fileupload.
// Also, attach two callback functions to handle the response.
app.post('/', (req, res) => {
  const filePath = path.join(__dirname, `/output.txt`);

  result = req.body.toString().replace(/[\u007F-\uFFFF]/g, function(chr) {
    return "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).substr(-4)
  });

  uploadFile(result, filePath)
    .then((path) => res.send({ status: 'success', path }))
    .catch((err) => res.send({ status: 'error', err }));
});

app.post('/write-without-stream', (req, res) => {
  const filePath = path.join(__dirname, `/output.txt`);
  const { content } = req.body;

  const writeStream = fs.createWriteStream('output.txt');
  writeStream.write(content);
  writeStream.end();

  res.status(200).send('File written successfully');
});

// Mount the app to a port;
app.listen(port, () => {
  console.log('Server running at http://127.0.0.1:3000/');
});
