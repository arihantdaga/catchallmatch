const rp = require("request-promise");
const async = require("async");
const _ = require("lodash");

const THRESHOLD_SCORE = 30;


const APIs = {
    "get_profiles":"https://api.gotinder.com/recs/core?locale=en",
    "like":"https://api.gotinder.com/like/{:id}?locale=en",
    "pass":"https://api.gotinder.com/pass/{:id}?locale=en",
    "superlike":"https://api.gotinder.com/like/{:id}/super?locale=en"
}

function get_headers(auth_token){
    return {
        'x-auth-token': auth_token,
        "platform":"web",
        "Referer":"https://tinder.com/",
        "User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36",
        "app-version":1000000
    }
}

function getProfiles(auth_token){

    let options = {
        uri: APIs.get_profiles,
        
        headers:get_headers(auth_token),
        json: true // Automatically parses the JSON string in the response
    };
    
    return rp(options)
        .then(function (data) {
            // console.log(data);
            if(data && data.results){
                // console.log(`Got ${data.results.length} Profiles`);
            }
            return data;
        });
}

function passProfile(auth_token, id){
    let options = {
        uri: APIs.pass.replace("{:id}", id),
        headers:get_headers(auth_token),
        json: true // Automatically parses the JSON string in the response
    };
    
    return rp(options)
        .then(function (data) {
            console.log(data);
            return data;
        });
}
function likeProfile(auth_token, id){
    // console.log("Liking : ", id);
    let options = {
        uri: APIs.pass.replace("{:id}", id),
        headers:get_headers(auth_token),
        json: true // Automatically parses the JSON string in the response
    };
    
    return rp(options)
        .then(function (data) {
            // console.log(data);
            return data;
        });
}


function filterProfile(profile, options){
    return new Promise((resolve,reject)=>{

        let score = 0;
        if(Object.keys(options).length == 0){
            // This guy is a monk.
            // Allow him anything.
            score += 50;
        }
        if(profile.type!="user"){
            return resolve(0);
        }
        let user = profile.user;

        // +10 For Group Matching
        if(options.match_group && profile.group_matched) score+=10
        
        // +10 For Matching Distance
        if(options.distance_range){
            let lower = options.distance_range.min || 0;
            let higher = options.distance_range.max || 150;
            if(lower>=0 && higher>=0 && user.distance_mi && user.distance_mi<=higher && user.distance_mi>=lower ){
                score+=20;
            }

        }else{
            // By default giving 5 Points If User is not concerned about it.
            score += 5;
        }

        // +20 For every common friends matched of first degree
        // +10 for every common friends matched of 2nd degree
        
        if(user.common_connections && user.common_connections.length){
            if(options.filter_connections){
                cant_select = true;
                return resolve(0);
            }else{
                for(let conn of user.common_connections){
                    if(conn.degree == 1){
                        score+=20;
                    }
                    else if(conn.degree == 2){
                        score+=15;
                    }else{
                        // Unsure about it so giving it Benifit of doubt.
                        score+=10;
                    }
                }
            }  
        }

        // +5 For every common intrest
        if(user.common_interests && user.common_interests.length){
            score += user.common_interests.length*5;
        }

        // If Bio Is mandatory
        if(options.bio_required){
            if(!user.bio || user.bio.trim().length< 3){
                return resolve(0);
            }
        }else{
            if(user.bio){
                score+=10;
            } 
        }

        if(options.age_range){
            let lower = options.age_range.lower;
            let higher = options.age_range.higher;
            let age = getAge(user.birth_date);
            if(lower>=0 && higher>=0 && age>=lower && age<=higher){
                score+=20;
            }

        }else{
            // By default giving 5 Points
            score += 5;
        }

        if(!user.jobs || !user.jobs.length){
            // Forgive me for judgement but i consider it a negative feature
            let age = getAge(user.birth_date);
            if(user.age>22){
                score -= 20;
            }
            if(options.working_prefered){
                score -= 20;
            }
        
        }

        if(user.photos && user.photos.length){
            // Plan to use Image processing and getting photo score for the photos.
            // Get score only on basis of first photo, not all. 

            // For now only count of photos
            let photo_score = 0;
            if (user.photos.length>=3) {
                photo_score = 25
            }
            else if (user.photos.length == 2){
                photo_score = 20;
            }else if(user.photos.length == 1){
                photo_score = 15;
            }
            score += photo_score;

        }
        return resolve({profile:profile,score: score});

    });
}

function getAge(dob){
    let age;
    try{
        let d = new Date(dob);
        let today = new Date();
        age = today.getFullYear() - d.getFullYear();
    }catch(err){
        age = 0;
    }
    return age;
}


