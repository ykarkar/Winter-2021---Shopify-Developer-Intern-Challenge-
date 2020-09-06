$(document).ready(function () {

  $(".UploadImgPublic").hide();
  $(".login-form").hide();
  $(".login").css("background", "none");
  $(".UploadImg").css("background", "none");
  console.log("js workong");

  $(".login").click(function () {
    $(".signup-form").hide();
    $(".UploadImgPublic").hide();
    $(".login-form").show();
    $(".signup").css("background", "none");
    $(".UploadImg").css("background", "none");
    $(".login").css("background", "#fff");
  });

  $(".signup").click(function () {
    $(".signup-form").show();
    $(".login-form").hide();
    $(".UploadImgPublic").hide();
    $(".UploadImg").css("background", "none");
    $(".login").css("background", "none");
    $(".signup").css("background", "#fff");
  });

  $(".UploadImg").click(function () {
    $(".UploadImgPublic").show();
    $(".signup-form").hide();
    $(".login-form").hide();
    $(".signup").css("background", "none");
    $(".login").css("background", "none");
    $(".UploadImg").css("background", "#fff");

  })

  const urlImg = 'http://localhost:3000/ImgPublicSingle';

  



  $('#ImgPublicSingle').click(function () {
    const img = document.getElementById("mySingleImage").files[0];

    console.log(img);
   const data = { myImage: img };
    // $.post(urlImg,data,function(data,status){
    //   console.log(`${data} and status is ${status}`);       
    //   alert(data);      
    // })
    var req = jQuery.ajax({
      url: 'http://localhost:3000/ImgPublicSingle',
      method: 'POST',
      data: data, // sends fields with filename mimetype etc
      // data: aFiles[0], // optional just sends the binary
      processData: false, // don't let jquery process the data
      contentType: false // let xhr set the content type
    });
    req.then(function (response) {
      console.log(response)
    }, function (xhr) {
      console.error('failed to fetch xhr', xhr)
    })

  })

  $('#ImgPublicMultiple').click(function () {

  })


  const url = 'http://localhost:3000/register';
  $("#register").click(function () {
    var rpassword = $("#rpassword").val();
    var repassword = $("#repassword").val();
    var username = $("#rusername").val();
    if (rpassword != repassword) {
      $(".error").text('Passwords does not math please try again!')
    }
    else {
      const data = { username: username, password: rpassword };
      $.post(url, data, function (data, status) {
        console.log(`${data} and status is ${status}`);
        if (data === 'Account created') {
          $(".signup-form").hide();
          $(".login-form").show();
          $(".account").text('Account created please login!')
        }
      })
    }
  })

  const logInurl = 'http://localhost:3000/logIn';
  $("#login").click(function () {
    var password = $("#password").val();
    var username = $("#username").val();

    const data = { username: username, password: password };
    $.post(logInurl, data, function (data, status) {
      console.log(`${data} and status is ${status}`);
      if (data === 'LoggedIn') {
        window.location.replace("/ImageRepo");
      }
    })





  })


})