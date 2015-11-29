var express = require("express");
var app = express();
var bodyparser = require("body-parser");
app.use(express.static(__dirname+'/public'));
app.use(bodyparser.json());
var Twitter = require('twitter');
var async = require('async');


var client = new Twitter({
  consumer_key: 'ILJ7guVXtU2yY61ek42bm94FX',
  consumer_secret: '8daZDO07UakJbJYUjJVbaY1O407ZRaE14Edx3DW1fub6j3NlDY',
  access_token_key: '43328325-6a0MAvnAgtlTUr2a6zoS9Sr8fNoANSzvi0LoKKHL8',
  access_token_secret: 'R1rgEhHXXGXjweMOFJPlEML4DTF9IzZVaZ4nOU7YQ6eD2'
});


app.get('/twittertime',function(req,res,next)
{
    console.log("Got a server request");
    var user= JSON.parse(req.query.user);
    var username = user.username;
    var userid = userid;
    console.log(username.value);
    var hasErrorOccured=false;
    var paramsForFollower = {};

    var paramsForCurrent  = {};
    var dateOfUser ;
    var  objectToSend = {time: "",
                        day:  "",
                        error: ""};
    var noOfseconds = 604800;
    var noOfSecsInUser;

    if( username != '')
    {
    	paramsForCurrent  = {screen_name: username,count: 1};
    	paramsForFollower = {screen_name: username};

    }
    else
    {
    	paramsForCurrent  = {user_id: userid,count: 1};
    	paramsForFollower = {user_id: userid};

    }
   
  
    var followers = new Array();
    var created_time = {};
    var times= new Array();
	async.series([
	
		function(callback)
		{
			client.get('statuses/user_timeline',paramsForCurrent,function getData(error,data,response)
			{
			    if(!error)
			    {   
			        if(data.length > 0)
			        { 
			           console.log("fetching user time line")
			           created_time = data[0].created_at;
			           dateOfUser = new Date(Date.parse(created_time.replace(/( +)/, ' UTC$1')));
			           noOfSecsInUser = dateOfUser.getTime()/1000;
			           console.log(data[0].created_at);
			        }
			        
			    }
			    else
			    {  
			    	hasErrorOccured = true;
			      
			      console.log(error);
                  
			      if(error[0].hasOwnProperty("code") && error[0].code == 34)
			      { 
			      	console.log("sending response with code 34");
			      	res.contentType('application/json');
	           		res.setHeader("Access-Control-Allow-Origin", "*");
	            	res.json({error: "user doesn't exist "});

			      } 
			      else
			      { 
			      	res.contentType('application/json');
	           		res.setHeader("Access-Control-Allow-Origin", "*");
	            	res.json({error:"Internal error has occured"});
			      }
			      return callback(new Error("Internal problem occurred"));
			     
			      
			    }
			    callback();
			});
		},

		function(callback)
		{
			client.get('followers/list',paramsForFollower, function getData(error, data, response){
  				if (!error)
  				{
   


    
 

     
			      var users = data.users;
			      console.log(paramsForFollower);

			      for(var user in users)
			      {
			      	followers.push(users[user].id);
			        console.log(users[user].id);
			      }       
			      console.log("followers size" + followers.length);
			     if(data['next_cursor'] > 0 && followers.length <100) 
			      { 
			        
			        paramsForFollower.cursor = data['next_cursor'];
			        client.get('followers/list',paramsForFollower, getData);

			      }
			      else
			      {
			
			         console.log("Got the list of followers");
			       
			         callback();
			      }
			  }

				else 
				{   
                    console.log(" Getting the followers error + hasErrorOccured" + hasErrorOccured);

					if( !hasErrorOccured )
					{   
	
						if(typeof error[0] !== 'undefined' && typeof(error[0].code) !== 'undefined' && error[0].code == 88 )
						{   
							hasErrorOccured = true;

							res.json({error: "No of rest API queries to twitter has exhausted Try after fifteen minutes"});
						}
						else
						{
							return callback(new Error("Internal problem occurred"));

						}


					}


					console.log(error);  
     
				}

				
  				
			});
		}],
		function(err) { //This function gets called after the two tasks have called their "task callbacks"
        if (err) next(err);
        async.forEach(followers,function(follower,callbacks)
        { 

        	client.get('statuses/user_timeline',{user_id: follower ,count: 1},function getData(error,data,response)
        	{
        		 if(!error)
			    {   
			        if(data.length > 0)
			        { 
			           console.log("fetching user time line")
			           var time = new Date(Date.parse(data[0].created_at.replace(/( +)/, ' UTC$1')));
			           var diff = noOfSecsInUser - time.getTime()/1000;
			           if(diff > 0 && diff <= noOfseconds)
			           {    

			           		times.push(time);
			           		console.log("Time addee" + time);
			           }


			           
			           
			        }
			        else
			        {
			        	console.log("Got the last tweet");
			        	
			        }
			    }
			    else
			    {   console.log(hasErrorOccured);
			    	if( !hasErrorOccured )
					{   
						
						if( typeof error[0] !== 'undefined' && typeof(error[0].code) !== 'undefined' && error[0].code == 88)
						{   
							hasErrorOccured = true;

							return callbacks(new Error("No. of rest queries to twitter API exhausted"));
						}


					}
			      console.log("I am here getting the last tweets");
			      console.log(error);
			     
			    }
			    console.log("Got all the tweets");
			    console.log("call backs");
			    callbacks();
        
        	}


        	);

        },

        function(err)
        { 
        	if(err)
        	{   
                
		    	if( !hasErrorOccured )
				{
					
					console.log()
					hasErrorOccured = true;

					return callbacks(new Error(err));
					


				}
        	}
        	else
        	{
        		var obj = getBestTimeAndDay(times,dateOfUser);

		        console.log("Best Tinme"  + obj.time + obj.day);
		        console.log("Sending response");
		        res.json(obj);
		        res.end();
		        console.log("respone ended");
        	}
        	   
           
        }



        );

       

    });



    
 }
);

