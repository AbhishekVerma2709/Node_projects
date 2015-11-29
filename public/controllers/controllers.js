'use strict'
var myApp = angular.module('myApp',[]);
myApp.controller('myCtrl', function($scope,$http) {
    $scope.time ="";
    $scope.day = "";
    $scope.error ="";
    $scope.process="";
    $scope.findBestTime = function()
    {
    	  $scope.time ="";
          $scope.day = "";
          $scope.error ="";
          $scope.process = "Processing your username";
    	if(typeof $scope.username === 'undefined' || $scope.username == "")
    	{   
    		console.log("username undefined");
    		if(typeof $scope.userid === 'undefined' || $scope.userid == "" )
    		{   
    			console.log("userid undefined");
    			$scope.error = " Alteast one username or userid is needed";
    		}
    		return;
    	}
    	$scope.userNameToSend = { username: $scope.username,
    		                      userid: $scope.userid,
    	                          writable : true};
    	console.log($scope.userNameToSend);
    	console.log("Firing a request");
    	$http.get('/twittertime',{
       params: { user: $scope.userNameToSend }}).success(function(response)
       { 
       	   $scope.process ="";
       	   console.log("Got the request sucessfully");
       	   console.log(response);
           console.log("type of" + typeof response.error);
       	   if( typeof (response.error) !== "undefined")
       	   {    
       	   	   console.log("Inside the error");
       	   	   $scope.error = response.error;

       	   }
       	   else
       	   {    
       	   	   $scope.time = "Best time of tweet  : " + response.time;
       	   	   $scope.day = " Best day to tweet : " + response.day;

       	   }

         
       }).error(function(response)
       {     
       	     $scope.process ="";
       	     console.log("Got the request error" + response.error);
             $scope.error = "Internal error has occurred";

       });

    }

    $scope.reset = function()
    {
    	$scope.time ="";
    	$scope.day = "";
    	$scope.error ="";
    	$scope.username="";
    	$scope.userid="";
    }
});


