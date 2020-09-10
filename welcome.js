/* 
@author Yash Amitbhai Karkar <yashkarkar.yk@gmail.com> <https://github.com/ykarkar>
*/
$(document).ready(function () {

  $(".signup-form").hide();
  $(".signup").css("background", "none");
  
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
    
    if(username === ''){
      $(".error").text('Please Enter Username')
      return;
    }

    if (rpassword != repassword) {
      $(".error").text('Passwords does not match please try again!')
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
        else if(data === 'Error'){
          $(".error").text('Error')
        }
      })
    }
  })

  const logInurl = 'http://localhost:3000/logIn';
  $("#login").click(function () {
    var password = $("#password").val();
    var username = $("#username").val();

    if(username === ''){
      $(".account").text('Please Enter Username')
      return;
    }
    const data = { username: username, password: password };
    $.post(logInurl, data, function (data, status) {
      console.log(`${data} and status is ${status}`);
      if (data === 'LoggedIn') {
        window.location.replace("/ImageRepo");
      }
      else if(data === 'User_Not_Found'){
        $(".account").text('User not found please register')
      }
      else if(data === 'Incorrect_Credentials'){
        $(".account").text('Incorrect Credentials. Please try again')
      }
    })





  })


})