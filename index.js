const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();
const decen = require('decode-encode-binary');
const decitobi = require('decimal-to-binary');
const mongoose = require('mongoose');
const user = require('./models/user');

app.set("view engine","ejs");
app.use(express.static('public/'))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(upload.array());

//DB Connection
mongoose.connect('mongodb+srv://<user>:<password>@college-gr8xt.mongodb.net/test?retryWrites=true&w=majority',
{useNewUrlParser:true,useUnifiedTopology:true},
(err)=>{
    if(err){
        console.log(err);
    }
    else{
        console.log("DB Connected!");
    }
});

app.get('/login',(req,res)=>{
    res.render("login.ejs");
});

app.get('/register',(req,res)=>{
    res.render("register.ejs");
});

app.post('/login',(req,res)=>{
    console.log(req.body);
    var username = req.body.username;
    var password = req.body.password;
    var keys = [];
    var cipher = "";

    var log = decen.encode(username);
    keys = keygen(log);

    var pass = decen.encode(password);
    cipher = desencryption(pass,keys);

    user.find({username:username},(err,data)=>{
        if(err){
            console.log(err);
        }
        else{
            if(data[0].password == cipher){
                res.render("dashboard",{data:data});
            }
            else{
                res.redirect('/register');
            }
        }
    });
});

app.post('/register',(req,res)=>{
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var keys = [];
    var cipher = "";
    //var log = "0111010100101000011110000011100101110100100100111100101101110000"; //-Excel Example
    //var log = "0001001100110100010101110111100110011011101111001101111111110001"; //-Website Example
    //log = log.split('');
    var log = decen.encode(username);
    console.log("Key Bits");
    console.log(log.length);
    keys = keygen(log);

    //var pass = "0001000100100010001100110100010001010101011001100111011110001000"; //-Excel Example
    //var pass = "0000000100100011010001010110011110001001101010111100110111101111"; //-Website Example
    //pass = pass.split('');
    var pass = decen.encode(password);
    console.log("Password Bits")
    console.log(pass.length);
    cipher = desencryption(pass,keys);
    console.log(cipher); 
    password = cipher;

    console.log("");
    console.log("Password");
    console.log(password);

    user.create({
        firstname:firstname,
        lastname:lastname,
        email:email,
        username:username,
        password:password
    },(err)=>{
        if(err){
            console.log(err);
        }
    });

});

function keygen(login){
    const pc1_table = [57,49,41,33,25,17,9,1,
                58,50,42,34,26,18,10,2,
                59,51,43,35,27,19,11,3,
                60,52,44,36,63,55,47,39,
                31,23,15,7,62,54,46,38,
                30,22,14,6,61,53,45,37,
                29,21,13,5,28,20,12,4];

    const pc2_table = [14,17,11,24,1,5,
                        3,28,15,6,21,10,
                        23,19,12,4,26,8,
                        16,7,27,20,13,2,
                        41,52,31,37,47,55,
                        30,40,51,45,33,48,
                        44,49,39,56,34,53,
                        46,42,50,36,29,32];
    //For PC-1
    var pc1 = [];
    for(i=0;i<56;i++){
        var temp=pc1_table[i]-1;
        pc1.push(login[temp]);
        var temp = 0;
    }

    var left = [];
    var right = [];
    var temp2 = 0;
    var temp3 = 0;
    var lr = [];
    var k = [];
    var keys = [];

    left = pc1.slice(0,28);
    right = pc1.slice(28,56);

    for(i=0;i<16;i++){
        if(i== 0 || i == 1 || i == 8 || i == 15){
            temp = left[0];
            left = left.slice(1,28);
            left.push(temp);
            temp = 0;

            temp = right[0];
            right = right.slice(1,28);
            right.push(temp);
            temp = 0;
        }

        else{
            temp2 = left[0];
            temp3 = left[1];
            left = left.slice(2,28);
            left.push(temp2);
            left.push(temp3);
            temp2 = 0;
            temp3 = 0;

            temp2 = right[0];
            temp3 = right[1];
            right = right.slice(2,28);
            right.push(temp2);
            right.push(temp3);
            temp2 = 0;
            temp3 = 0;
        }

        lr = left.concat(right);

        for(j=0;j<48;j++){
            temp = pc2_table[j] - 1;
            k.push(lr[temp]);
            temp = 0;
        }

        keys.push(k);
        
        k = [];
        lr = [];
    }

    return keys;
}


