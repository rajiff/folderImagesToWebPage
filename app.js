const fs = require("fs");
const path = require('path');
const glob = require("glob");
const RenderPDF = require('chrome-headless-render-pdf');

module.exports = function (done) {
  const imageDir = path.resolve(__dirname, 'images');
  const inHTML = path.resolve(__dirname, "images.html");
  const outPDF = path.resolve(__dirname, "out", "images.pdf");
  let options = {};
  
  glob(`${imageDir}/*.png`, options, function(err, files) {
    if (err) {
      console.log("Error in globing the folder ", imageDir);
      return done({ error: "Internal error, please try later..!" });
    }
    files = files.map(f => f.replace('/Users/basavarajk/devbox/code/folderImagesToWebPage/images', './images'));
    console.log(files);
    let result = "<ul>" + files.map(f => `<li><img src="${f}" width="900" style="border: 1px solid gray;"></li>`) + "</ul>";
    fs.writeFileSync(inHTML, result, 'utf8');
    // renderPDF(inHTML, outPDF)
    RenderPDF
      .generateSinglePdf(`file://${inHTML}`, outPDF, { landscape: true, includeBackground: true, noMargins: false })
      .then(result => {
        console.log("Generated PDF result ", result);
        return done(null, outPDF);
      })
      .catch(err => {
        console.log("Error in generating PDF, ERROR::", err);
        return done({error: err});
      });
  })
}
