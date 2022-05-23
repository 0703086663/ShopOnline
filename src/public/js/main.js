

//=================== ARROW IN INDEX =============================
  $(document).ready(function($) {
    
    $('.login-section').hide();
    $('#move-to-login-section').click(function(){
        $('.register-sidenav').animate({
            left: '0',
        });
        $('.register-section').animate({
            opacity: 0,
            height: 'hide'
        })
        $('.login-sidenav').animate({
            right: '0',
        });
        $('.login-section').animate({
            height: 'show',
            opacity: 1,
        });
    })

    $('#move-to-register-section').click(function(){
        $('.login-sidenav').animate({
            left: '0',
        });
        $('.login-section').animate({
            opacity: 0,
            height: 'hide'
        })
        $('.register-sidenav').animate({
            left: '60%',
        });
        $('.register-section').animate({
            height: 'show',
            opacity: 1,
        });
    })

    $(window).on('scroll', function() {
      //ADD .TIGHT
      if ($(window).scrollTop() + $(window).height() > $('.wrapper').outerHeight()) {
        $('body').addClass('tight');
        $('.arrow').hide();
      } else {
        $('body').removeClass('tight');
        $('.arrow').show();
      }
    });

    //BACK TO PRESENTATION MODE
    $("html").on("click", "body.tight .wrapper", function() {
      $('html, body').animate({
        scrollTop: $('.wrapper').outerHeight() - $(window).height()
      }, 500);
    });
  });

  $('.arrow').click(function(){
    $("html").animate({ scrollTop: $('html').prop("scrollHeight")}, 1200);
  });

//==================== MODAL OF Delivery ===========================
var deliveryModal = document.getElementById("delivery-modal");
var deliveryBtn = document.getElementById("delivery-btn");
var deliverySpan = document.getElementsByClassName("delivery-close")[0];
if(deliveryBtn){
  deliveryBtn.onclick = function() {
    deliveryModal.style.display = "block";
  }
  deliverySpan.onclick = function() {
    deliveryModal.style.display = "none";
  }
}

//==================== MODAL OF Payment ===========================
var paymentModal = document.getElementById("payment-modal");
var paymentBtn = document.getElementById("payment-btn");
var paymentSpan = document.getElementsByClassName("payment-close")[0];
if(paymentBtn){
  paymentBtn.onclick = function() {
    paymentModal.style.display = "block";
  }
  paymentSpan.onclick = function() {
    paymentModal.style.display = "none";
  }
}

//==================== MODAL OF RETURN ===========================
var returnModal = document.getElementById("return-modal");
var returnBtn = document.getElementById("return-btn");
var returnSpan = document.getElementsByClassName("return-close")[0];
if(returnBtn){
  returnBtn.onclick = function() {
    returnModal.style.display = "block";
  }

  returnSpan.onclick = function() {
    returnModal.style.display = "none";
  }
}

window.onclick = function(event) {
  if (event.target == paymentModal || event.target == deliveryModal || event.target == returnModal) {
    paymentModal.style.display = "none";
    deliveryModal.style.display = "none";
    returnModal.style.display = "none";
  }
}

//==================== COPY PAYMENT NUMBER ID =================
function CopyToClipboard(id){
  var r = document.createRange();
  r.selectNode(document.getElementById(id));
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(r);
  document.execCommand('copy');
  window.getSelection().removeAllRanges();
}

// Toggle between adding and removing the "responsive" class to main-header when the user clicks on the icon 
function openNavResponsive() {
  var x = document.getElementById("main-header");
  if (x.className === "main-header") {
    x.className += " responsive";
  } else {
    x.className = "main-header";
  }
}

//=================== SET TOKEN FROM LOGIN =============================
function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function login(){
  $.ajax({
      url: '/login',
      type: 'post',
      data: {
          username: $('#username').val(),
          password: $('#password').val(),
      },
      msg: ''
  })
  .then(data => {
      if (data.success) {
          setCookie('token', data.token, 1);
          window.location.href = "/"
      } else {
          // alert('ajax error:' + data.msg)
          window.location.href = "/login"
      }
  })
  .catch(err => {
      console.log(err)
  })
}

