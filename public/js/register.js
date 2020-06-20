$(document).ready(function(){
    $(".submit").on("click",function(){
        var firstname = $(".fname-field").val();
        var lastname = $(".lname-field").val();
        var email = $(".email-field").val();
        var username = $(".username-field").val();
        var password = $(".password-field").val();
        var cpassword = $(".cpassword-field").val();
        if(password != cpassword){
            $(".alert").append("<p> Please Confirm Password </p>");
        }
        else if(username.length < 8 || username.length > 8){
            $(".alert").append("<p> Username Should be eight characters </p>");
        }
        else if(password.length < 8 || password.length > 8){
            $(".alert").append("<p> Password Should be eight characters </p>");
        }
        else if(password == '' || cpassword == '' || username == '' || email == '' || firstname == '' || lastname == ''){
            $(".alert").append("<p> Password Should be eight characters </p>");
        }
        else if(password.length == 8 && username.length == 8 && password == cpassword){
            $.ajax({
                url:'/register',
                method:'POST',
                data:{
                    firstname:firstname,
                    lastname:lastname,
                    email:email,
                    username:username,
                    password:password
                },
                success: function(data){
                    console.log(data);
                }
            });
        }
    });
});