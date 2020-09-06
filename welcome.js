$(document).ready(function () {

  $(".login-form").hide();
  $(".login").css("background", "none");
  console.log("js workong");

  $(".login").click(function () {
    $(".signup-form").hide();
    $(".login-form").show();
    $(".signup").css("background", "none");
    $(".login").css("background", "#fff");
  });

  $(".signup").click(function () {
    $(".signup-form").show();
    $(".login-form").hide();
    $(".login").css("background", "none");
    $(".signup").css("background", "#fff");
  });

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
          $(".signup").css("background", "none");
          $(".login").css("background", "#fff");
          $(".account").text('Account created please login!')
        }
        else if( data === 'User Already Exists'){
            $(".error").text('Username already exists. Please try other username')
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