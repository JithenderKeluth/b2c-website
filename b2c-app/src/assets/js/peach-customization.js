var wpwlOptions = {
  style:"card",
  maskCvv: true ,

  style: "logos",
  brandDetection: true,
  brandDetectionType: "binlist",
  // brandDetectionPriority: ["VISA","MASTER", "DINERS", "AMEX"],
  // Optional. Use SVG images, if available, for better quality.
  imageStyle: "svg",
  onReady: function(e){
    ready = true;
    $('.wpwl-form-card').find('.wpwl-button-pay').on('click', function(e){
      validateHolder(e);
    });
  },
  onBeforeSubmitCard: function(e){
    return validateHolder(e);
  },
  onChangeBrand: function() {
    hideBrands();
  }
}


var ready = false;
var dotsClicked = false;
function hideBrands() {
  if (!ready || dotsClicked) {
    return;
  }

  // Clears all previous dots-hidden logos, if any
  $(".wpwl-group-card-logos-horizontal > div").removeClass("dots-hidden");

  // Selects all non-hidden logos. They are detected brands which otherwise would be shown by default.
  var $logos = $(".wpwl-group-card-logos-horizontal > div:not(.wpwl-hidden)");
  if ($logos.length < 2) {
    return;
  }

  // Hides all except the first logo, and displays three dots (...)
  $logos.first().after($("<div>...</div>").addClass("dots"));
  $logos.filter(function(index) { return index > 0; }).addClass("dots-hidden");

  // If ... is clicked, un-hides the logos
  $(".dots").click(function() {
    dotsClicked = true;
    $(".dots-hidden").removeClass("dots-hidden");
    $(this).remove();
  });
}


function validateHolder(e){
  var holder = $('.wpwl-control-cardHolder').val();
  if (holder.trim().length < 2){
    $('.wpwl-control-cardHolder').addClass('wpwl-has-error').after('<div class="wpwl-hint wpwl-hint-cardHolderError">Invalid card holder</div>');
    return false;
  }
  return true;
}



/*
var unloadWidget = function() {
  if (window.wpwl !== undefined && window.wpwl.unload !== undefined) {
      window.wpwl.unload();
      $("script").each(function () {
          if (this.src.indexOf("static.min.js") !== -1) {
              $(this).remove();
          }
      });
  }
};

var $unloadButton = $("<button>Unload Widget</button>").on("click", unloadWidget);

$("body").prepend($unloadButton);
*/
