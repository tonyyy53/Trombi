const {ipcRenderer} = require('electron')
const fs = require('fs');
const path = require('path')

var chemin_photos=""
var chemin_photos_recadrees=""
var photos=[]
var nb_photos=0
var photo_aff=0

var mousedown = false;
var select_deb_x=0
var select_deb_y=0

var larg_img=0
var haut_img=0
var identite_prec=""
var ext_prec=""

// Dimension et positionnement initial de la photo
var img_pos=$(".original_img").offset();  
var largeur_original=$(".original_img").width()
var hauteur_original=$(".original_img").height()

// Empeche le drag'n'drop sur les images
$('img').on('dragstart', function(event) { event.preventDefault(); });


// Désactivation des boutons  de l'application
$('#photo_suiv').prop('disabled', true); 
$('#photo_prec').prop('disabled', true); 
$('#photo_prem').prop('disabled', true); 
$('#photo_dern').prop('disabled', true); 
$('#photo_recadrer').prop('disabled', true); 
$('.case_original').css("visibility", "hidden");
$('.case_recadree').css("visibility", "hidden");
$('#navig').css("visibility", "hidden");



// Souris

$(".original").mousedown(function(event) 
{  
  
  select_deb_x=event.pageX-img_pos.left
  select_deb_y=event.pageY-img_pos.top  
  $(".cache").css("left",select_deb_x);  
  $(".cache").css("top",select_deb_y);
  
  $(".cache").width(0);
  $(".cache").height(0);  
  largeur_cache=0
  hauteur_cache=0
  larg_img=$("#original_img").width()
  haut_img=$("#original_img").height()
  mousedown = true;  

  
})


$(".cache").mousedown(function(event) 
{  
  
  select_deb_x=event.pageX-img_pos.left
  select_deb_y=event.pageY-img_pos.top  
  $(".cache").css("left",select_deb_x);  
  $(".cache").css("top",select_deb_y);
  
  $(".cache").width(0);
  $(".cache").height(0);  
  largeur_cache=0
  hauteur_cache=0
  larg_img=$("#original_img").width()
  haut_img=$("#original_img").height()
  mousedown = true;  
})

$(".original").mouseover(function(event) 
{
  //Changer le pointer
})


$(".original").mousemove(function(event) 
{
  img_pos=$(".original").offset();  
  if(mousedown) 
  {
    largeur=(event.pageX-img_pos.left)-select_deb_x
    //hauteur=(event.pageY-img_pos.top)-select_deb_y    
    hauteur=largeur*(9/7) //Ratio d'une photo d'identité
    $(".cache").width(largeur);
    $(".cache").height(hauteur);  

    largeur_cache=largeur
    hauteur_cache=hauteur  
  }
})

$(".cache").mouseup(function(event) 
{
  mousedown = false;  
  largeur_cache=largeur
  hauteur_cache=hauteur
  pret()

 
  
})

$(".cache").mousemove(function(event) 
{
  
  img_pos=$(".original").offset();       
  if(mousedown) 
  {
    largeur=(event.pageX-img_pos.left)-select_deb_x
    hauteur=(event.pageY-img_pos.top)-select_deb_y    
    $(".cache").width(largeur);
    $(".cache").height(hauteur);  
    $(".cadre").width(largeur);
    $(".cadre").height(hauteur);  
    largeur_cache=largeur
    hauteur_cache=hauteur
  }
})

$(".original").mouseup(function(event) 
{
  mousedown = false;  
  largeur_cache=largeur
  hauteur_cache=hauteur
  pret()
  recadrer()
  $('.case_recadree').css("visibility", "visible");
})

$('#identite').on('focusout', () => {

  //alert(identite_prec+"=>"+$('#identite').val())
  nouveau_nom= $('#identite').val()+'.'+$('#ext').val()
  fs.renameSync(chemin_photos+identite_prec+'.'+ext_prec,chemin_photos+nouveau_nom)
  photos[photo_aff]=nouveau_nom
  if(chemin_photos_recadrees!='')
  {
    fs.access(chemin_photos_recadrees+identite_prec+'.'+ext_prec, fs.constants.F_OK, (erreur) => {
      if (erreur) {
        console.log('Le fichier n\'existe pas.');
      } else {
        fs.renameSync(chemin_photos_recadrees+identite_prec+'.'+ext_prec,chemin_photos_recadrees+nouveau_nom)
      }
    });
  }
  


})

