'use strict'
var myApp = angular.module('myApp',[]);
myApp.controller('myCtrl', function($scope) {
    $scope.firstName = "John";
    $scope.lastName = "Doe";
});