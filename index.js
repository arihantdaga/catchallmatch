'use strict';

const emojic = require("emojic")
    ,colorIt = require("color-it")
    ,Tinder = require("./Controllers/tinder.cont");


// const auth_token = "e138b368-4600-4587-bb4c-f44fd95d88bc";
const auth_token = "random";
/* All Options
 *
 * 
 * 
 *  
*/

const pref_options = {
    bio_required : false,
    age_range:{
        lower: 18,
        higher: 23
    },
    distance_range:{
        max: 20
    }
}
let loveee = emojic.coupleWithHeartWomanMan
let heartEyes = emojic.heartEyes;
let wink = emojic.wink;
let sunGlasses = emojic.sunglasses;

console.log(`${loveee}  ${loveee}  Ready to get Mingled ?? ${wink} ${heartEyes} ${heartEyes} ${heartEyes}`);
console.log(`Starting Discovery ${sunGlasses}`);

Tinder.swipeFinger(auth_token,pref_options,30);