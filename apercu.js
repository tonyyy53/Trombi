const ipcRenderer = require("electron").ipcRenderer;
const fs = require("fs");
const path = require("path");
var photos = [];
var nb_photos = 0;
var fichiers = [];
var taille_titre = 50;
var largeur_apercu = $(".page").width();
var hauteur_apercu = largeur_apercu * (297 / 210) - taille_titre;
code_html = "";
var nb_pages = 1;
page_aff=1;
page_pdf=1

var htmltoimage = require('html-to-image');

const {jsPDF} = require("jspdf");
var doc = new jsPDF("p", "px", "a4");
const pageWidth = doc.internal.pageSize.getWidth();
const pageHeight = doc.internal.pageSize.getHeight();

$(function() {
  // Désactivation des boutons  de l'application
  $('#pdf_prem').prop('disabled', true);
  $('#pdf_prec').prop('disabled', true);

  if(nb_pages>1)
  {    
    $('#pdf_suiv').prop('disabled', false);
    $('#pdf_dern').prop('disabled', false);  
  }
  else
  {
    $('#pdf_suiv').prop('disabled', true);
    $('#pdf_dern').prop('disabled', true);
  }
});

$("#titre").on("keyup", () => { 
   $('.page').hide();
   page_aff=1
   apercu(1); 
  });

  $("#soustitre").on("keyup", () => { 
    $('.page').hide();
    page_aff=1
    apercu(1); 
   });

   $('#cadrillage').on("change",() => { 
    page_aff=1
    apercu(1); 
   });

   $('#centrer').on("change",() => { 
    page_aff=1
    apercu(1); 
   });


$("#largeur").on("change", () => { 
  $('.page').hide();
  page_aff=1
  apercu(1); 
});

$("#hauteur").on("change", () => { 
  $('.page').hide();
  page_aff=1
  apercu(1);
 });

ipcRenderer.on("source", (event, chemin) => {
  $("#chemin").val(chemin.chemin_photos_recadrees);
  chemin_photos_recadrees = $("#chemin").val();
  chemin_photos_recadrees = path.normalize(chemin_photos_recadrees + "/");
  fichiers = fs.readdirSync(chemin_photos_recadrees);
  $('.page').hide();
  page_aff=1
  apercu(1);
});

$('#choix_photos_btn').on('click', () => 
{
  ipcRenderer.send('dialog_ouvrir')  
  ipcRenderer.once('selected-directory', (event, chemin)  => 
  {
    chemin_photos_recadrees=path.normalize(chemin+'/')
    $("#chemin").val(chemin_photos_recadrees);
    fichiers = fs.readdirSync(chemin_photos_recadrees);
    $('.page').hide();
    page_aff=1
    apercu(1);

  });
})

$('#pdf_suiv').on('click', () => 
{
    page_aff++
    $('#pdf_prem').prop('disabled', false);
    $('#pdf_prec').prop('disabled', false);  
    if(page_aff==nb_pages)
    {
        $('pdf_suiv').prop('disabled', true);
        $('#pdf_dern').prop('disabled', true);      
    }
    $('.page').hide();
    apercu(page_aff)
})
$('#pdf_dern').on('click', () => 
{
  page_aff=nb_pages
    $('#pdf_prem').prop('disabled', false);
    $('#pdf_prec').prop('disabled', false);  
    $('#pdf_suiv').prop('disabled', true);
    $('#pdf_dern').prop('disabled', true);  
    $('.page').hide();
    apercu(page_aff)
})

$('#pdf_prec').on('click', () => 
{
  page_aff--
    if(page_aff==1)
    {
        $('#pdf_prem').prop('disabled', true);
        $('#pdf_prec').prop('disabled', true);  
    }
    $('#pdf_suiv').prop('disabled', false);
    $('#pdf_dern').prop('disabled', false);  
    $('.page').hide();
    apercu(page_aff)
})
$('#pdf_prem').on('click', () => 
{
  page_aff=1
    $('#pdf_prem').prop('disabled', true);
    $('#pdf_prec').prop('disabled', true);  
    $('#pdf_suiv').prop('disabled', false);
    $('#pdf_dern').prop('disabled', false);  
    $('.page').hide();
    apercu(page_aff)
})