function fetch_profiles_and_match(auth_token,prefrences, count){
    return new Promise((resolve,reject)=>{

        let likedProfiles = 0;
        let fetchedProfiles = 0;
        getProfiles(auth_token).then(data=>{
            if(data && data.results){
                let new_profiles = _.cloneDeep(data.results);
                fetchedProfiles += new_profiles.length;
                // console.log("Fetched Profiles : ", fetchedProfiles);
                counter = 0;
                profile_processes = new_profiles.map(profile => async.reflect(function(callback){
                    filterProfile(profile,prefrences).then(scoreData=>{
                        if(scoreData && scoreData.score && scoreData.score > THRESHOLD_SCORE){
                            console.log("Score : ",scoreData.score);
                            setTimeout(function(){
                                likeProfile(auth_token,scoreData.profile.user._id).then(data=>{
                                    likedProfiles++;
                                    // console.log("Liked Profiles : ", likedProfiles);
                                    callback(null,scoreData.profile.user._id);
                                }).catch(err=>{
                                    callback(err);
                                });
                            }, 1000* counter);
                            counter++;
                            
                    }else{
                            // console.log("Profile Rejected");
                            // console.log(scoreData);
                            if(scoreData){
                                // console.log(scoreData.score);
                            }
                            callback("Profile Rejected");
                        }
                    }).catch(err=>{
                        callback(err);
                    })
                }));

                // console.log(profile_processes);
                async.series(profile_processes, function(err,res){
                    if(err){
                        console.log("Error Occured in fetching profiles");
                        console.log(err);
                    }
                    // console.log(res);
                    // console.log("Done");
                    // console.log("Total Profiles fetched : ", fetchedProfiles);
                    // console.log("Total Profiles liked : ", likedProfiles);
                    return resolve({fetchedProfiles,likedProfiles, res});
                });
            }else{
                // Error in APIs, Block Operation her. 
                // Most probably its resource timeout error from Tinder API,
                // We need new token now.
                return reject(Error("Token Blocked, Relogin and update the token"));
            }
            
        }).catch(err=>{
            return reject(err);
        })
    });
    
}

function swipeFinger(auth_token, prefrences, limit){
    let fetchedProfiles = 0;
    let likedProfiles = 0;
    let results = [];
    function recursive(){
        fetch_profiles_and_match(auth_token,prefrences).then(data=>{
            if(data.hasOwnProperty("fetchedProfiles")) {
                fetchedProfiles += data.fetchedProfiles;
                likedProfiles += data.likedProfiles;
                results.push(_.clone(data.res));
    
                console.log("Fetched Profiles : ", fetchedProfiles);
                console.log("Liked Profiles : ", likedProfiles);
                if(fetchedProfiles < limit){
                    recursive();
                }else{
                    return;
                }
                
            }else{
                // Something went wrong, and we dont have data.
                // Abort the program here.
                console.log("Unknown Exception occured. Terminating program here");
                return;
            }
        }).catch(err=>{
            console.log("An error occured, Terminating program here");
            console.log(err.message);
        });
    }
    recursive();
}

module.exports = { swipeFinger }

/* function test_action(auth_token, prefrences){
    let scores = [];
    let n_times = 5;
    let profile_requests = [];
    let profiles = [];
    let filtered_profiles = [];

    

    for(let i =0; i< n_times; i++){
        profile_requests.push(async.reflect(function(callback){
            setTimeout(function(){
                getProfiles(auth_token).then(data=>{
                    if(data && data.results){
                        let new_profiles = _.cloneDeep(data.results)
                        profiles.push(...new_profiles);
                        Promise.all(new_profiles.map(profile=> filterProfile(profile,prefrences))).then(data=>{
                            data.map(item=>{
                                item && item.score ? filtered_profiles.push(item) : null;
                            });
                            return callback(null,"done");
                        }).catch(err=>{
                            // Do nothing.
                            console.log("Error Occured in filtering profiles", err);
                            return callback(err);
                        });
                    }else{
                        return callback(null,"Error In Get Profile API");
                    }
                    
                }).catch(err=>{
                    return callback(err);
                });
            }, 2000);
        }));
    }
    async.series(profile_requests, function(err,res){
        if(err){
            console.log("Error Occured in fetching profiles");
            console.log(err);
        }
        console.log(res);
        console.log("Done Fetching Profiles");
        console.log("Total Profiles : ", profiles.length);
        console.log("Filtered Profiles : ", filtered_profiles.length);
        let scores = filtered_profiles.map(item => item.score);
        console.log("Scores: ");
        console.log(scores);
        console.log();
    });

}
 */

// With Prefrence Options
// test_action(auth_token, pref_options);

// I am fine with everything, I dont discriminate
// test_action(auth_token, {});

// fetch_profiles_and_match(auth_token,pref_options);