$('#identite').on('focusin', () => {
  identite_prec=$('#identite').val()
  ext_prec=$('#ext').val()

})

$(document).mouseup(function(event) 
{
  mousedown = false;  

  pret()
})


$('#dossier_originales_btn').on('click', () => 
{
  ipcRenderer.send('dialog_ouvrir')  
  ipcRenderer.once('selected-directory', (event, chemin)  => 
  {
    chemin=path.normalize(chemin+'/')
    if(chemin!=chemin_photos)
    { 
        chemin_photos=path.normalize(chemin+'/')
   
        fs.readdir(chemin_photos, (err, files) => 
        {            
            nb_photos=0
            files.forEach(file => 
            {                                     
                if(path.extname(file) == ".jpg" || path.extname(file) == ".JPG" || path.extname(file) == ".JPEG" || path.extname(file) == ".png" || path.extname(file) == ".PNG" || path.extname(file) == ".jpeg") 
                {      
                    nb_photos++   
                    photos[nb_photos]=file                
                }
            });
            if(nb_photos>0) 
            {                
                photo_aff=1
                $('#photo_suiv').prop('disabled', false);
                $('#photo_dern').prop('disabled', false);  
                affiche_original(photos[1])
                $('.case_original').css("visibility", "visible");
                $('#navig').css("visibility", "visible");
                
            }
        })
        $('#dossier_originales').html('<small><strong>Photos originales :</strong> '+chemin_photos+'</small>')   
        // Si le dossier est un lectue seule on ne propose pas de changer le nom de la personne
        fs.access(chemin_photos, fs.constants.F_OK, (erreur) => {
          if (erreur) {
            $('#identite').prop('disabled', true); 
            console.error('En lecture seule');
          } else {
            $('#identite').prop('disabled', false); 
          }
        });

        pret()


    }
  })

})

$('#dossier_recadrees_btn').on('click', () => 
{
  ipcRenderer.send('dialog_ouvrir')  
  ipcRenderer.once('selected-directory', (event, chemin)  => 
  {
    chemin=path.normalize(chemin+'/')
    if(chemin!=chemin_photos_recadrees)
    { 
        chemin_photos_recadrees=path.normalize(chemin+'/')
    }
    $('#dossier_recadrees').html('<small><strong>Photos recadrées :</strong> '+chemin_photos_recadrees+'</small>')   
    pret()
    if(chemin_photos!="") 
    {
      recadrer_defaut()
      $('.case_recadree').css("visibility", "visible");
    }


  })

})

$('#photo_suiv').on('click', () => 
{
    photo_aff++
    $('#photo_prem').prop('disabled', false);
    $('#photo_prec').prop('disabled', false);  
    if(photo_aff==nb_photos)
    {
        $('#photo_suiv').prop('disabled', true);
        $('#photo_dern').prop('disabled', true);  
    
    }
    affiche_original(photos[photo_aff])
})
$('#photo_dern').on('click', () => 
{
    photo_aff=nb_photos
    $('#photo_prem').prop('disabled', false);
    $('#photo_prec').prop('disabled', false);  
    $('#photo_suiv').prop('disabled', true);
    $('#photo_dern').prop('disabled', true);  
    affiche_original(photos[photo_aff])
})

$('#photo_prec').on('click', () => 
{
    photo_aff--
    if(photo_aff==1)
    {
        $('#photo_prem').prop('disabled', true);
        $('#photo_prec').prop('disabled', true);  
    }
    $('#photo_suiv').prop('disabled', false);
    $('#photo_dern').prop('disabled', false);  
    affiche_original(photos[photo_aff])
})
$('#photo_prem').on('click', () => 
{
    photo_aff=1
    $('#photo_prem').prop('disabled', true);
    $('#photo_prec').prop('disabled', true);  
    $('#photo_suiv').prop('disabled', false);
    $('#photo_dern').prop('disabled', false);  
    affiche_original(photos[photo_aff])
})