$("#pdf").on("click", () => {
  cree_pdf()
});

async function cree_pdf()
{
  $('#pdf').prop('disabled', true);
  $("#pdf").html("<span class='spinner-border spinner-border-sm' role='status'></span>&nbsp;Création du PDF...");
  
  doc = new jsPDF("p", "px", "a4");
  for (let i=1;i<=nb_pages;i++)
  {
   page_pdf=i    
 
   result = await apercu(i)
   result = await pause(1000)  
   result = await html_image(i) 
    
  }

}


$("#fermer_btn").on("click", () => { ipcRenderer.send("close-child-window"); });

function pause(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
    
  });
}
function html_image(i)
{
  
/*  largeur_apercu = $("#pdf_apercu").width();
  hauteur_apercu = $("#pdf_apercu").height();
  largeur_apercu = $("#page"+i).width();
  hauteur_apercu = $("#page"+i).height();*/


  const widthRatio = pageWidth / largeur_apercu;
  const heightRatio = pageHeight / hauteur_apercu;
  const ratio = widthRatio > heightRatio ? heightRatio : widthRatio;

  console.log(largeur_apercu + " " + pageWidth + " " + ratio)

  const canvasWidth = largeur_apercu * ratio;
  const canvasHeight = hauteur_apercu * ratio;
  return new Promise((resolve) => {
  pagediv="page"+i
  let element = document.getElementById(pagediv)
  let scale = 2;

  htmltoimage.toPng(element,{
    width: element.clientWidth * scale,
    height: element.clientHeight * scale,
    style: { transform: 'scale('+scale+')', transformOrigin: 'top ',left: '0px'}


  }).then(function(png) {
    var data = png.replace(/^data:image\/\w+;base64,/, "");
    var buf = Buffer.from(data, "base64");

    //fs.writeFileSync(chemin_photos_recadrees+'page'+i+'.png', buf)


    doc.addImage(data, "PNG", 0, 0, canvasWidth, canvasHeight);    
    if(i==nb_pages)
    {          
      doc.setProperties({
        title : $("#titre").val()
      });
      window.open(doc.output("bloburl"));
      $('.page').hide();
     
      page_aff=1
      apercu(1)  
      $("#pdf").html("<i class='far fa-file-pdf'></i> Afficher le PDF");
      $('#pdf').prop('disabled', false);  
      $('#pdf_prem').prop('disabled', true);
      $('#pdf_prec').prop('disabled', true);
    
    }   
    else doc.addPage()   

  });

  resolve(i);
});
}