function desencryption(password,keys){
    const ip1_table = [58,50,42,34,26,18,10,2,
                        60,52,44,36,28,20,12,4,
                        62,54,46,38,30,22,14,6,
                        64,56,48,40,32,24,16,8,
                        57,49,41,33,25,17,9,1,
                        59,51,43,35,27,19,11,3,
                        61,53,45,37,29,21,13,5,
                        63,55,47,39,31,23,15,7];

    const ep_table = [32,1,2,3,4,5,
                        4,5,6,7,8,9,
                        8,9,10,11,12,13,
                        12,13,14,15,16,17,
                        16,17,18,19,20,21,
                        20,21,22,23,24,25,
                        24,25,26,27,28,29,
                        28,29,30,31,32,1];

    const s1_table = [[14,4,13,1,2,15,11,8,3,10,6,12,5,9,0,7],
                        [0,15,7,4,14,2,13,1,10,6,12,11,9,5,3,8],
                        [4,1,14,8,13,6,2,11,15,12,9,7,3,10,5,0],
                        [15,12,8,2,4,9,1,7,5,11,3,14,10,0,6,13]];

    const s2_table = [[15,1,8,14,6,11,3,4,9,7,2,13,12,0,5,10],
                        [3,13,4,7,15,2,8,14,12,0,1,10,6,9,11,5],
                        [0,14,7,11,10,4,13,1,5,8,12,6,9,3,2,15],
                        [13,8,10,1,3,15,4,2,11,6,7,12,0,5,14,9]];
                        
    const s3_table = [[10,0,9,14,6,3,15,5,1,13,12,7,11,4,2,8],
                        [13,7,0,9,3,4,6,10,2,8,5,14,12,11,15,1],
                        [13,6,4,9,8,15,3,0,11,1,2,12,5,10,14,7],
                        [1,10,13,0,6,9,8,7,4,15,14,3,11,5,2,12]];

    const s4_table = [[7,13,14,3,0,6,9,10,1,2,8,5,11,12,4,15],
                        [13,8,11,5,6,15,0,3,4,7,2,12,1,10,14,9],
                        [10,6,9,0,12,11,7,13,15,1,3,14,5,2,8,4],
                        [3,15,0,6,10,1,13,8,9,4,5,11,12,7,2,14]];

    const s5_table = [[2,12,4,1,7,10,11,6,8,5,3,15,13,0,14,9],
                        [14,11,2,12,4,7,13,1,5,0,15,10,3,9,8,6],
                        [4,2,1,11,10,13,7,8,15,9,12,5,6,3,0,14],
                        [11,8,12,7,1,14,2,13,6,15,0,9,10,4,5,3]];

    const s6_table = [[12,1,10,15,9,2,6,8,0,13,3,4,14,7,5,11],
                        [10,15,4,2,7,12,9,5,6,1,13,14,0,11,3,8],
                        [9,14,15,5,2,8,12,3,7,0,4,10,1,13,11,6],
                        [4,3,2,12,9,5,15,10,11,14,1,7,6,0,8,13]];

    const s7_table = [[4,11,2,14,15,0,8,13,3,12,9,7,5,10,6,1],
                        [13,0,11,7,4,9,1,10,14,3,5,12,2,15,8,6],
                        [1,4,11,13,12,3,7,14,10,15,6,8,0,5,9,2],
                        [6,11,13,8,1,4,10,7,9,5,0,15,14,2,3,12]];

    const s8_table = [[13,2,8,4,6,15,11,1,10,9,3,14,5,0,12,7],
                        [1,15,13,8,10,3,7,4,12,5,6,11,0,14,9,2],
                        [7,11,4,1,9,12,14,2,0,6,10,13,15,3,5,8],
                        [2,1,14,7,4,10,8,13,15,12,9,0,3,5,6,11]];

    const p_table = [16,7,20,21,
                    29,12,28,17,
                    1,15,23,26,
                    5,18,31,10,
                    2,8,24,14,
                    32,27,3,9,
                    19,13,30,6,
                    22,11,4,25];

    const ip_inverse = [40,8,48,16,56,24,64,32,
                        39,7,47,15,55,23,63,31,
                        38,6,46,14,54,22,62,30,
                        37,5,45,13,53,21,61,29,
                        36,4,44,12,52,20,60,28,
                        35,3,43,11,51,19,59,27,
                        34,2,42,10,50,18,58,26,
                        33,1,41,9,49,17,57,25];


    var temp = 0;
    var ip1 = [];
    for(i=0;i<64;i++){
        temp = ip1_table[i] - 1;
        ip1.push(password[temp]);
    }

    var left = [];
    var right = [];

    left = ip1.slice(0,32);
    right = ip1.slice(32,64);

    var ep_right = [];
    var xor_right = [];
    var temp_right = [];

    //Rounds
    for(i=0;i<16;i++){

        var temp_right = right;
        var key = keys[i];
        ep_right = [];
        xor_right = [];
        console.log("Round-",i);
        console.log("");

        //EP Loop
        for(j=0;j<48;j++){
            temp = ep_table[j] - 1;
            ep_right.push(right[temp]);
        }

        console.log("EP");
        console.log(ep_right.toString());

        console.log("Key");
        console.log(key.toString());

        //XOR Operations
        for(j=0;j<48;j++){
            if((ep_right[j] == 0 && key[j] == 0) || (ep_right[j] == 1 && key[j] == 1)){
                xor_right.push(0);
            }
            else{
                xor_right.push(1);
            }
        }

        console.log("XOR Key");
        console.log(xor_right.toString());

        var temp2 = 0;
        var tempA = [];
        var block = [];
        var row = 0;
        var column = 0;
        var element = 0;
        temp = 0;
        temp2 = 6;
        right = [];
        
        //S-Block
        for(j=0;j<8;j++){
            block = xor_right.slice(temp,temp2);
            row = (2 * block[0]) + (1 * block[5]);
            column = (8 * block[1]) + (4 * block[2]) + (2 * block[3]) + (1 * block[4]) ;

            //S1 
            if(j == 0){
                element = s1_table[row][column];
                tempA = decitobi.convertToBinary(element);
                if(tempA.length == 3){
                    right.push(0);
                    for(k=0;k<3;k++){
                        right.push(tempA[k]);
                    }
                }
                else if(tempA.length == 2){
                    right.push(0);
                    right.push(0);
                    for(k=0;k<2;k++){
                        right.push(tempA[k]);
                    }
                }
                else if(tempA.length == 1){
                    right.push(0);
                    right.push(0);
                    right.push(0);
                    right.push(tempA[0]);
                }
                else if(tempA == "" || tempA.length == 0){
                    right.push(0);
                    right.push(0);
                    right.push(0);
                    right.push(0);
                }
                else{
                    for(k=0;k<4;k++){
                        right.push(tempA[k]);
                    }
                }
            }

            //S2
            else if(j == 1){
                element = s2_table[row][column];
                tempA = decitobi.convertToBinary(element);
                if(tempA.length == 3){
                    right.push(0);
                    for(k=0;k<3;k++){
                        right.push(tempA[k]);
                    }
                }
                else if(tempA.length == 2){
                    right.push(0);
                    right.push(0);
                    for(k=0;k<2;k++){
                        right.push(tempA[k]);
                    }
                }
                else if(tempA.length == 1){
                    right.push(0);
                    right.push(0);
                    right.push(0);
                    right.push(tempA[0]);
                }
                else if(tempA == "" || tempA.length == 0){
                    right.push(0);
                    right.push(0);
                    right.push(0);
                    right.push(0);
                }
                else{
                    for(k=0;k<4;k++){
                        right.push(tempA[k]);
                    }
                }
            }

            //S3
            else if(j == 2){
                element = s3_table[row][column];
                tempA = decitobi.convertToBinary(element);
                if(tempA.length == 3){
                    right.push(0);
                    for(k=0;k<3;k++){
                        right.push(tempA[k]);
                    }
                }
                else if(tempA.length == 2){
                    right.push(0);
                    right.push(0);
                    for(k=0;k<2;k++){
                        right.push(tempA[k]);
                    }
                }
                else if(tempA.length == 1){
                    right.push(0);
                    right.push(0);
                    right.push(0);
                    right.push(tempA[0]);
                }
                else if(tempA == "" || tempA.length == 0){
                    right.push(0);
                    right.push(0);
                    right.push(0);
                    right.push(0);
                }
                else{
                    for(k=0;k<4;k++){
                        right.push(tempA[k]);
                    }
                }
            }

            //S4
            else if(j == 3){
                element = s4_table[row][column];
                tempA = decitobi.convertToBinary(element);
                if(tempA.length == 3){
                    right.push(0);
                    for(k=0;k<3;k++){
                        right.push(tempA[k]);
                    }
                }
                else if(tempA.length == 2){
                    right.push(0);
                    right.push(0);
                    for(k=0;k<2;k++){
                        right.push(tempA[k]);
                    }
                }
                else if(tempA.length == 1){
                    right.push(0);
                    right.push(0);
                    right.push(0);
                    right.push(tempA[0]);
                }
                else if(tempA == "" || tempA.length == 0){
                    right.push(0);
                    right.push(0);
                    right.push(0);
                    right.push(0);
                }
                else{
                    for(k=0;k<4;k++){
                        right.push(tempA[k]);
                    }
                }
            }

            //S5
            else if(j == 4){
                element = s5_table[row][column];
                tempA = decitobi.convertToBinary(element);
                if(tempA.length == 3){
                    right.push(0);
                    for(k=0;k<3;k++){
                        right.push(tempA[k]);
                    }
                }
                else if(tempA.length == 2){
                    right.push(0);
                    right.push(0);
                    for(k=0;k<2;k++){
                        right.push(tempA[k]);
                    }
                }
                else if(tempA.length == 1){
                    right.push(0);
                    right.push(0);
                    right.push(0);
                    right.push(tempA[0]);
                }
                else if(tempA == "" || tempA.length == 0){
                    right.push(0);
                    right.push(0);
                    right.push(0);
                    right.push(0);
                }
                else{
                    for(k=0;k<4;k++){
                        right.push(tempA[k]);
                    }
                }
            }

            //S6
            else if(j == 5){
                element = s6_table[row][column];
                tempA = decitobi.convertToBinary(element);
                if(tempA.length == 3){
                    right.push(0);
                    for(k=0;k<3;k++){
                        right.push(tempA[k]);
                    }
                }
                else if(tempA.length == 2){
                    right.push(0);
                    right.push(0);
                    for(k=0;k<2;k++){
                        right.push(tempA[k]);
                    }
                }
                else if(tempA.length == 1){
                    right.push(0);
                    right.push(0);
                    right.push(0);
                    right.push(tempA[0]);
                }
                else if(tempA == "" || tempA.length == 0){
                    right.push(0);
                    right.push(0);
                    right.push(0);
                    right.push(0);
                }
                else{
                    for(k=0;k<4;k++){
                        right.push(tempA[k]);
                    }
                }
            }

            //S7
            else if(j == 6){
                element = s7_table[row][column];
                tempA = decitobi.convertToBinary(element);
                if(tempA.length == 3){
                    right.push(0);
                    for(k=0;k<3;k++){
                        right.push(tempA[k]);
                    }
                }
                else if(tempA.length == 2){
                    right.push(0);
                    right.push(0);
                    for(k=0;k<2;k++){
                        right.push(tempA[k]);
                    }
                }
                else if(tempA.length == 1){
                    right.push(0);
                    right.push(0);
                    right.push(0);
                    right.push(tempA[0]);
                }
                else if(tempA == "" || tempA.length == 0){
                    right.push(0);
                    right.push(0);
                    right.push(0);
                    right.push(0);
                }
                else{
                    for(k=0;k<4;k++){
                        right.push(tempA[k]);
                    }
                }
            }

            //S8
            else if(j == 7){
                element = s8_table[row][column];
                tempA = decitobi.convertToBinary(element);
                if(tempA.length == 3){
                    right.push(0);
                    for(k=0;k<3;k++){
                        right.push(tempA[k]);
                    }
                }
                else if(tempA.length == 2){
                    right.push(0);
                    right.push(0);
                    for(k=0;k<2;k++){
                        right.push(tempA[k]);
                    }
                }
                else if(tempA.length == 1){
                    right.push(0);
                    right.push(0);
                    right.push(0);
                    right.push(tempA[0]);
                }
                else if(tempA == "" || tempA.length == 0){
                    right.push(0);
                    right.push(0);
                    right.push(0);
                    right.push(0);
                }
                else{
                    for(k=0;k<4;k++){
                        right.push(tempA[k]);
                    }
                }
            }

            temp = temp + 6;
            temp2 = temp2 + 6;
            element = 0;
        }

        console.log("S Box");
        console.log(right.toString());

        //P Box
        var p_right = [];
        for(j=0;j<32;j++){
            temp = p_table[j] - 1;
            p_right.push(right[temp]);
        }

        console.log("P Box");
        console.log(p_right.toString());

        // XOR Operation on left and P Right
        var xor_p_right = [];
        for(j=0;j<32;j++){
            if((p_right[j] == 0 && left[j] == 0) || (p_right[j] == 1 && left[j] == 1)){
                xor_p_right.push(0);
            }
            else{
                xor_p_right.push(1);
            }
        }

        console.log("XOR Left");
        console.log(xor_p_right.toString());

        left = temp_right;
        right = xor_p_right;

        console.log("left");
        console.log(left.toString());
        console.log(left.length);
        console.log("right");
        console.log(right.toString());
        console.log(right.length);
    }

    //Final Swap
    var swap_temp = [];
    swap_temp = left;
    left = right;
    right = swap_temp;
    console.log("");
    console.log("Final Swap");
    console.log("Left");
    console.log(left.toString());
    console.log("Right");
    console.log(right.toString());
    var temp_cipher = [];
    temp_cipher = left.concat(right);
    console.log(temp_cipher.toString());

    var cipher = [];
    temp = 0;
    //Inverse Permutation
    for(i=0;i<64;i++){
        temp = ip_inverse[i]-1;
        cipher.push(temp_cipher[temp]);
    }

    console.log("");
    console.log("Cipher Bits");
    console.log(cipher.toString());

    var cipher_string = "";
    for(i=0;i<64;i++){
        cipher_string = cipher_string + cipher[i];
    }

    return(cipher_string);
}

app.listen(8000,()=>{
    console.log("Systems Online!");
});