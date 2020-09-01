window.onload = (event) => {
    $.ajax({url: "http://localhost:3000/showAllImages", success: function(result){
        $("#img").html(result);
        console.log(result);
      }});   
};