function apercu(page)
{

  return new Promise((resolve) => {

  nb_photos=0
  fichiers.forEach((file) => {
    if (path.extname(file) == ".jpg" || path.extname(file) == ".JPG" ||
        path.extname(file) == ".JPEG" || path.extname(file) == ".png" ||
        path.extname(file) == ".PNG" || path.extname(file) == ".jpeg")
    {
      nb_photos++;
      photos[nb_photos] = file;
    }
  });

  titre_pdf = $("#titre").val();
  soustitre_pdf =$("#soustitre").val();
  $("#titre_pdf").html(titre_pdf);
  nb_largeur = $("#largeur").val();
  nb_hauteur = $("#hauteur").val();

  nb_photo_max = nb_largeur * nb_hauteur;
  nb_pages = Math.ceil(nb_photos / nb_photo_max)
  if( $('#cadrillage').prop("checked")) 
  {
    taille_titre = 50+(parseInt(nb_hauteur)*2);
    hauteur_apercu = largeur_apercu * (297 / 210) - taille_titre;
  }
  else
  {
    taille_titre = 50;
    hauteur_apercu = largeur_apercu * (297 / 210) - taille_titre;
  }



  var largeur_photo_max = largeur_apercu / nb_largeur;
  var hauteur_photo_max = hauteur_apercu / nb_hauteur;
  largeur_photo_max = largeur_photo_max - 10;
  hauteur_photo_max = hauteur_photo_max - 20;


  var photo_max_hauteur = Math.floor(hauteur_apercu / hauteur_photo_max);
  if (photo_max_hauteur >= nb_hauteur)
    photos_ligne = nb_hauteur;
  else
    photos_ligne = photo_max_hauteur;

  /*$('#infos').html("Max = " + photos_ligne + " - H = " + hauteur_apercu + " -
   * largeur_photo_max = " + largeur_photo_max+ " - hauteur_photo_max = " +
   * hauteur_photo_max)*/

  code_html = '<div class="container-fluid">';
  if( $('#centrer').prop("checked")) code_html += "<div class='titre text-center'>";  
  else code_html += "<div class='titre'>";  
  if (soustitre_pdf=="")
  {
    code_html += "<h1 class='m-0'>" + titre_pdf + "</h1>";  
  }
  else
  {
    code_html += "<h4 class='m-0'>" + titre_pdf + "</h4>";
    code_html += "<h6 class='m-0'>" + soustitre_pdf + "</h6>";
  }
  code_html += "</div>";  
  no_photo = (page - 1) * nb_photo_max;

  for (let i = 0; i < photos_ligne; i++)
  {

    code_html += "<div class='row'>";

    for (let j = 0; j < nb_largeur; j++)
    {

      no_photo++;
      if( $('#cadrillage').prop("checked")) 
      {
        code_html += "<div class='col m-0 p-0 text-center border colpage"+page+"'>";
      }

      
      else  code_html += "<div class='col m-0 p-0 text-center colpage"+page+"'>";
      // code_html+="<div class='grid-item'>";
      // code_html+='<img width="'+largeur_photo_max+'" src="'+chemin +
      // photos[no_photo]+'">';
      if (no_photo <= nb_photos)
      {

        code_html += '<img class="image" src="' + chemin_photos_recadrees + photos[no_photo] + '">';
        nom_etu = photos[no_photo].split(".");
        code_html += "<p id=nom_" + no_photo + " class='nom'>" + nom_etu[0] + "</p>";
      }
      code_html += "</div>";
    }
    code_html += "</div>";
  }
  code_html += "</div>";

  $("#pages_pdf").html("<label>Page : " + page + "/" + nb_pages+"</label>");
  
  //$("#pdf_apercu").html(code_html);
  

  $( "div" ).remove( "#page"+page );
  $("#pdf_apercu").append( "<div class=page id=page"+page+">"+code_html+"</div>" );
  if(nb_pages>1 && page!=nb_pages)
  {    
    $('#pdf_suiv').prop('disabled', false);
    $('#pdf_dern').prop('disabled', false);  
  }
  else
  {
    $('#pdf_suiv').prop('disabled', true);
    $('#pdf_dern').prop('disabled', true);
  }
  $(".image").css("max-height", hauteur_photo_max + "px");
  $(".nom").css("width", largeur_photo_max + "px");


  taille_police = Math.floor($(".colpage"+page).width() / 10);
  if (taille_police > 16)
    taille_police = 16;
  $("#page"+page+" .nom").css("fontSize", taille_police + "px");
  no_photo = ((page - 1) * nb_photo_max)+1;
  
  for (let i = no_photo; i < no_photo+nb_photo_max; i++)
  {

    if (i < nb_photos)
    {
   
      nouvelle_taille=taille_police
      while ($("#nom_" + i)[0].scrollWidth > $("#nom_" + i).innerWidth() + 0.5)
      {
        nouvelle_taille--;
        
        $("#nom_" + i).css("fontSize", nouvelle_taille  + "px");
      }
    }
  }

  resolve("ok");
});
}
