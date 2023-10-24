/*const {ipcRenderer} = require('electron')
const fs = require('fs');
const path = require('path')

require('popper.js');
require('bootstrap');
*/



window.onload = function() {
    


}   
/*
$ one('DOMSubtreeModified', () => {
  let $ = require('jquery');
    largeur_apercu = $("#pdf_apercu").width();
    hauteur_apercu = $("#pdf_apercu").height();
    alert(largeur_apercu)
    const widthRatio = pageWidth / largeur_apercu;
    const heightRatio = pageHeight / hauteur_apercu;
    const ratio = widthRatio > heightRatio ? heightRatio : widthRatio;

    const canvasWidth = largeur_apercu * ratio;
    const canvasHeight = hauteur_apercu * ratio;

    htmlToImage.toJpeg(document.getElementById("pdf_apercu")).then(function(png) {
        var data = png.replace(/^data:image\/\w+;base64,/, "");
        var buf = Buffer.from(data, "base64");

        fs.writeFileSync('page.png', buf)


        doc.addImage(data, "PNG", 0, 0, canvasWidth, canvasHeight);
        doc.addPage()   
    
    });
});
*/



window.addEventListener('DOMSubtreeModified', () => {
  
  const element = document.getElementById("pdf_apercu")
  
    /*const replaceText = (selector, text) => {
      const element = document.getElementById(selector)
      
      if (element) element.innerText = text
    }
  
    for (const type of ['pdf_apercu', 'node', 'electron']) {
      replaceText(`${type}-version`, process.versions[type])
    }*/
  })
