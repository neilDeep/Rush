angular.module('consumer-Module', ['rush-Services', 'ngGeolocation', 'uiGmapgoogle-maps', 'firebase'])
   .controller('consumerController', function($scope, $geolocation, generalFactory, $firebaseAuth, $state) {
      $scope.Welcome = "Welcome";
      $scope.uid;
      var ref = new Firebase("https://fiery-inferno-8987.firebaseio.com");
      $scope.authObj = $firebaseAuth(ref);
      $scope.locationExists = false;

      $scope.myPosition = {};
      $scope.distance;
      $scope.rushRestaurants;
      $scope.rushPositions=[];
      //gets consumer geolcoation sets their geolocation to map center and current position, then it calls filter positions
      $geolocation.getCurrentPosition({
         timeout: 60000
      }).then(function(position) {
         $scope.myPosition.lat = position.coords.latitude;
         $scope.myPosition.lng = position.coords.longitude;
         $scope.locationExists = true;
      }).then(function() {
         $scope.map = {
            center: {
               latitude: $scope.myPosition.lat,
               longitude: $scope.myPosition.lng
            },
            zoom: 11
         };
         $scope.currentPositions = {
            latitude: $scope.myPosition.lat,
            longitude: $scope.myPosition.lng
         }
         $scope.filterPositions();
      })

      //when controller loads, this will check whether the user is authenticated.
      $scope.checkAuthentication = function() {
         $scope.authObj.$onAuth(function(authData) {
            if (authData) {
               $scope.uid = authData.auth.uid;
            } else {
               $state.go('signin');
            }
         })
      }
      $scope.checkAuthentication();
      //checks if the owners are in a 5 mile radius from the business and sends those restaurants to the view.
      $scope.counter = 2;
      $scope.filterPositions = function() {
         $scope.rushRestaurants = [];
         generalFactory.getRushes()
            .then(function(businessInfo) {
               console.log(businessInfo.data);
               for (var i = 0; i < businessInfo.data.length; i++) {
                  console.log("Positions", $scope.myPosition, businessInfo.data[i].location)
                  $scope.distance = generalFactory.findDistance($scope.myPosition, businessInfo.data[i].location);
                  if ($scope.distance <= 8046.72) {
                     $scope.temporary = {latitude: businessInfo.data[i].location.lat,
                     longitude: businessInfo.data[i].location.lng
                  }

                     $scope.counter++;
                     var tempObj = {
                        id: $scope.counter,
                        restName: businessInfo.data[i].restName,
                        deals: businessInfo.data[i].deals,
                        address: $scope.temporary
                     }
                     $scope.rushRestaurants.push(tempObj);
                  }
               }
            })
      }
   });