function logout() {
  $.ajax({
      url: '/logout',
      type: 'post',
  }
  ).then(data => {
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.href = "/login"
  }).catch(err => {
      console.log(err)
  })
}


//=================== /admin/product-table ================================
//WHEN HTML DOM is loaded, Delete product confirm shows
  document.addEventListener('DOMContentLoaded', function(){
      var productId;
      var deleteProductForm = document.forms['delete-product-form'];
      var restoreForm = document.forms['restore-product-form'];

      $('#delete-product').on('show.bs.modal', function (event) {
          var button = $(event.relatedTarget)
          productId = button.data('id')
      })

      //When delete product btn clicked
      var btnDeleteCategory = document.getElementById('btn-delete-product')
      if(btnDeleteCategory){
        btnDeleteCategory.onclick = function(){
          deleteProductForm.action = '/product/' + productId + '?_method=DELETE';
          deleteProductForm.submit();
        }
      }

      //When button delete clicked
      $('#delete-product').on('show.bs.modal', function (product) {
        var button = $(product.relatedTarget)
        productId = button.data('id')
        })
        var btnDeleteProduct = document.getElementById('btn-delete-product')
        if (btnDeleteProduct){
          btnDeleteProduct.onclick = function(){
            deleteProductForm.action = '/product/' + productId + '/force?_method=DELETE';
            deleteProductForm.submit();
          }
        }
        //When button restore clicked
        $('#restore-product').on('show.bs.modal', function (product) {
        var button = $(product.relatedTarget)
        productId = button.data('id')
        })
        var btnRestoreProduct = document.getElementById('btn-restore-product')
        if (btnRestoreProduct){
          btnRestoreProduct.onclick = function(){
            restoreForm.action = '/product/' + productId + '/restore?_method=PATCH';
            restoreForm.submit();
          }
        }

        //=================== /admin/brand-table ================================
        //Delete brand
        var brandId;
        var deleteBrandForm = document.forms['delete-brand-form'];

        $('#delete-brand').on('show.bs.modal', function (event) {
          var button = $(event.relatedTarget)
          brandId = button.data('id')
        })

        //When delete brand btn clicked
        var btnDeleteCategory = document.getElementById('btn-delete-brand')
        if(btnDeleteCategory){
          btnDeleteCategory.onclick = function(){
            deleteBrandForm.action = '/brand/' + brandId + '?_method=DELETE';
            deleteBrandForm.submit();
          }
        }

        // Get ID of brand to modal for editing
        $(document).on("click", ".open-modal-edit-brand", function () {
        var brandId = $(this).data('id');
        var btnEditBrand = document.getElementById('btn-edit-brand')
        var editBrandForm = document.forms['edit-brand-form'];
        btnEditBrand.onclick = function(){
            editBrandForm.action = '/brand/' + brandId + '?_method=PUT';
            editBrandForm.submit();
        }
      });
        
        //================== /admin/brand-deleted-table ==========================
        //Restore brand
        var brandDeletedId;
        var restoreBrandForm = document.forms['restore-brand-form']
        $('#restore-brand').on('show.bs.modal', function (brand) {
          var button = $(brand.relatedTarget)
          brandDeletedId = button.data('id')
          })
          var btnRestoreBrand = document.getElementById('btn-restore-brand')
          if (btnRestoreBrand){
            btnRestoreBrand.onclick = function(){
              restoreBrandForm.action = '/brand/' + brandDeletedId + '/restore?_method=PATCH';
              restoreBrandForm.submit();
            }
          }
          
          //Permently delete brand
          var forceDeleteBrandForm = document.forms['permantly-delete-brand-form']
          $('#force-delete-brand').on('show.bs.modal', function (brand) {
            var button = $(brand.relatedTarget)
            brandDeletedId = button.data('id')
            })
            var btnForceDeleteBrand = document.getElementById('btn-force-delete-brand')
            if (btnForceDeleteBrand){
              btnForceDeleteBrand.onclick = function(){
                forceDeleteBrandForm.action = '/brand/' + brandDeletedId + '/force?_method=DELETE';
                forceDeleteBrandForm.submit();
              }
            }
  })

// ====================== CHANGE LANGUAGE =====================
// $(function() {
//   $('#toggle-event').change(function() {
//     document.body.className = $(this).data($(this).prop("checked").toString());
//   });   
// });