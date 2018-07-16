const express = require('express');
const morgan = require('morgan');
const dateFormat = require('date-format');
const path = require('path');
const glob = require("glob");
const fs = require('fs');

const stichImagesToPDF = require('./app');

const imageDir = path.resolve(__dirname, 'images');

const app = express();

morgan.token('time', (req, res) => dateFormat.asString(dateFormat.ISO8601_FORMAT, new Date())); //Both morgan and log4js are configured to same date format, so that log reading is meaningful and not confusing due to different date formats
app.use(morgan('[:time] :remote-addr :method :url :status :res[content-length] :response-time ms'));

app.use(express.static(imageDir));

/*app.get("/imageHTML", function(req, res) {
  let html = `
    <div id='doc'>Waiting</div>
    <script>
      fetch('/imageDoc')
      .then(function(pdfdoc) {        
        console.log("Doc obtained")
        docElement = document.getElementById('doc');
        docElement.innerHTML = '<embed width=80% height=80% type="application/pdf" src="/imageDoc"></embed>';
      })
      .catch(function(err) {
        console.log("Error: ", err);
        docElement = document.getElementById('doc');
        docElement.innerHTML = "Error occurred " + err;
      });
    </script>
  `;
  
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
})
*/

app.get("/imageHTML", function(req, res) {
  let html = `<embed width=80% height=80% type="application/pdf" src="/imageDoc"></embed>`;
  
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
})


app.get("/imageDoc", function(req, res) {
  stichImagesToPDF((err, outPDF) => {
    if (outPDF) {
      // Read the file in binary mode, which is the default
      let dataStream = fs.createReadStream(outPDF);
      // Set no header but pipe, so that it goes out as a binary data, instead of as a attachment
      return dataStream.pipe(res);
    } else {
      return res.status(400).send({ error: "something went wrong, please try later..!" });
    }
  })
})

app.get("/images", function(req, res) {
  let options = {};
  glob(`${imageDir}/*.png`, options, function(err, files) {
    if (err) {
      console.log("Error in globing the folder ", imageDir);
      res.status(500).send({ error: "Internal error, please try later..!" });
      return;
    }
    files = files.map(f => f.replace('/Users/basavarajk/devbox/code/folderImagesToWebPage/images', ''));
    console.log(files);
    let result = "<ul>" + files.map(f => `<li><img src="${f}" width="600" style="border: 1px solid gray;"></li>`) + "</ul>";
    res.send(result);
    return;
  })
});
app.listen(3000);