$('#photo_recadrer').on('click', () => 
{    
    var htmltoimage = require('html-to-image');
    const fs = require('fs')    

    $('#photo_recadrer').prop('disabled', true);       
    $("#photo_recadrer").html("Recadrée !");
    let element = document.getElementById('recadree_box');
    let scale = 2;
    htmltoimage.toPng(element,{}).then(function (png) {
      
      var data = png.replace(/^data:image\/\w+;base64,/, "");
      var buf = Buffer.from(data, 'base64');      
      fs.writeFileSync(chemin_photos_recadrees+photos[photo_aff], buf)   


    });
   
});


$('#trombi_btn').on('click', () => 
{ 
  
  ipcRenderer.send('trombi_btn')  
  ipcRenderer.send('source', { chemin_photos_recadrees: chemin_photos_recadrees });
})


function recadrer()
{
      //Zoom

      haut_recadree=larg_img*(9/7)
      larg_app=$(".apercu").width();
      scale_temp=larg_app/largeur_cache
      scale=scale_temp.toFixed(2);
      //Decalage
      gauche=select_deb_x
      haut=select_deb_y      
  
      depX=parseInt(-gauche*scale,10)   
      depY=parseInt(-haut*scale,10)
      
      $('#recadree_box').height(haut_recadree)
      $('#recadree').css('object-fit', 'contain')
  
      $('#recadree').css('transform', 'translate('+depX+'px,'+depY+'px) scale('+scale+')')
      $('#recadree_img').attr('src',path.normalize(chemin_photos+photos[photo_aff]));
    
}

function recadrer_defaut()
{
      //Zoom
      larg_img=$("#original_img").width()
      haut_recadree=larg_img*(9/7)      
      larg_recadree=haut_recadree*(7/9)      

      larg_app=$(".apercu").width();
      scale_temp=larg_app/larg_recadree
      scale=scale_temp.toFixed(2);

      //Decalage
      gauche=0;
      haut=0;
  
      depX=0;depY=0;
      
      $('#recadree_box').height(haut_recadree)
      $('#recadree').css('object-fit', 'contain')
      photo_recardee=path.normalize(chemin_photos_recadrees+photos[photo_aff]);
      console.log(photo_recardee)
      fs.access(photo_recardee, fs.constants.F_OK, (erreur) => {
        if (erreur) {
          console.log('Le fichier n\'existe pas.');
          $('.case_recadree').css("visibility", "hidden");

        } else {
          $('#recadree').css('transform', 'translate('+depX+'px,'+depY+'px) scale('+scale+')')
          $('#recadree_img').attr('src',photo_recardee);
          $('.case_recadree').css("visibility", "visible");
        }
      });



}

function affiche_original(fichier_img)
{            
    $(".cache").width(0);
    $(".cache").height(0);  
    $('#photo_recadrer').prop('disabled', true); 
    
    $('#recadree').css('transform', 'translate(0px,0px) scale(1)')
    $('#original_img').attr('src',path.normalize(chemin_photos+fichier_img));

    recadrer_defaut()

    nom_etu=fichier_img.split('.');
    $('#identite').val(nom_etu[0])
    $('#ext').val(nom_etu[1])
    $('#infos_photos').html(photo_aff+'/'+nb_photos)

    $('#photo_recadrer').prop('disabled', false);       
    $("#photo_recadrer").html("<i class='bi bi-app'></i>&nbsp;Recadrer</button>");
}

function pret()
{  
  if(chemin_photos!='' && chemin_photos_recadrees!='' && $(".cache").width()>0)
  {
    $('#photo_recadrer').prop('disabled', false); 
    $("#photo_recadrer").html("<i class='bi bi-app'></i>&nbsp;Recadrer</button>");
  }
  else
  {
    $('#photo_recadrer').prop('disabled', true); 
 
  }

}