getBestTimeAndDay = function(times,dateOfUser)
{
	var timesMap = new Object();
	var dayMap = new Object();
	for(var i in times)
	{
        var time = times[i];
        var day = time.getDay();

		var hour = time.getHours();
		var min = time.getMinutes();
		if( min >=0 && min <15)
			min =60;
		else if ( min >=15 && min <30)
			min =15;
		else if ( min >=30 && min <45)
			min =30;
		else 
			min =45;
		var key = hour+""+min;
		if( typeof timesMap[key] === 'undefined' )
		{
             timesMap[key] = {count: 1}
		}
		else
		{
			timesMap[key].count = timesMap[key].count + 1;

		}

		if( typeof dayMap[day] === 'undefined')
		{
			dayMap[day] = {count: 1};

		}
		else
		{
			dayMap[day].count = dayMap[day].count+1;

		}
	}
	var maxCount =0;
	var maxTime = 0;
	for( var i in timesMap )
	{
		if( timesMap[i].count > maxCount)
		{
			maxCount = timesMap[i].count;
			maxTime =  i;
		}

	}
	var maxcountForDay ="Not found";
	var maxcd=0;
	maxDay=0;
	console.log(dayMap);
	for( var i in dayMap)
	{
		if(dayMap[i].count > maxcd)
		{
			maxcd = dayMap[i].count;
			maxDay = i;
		}
	}
    
	
    
     var dayArray = ["Sunday","Monday" ,"Tuesday","Wednesday","Thrusday","Friday","Saturday"];
    

	if( maxTime == 0 )
	{    
		if( maxcountForDay == "Not found")
		{
			return {time: "Didn't get single tweet on the day of followers to figure out. Get yourself more followers",
	            day:   "Didn't get single tweet on the last week of followers to figure out. Get yourself more followers"};
	     }
	     return {time: "Didn't get single tweet of followers to figure out. Get yourself more followers",
	            day:   dayArray[maxcountForDay]};

	}

	var mins = maxTime.substr(maxTime.length-2,maxTime.length);
	var hr = maxTime.substr(0,maxTime.length-2);
	if( hr.length == 1)
	{
		hr = "0"+hr;
	}
	var time;
	if( mins == "60")
	{
		time = " Between "  + hr +":" + "00" + " to " + hr + ":" + "14";
	}
	else if ( mins == "45")
	{
		time = " Between "  + hr +":" + "45" + " to " + hr + ":" + "59";
	}
	else if( mins == "30")
	{
		time = " Between "  + hr +":" + "30" + " to " + hr + ":" + "44";
	}
	else
	{
		time = " Between "  + hr +":" + "15" + " to " + hr + ":" + "29";
	}
    
   

	

	var obj = {time: time,
	           day:  dayArray[maxDay]};


	console.log("max time created" +  obj);
	return obj;
}



app.listen(3001);
console.log("sever stared on port 3001");