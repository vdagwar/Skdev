angular.module('app.controllers', ["LocalStorageModule"])

.controller('AppCtrl', function ($http, $scope, $ionicActionSheet, $timeout, $state, $window, $rootScope, ngAuthSettings, $ionicLoading, $ionicPopup, TaskService, localStorageService) {
    var serviceBase = ngAuthSettings.apiServiceBaseUri;
    $scope.lat = 0;
    $scope.lan = 0;
    $scope.hide = function () {
        $ionicLoading.hide();
    };

    /*---map----*/
    /*---Get gps coodinates----*/
    function showPosition(position) {
        $scope.lat = position.coords.latitude;
        $scope.lan = position.coords.longitude;
        console.log($scope.lat, $scope.lan);
        return position.coords.latitude + " " + position.coords.longitude;
    }
    function getLocation() {
        if (navigator.geolocation) {
            var res = navigator.geolocation.getCurrentPosition(showPosition);
            return res;

        } else {
            x.innerHTML = "Geolocation is not supported by this browser.";
        }
    }
    getLocation();
    var StartOrEnd = "";
    function myTimer() {
        $scope.ClientData = localStorageService.get('clientData');
        if ($scope.ClientData != null) {
            var d = new Date();
            var hr = d.getHours();
            //if (hr > 9 && hr < 21) {
            var latlong = getLocation();
            var url = serviceBase + "api/GpsController/GpsUpdate";
            if ($scope.lat == 0) {
                StartOrEnd = "Start";
                $scope.lat = 22.704765;
                $scope.lan = 75.825104;
            } else {
                StartOrEnd = ""
            }
            console.log("mytimer:-" + $scope.lat, $scope.lan);
            var dataToPost = {
                DeliveryBoyId: $scope.ClientData.PeopleID,
                lat: $scope.lat,
                lg: $scope.lan,
                StartOrEnd: StartOrEnd
            };
            $http.post(url, dataToPost)
            .success(function (data) {
            })
             .error(function (data) {
             })
            //}
        }
    }
    var getgps;
    function myStartFunction() {
        getgps = setInterval(function () { myTimer() }, 600000);
    }
    //myStartFunction();
    $scope.showassignments = true;
    $scope.starttasks = false;
    $scope.$on('start', function (event, msg) {
        myTimer();
        myStartFunction();
        $scope.starttasks = true;

    });
    $scope.$on('orderaction', function (event, msg) {
        myTimer();
    });

    $scope.$on('stop', function (event, msg) {
        var rs = $scope.stopNcleartasks();
        $scope.ClientData = localStorageService.get('clientData');
        //$scope.showassignments = true;
        //localStorageService.set("Tasks", null);
        if (rs) {
            clearInterval(getgps);
            $scope.showassignments = true;
            localStorageService.set("Tasks", null);
        }
        if ($scope.ClientData != null && rs) {
            var url = serviceBase + "api/GpsController/GpsUpdate";
            var dataToPost = {
                DeliveryBoyId: $scope.ClientData.PeopleID,
                lat: 22.704765,
                lg: 75.825104,
                StartOrEnd: "End"
            };

            $http.post(url, dataToPost)
            .success(function (data) {
                window.location.reload();
            })
             .error(function (data) {

             })
            window.location.reload();
        }

    });
    $scope.stopNcleartasks = function () {
        $scope.Tasks1 = localStorageService.get('Tasks');
        if ($scope.Tasks1 != null) {
            if ($scope.Tasks1.length > 0) {
                for (var i = 0; i < $scope.Tasks1.length; i++) {
                    if ($scope.Tasks1[i].Status == "Delivered" || $scope.Tasks1[i].Status == "Delivery Canceled" || $scope.Tasks1[i].Status == "Delivery Redispatch") {
                    } else {
                        return false;
                    }
                }
            }
            return true;
        } else { return true }
    };
    $scope.gettasks = function () {
        $scope.ClientData = localStorageService.get('clientData');
        if ($scope.ClientData != null) {
            $http.get(serviceBase + "api/DeliveryTask?mob=" + $scope.ClientData.Mobile).then(function (results) {
                $scope.Tasks = results.data;

                localStorageService.set("Tasks", results.data);
                $scope.hide();
                window.location = "#/task";
                //try {
                //    if ($scope.Tasks.length == 0) {
                //        $ionicPopup.alert({
                //            title: 'Alert',
                //            template: 'No Tasks Available !'
                //        }).then(function () {
                //        });
                //    }
                //} catch (exc) {
                //    $ionicPopup.alert({
                //        title: 'Alert',
                //        template: 'No Tasks Available !'
                //    }).then(function () {
                //    });
                //}
            },
   function (data) {
   });

        }
    }
})

.controller('loginCtrl', function ($scope, ngAuthSettings, $http, localStorageService, $ionicLoading, $ionicPopup) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;
    $scope.$on("$ionicView.enter", function () {
        $scope.ClientData = localStorageService.get('clientData');
        if ($scope.ClientData == null) {
            window.location = "#/login";
        } else {
            window.location = "#/task";
        }
    });


    $scope.signin = function (data) {
        $ionicLoading.show({
            noBackdrop: false,
            template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>',
            duration: 200//Optional
        });
        //window.location = "#/home";
        var url = serviceBase + "api/DBSignup";
        debugger;
        $http.post(url, data).then(function (results) {
            debugger;
            results.data;
            $scope.hide();
            if (results.data == "Wrong Password") {
                $ionicPopup.alert({
                    title: 'Alert',
                    template: 'Wrong Password !'
                }).then(function () {
                });
                //alert(results.data);
            } else if (results.data == "Not a Registered Delivery Boy") {
                $ionicPopup.alert({
                    title: 'Alert',
                    template: 'Not a Registered Delivery Boy !'
                }).then(function () {
                });
                //alert(results.data);
            } else if (results.data == "") {
                var myPopup = $ionicPopup.show({
                    template: '<div style="text-align: center;"><div style="padding-bottom:20px; font-size:20px;"><strong>Enter your data</strong></div></div>',
                    title: 'Alert',
                    duration: 200//Optional
                });
                $ionicPopup.alert({
                    title: 'Wrong Password',
                    template: 'Enter your Mobile & Password !'
                }).then(function () {
                });
                //alert(results.data);
            } else {
                localStorageService.set('clientData', { DisplayName: results.data.DisplayName, Mobile: results.data.Mobile, Password: results.data.Password, Warehouseid: results.data.Warehouseid, City: results.data.city, PeopleID: results.data.PeopleID, Role: 'SalesPerson', isAuth: true });
                window.location = "#/task";
            }
            $scope.hide();
        });
    }
    $scope.hide = function () {
        $ionicLoading.hide();
    };

})

.controller('AssignedProductsCtrl', function ($scope, $timeout, $http, $rootScope, ngAuthSettings, localStorageService, $ionicActionSheet, $state, $window, $ionicHistory, $ionicLoading, $ionicPopup) {
    var serviceBase = ngAuthSettings.apiServiceBaseUri;
  
    $scope.hide = function () {
        $ionicLoading.hide();
    };
    $scope.oldissuelist = false;
    $scope.$on("$ionicView.enter", function () {
        $scope.ClientData = localStorageService.get('clientData');
        if ($scope.ClientData == null) {
            window.location = "#/login";
        }
        $scope.showassignments = $scope.$parent.showassignments;

    });
    $scope.DeliveryIssuance = [];
    $scope.getclosedissuance = function () {
        
        $scope.ClientData = localStorageService.get('clientData');
        if ($scope.ClientData != null && $scope.showassignments) {
            $ionicLoading.show({
                noBackdrop: false,
                template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>',
                //duration: 200//Optional
            });
            var url = serviceBase + "api/DeliveryIssuance?all=0&id=" + $scope.ClientData.PeopleID;
            $http.get(url).then(function (results) {
             
                $scope.DeliveryIssuance = results.data;
               
                $scope.hide();
                $scope.oldissuelist = true;
            });
        }

    }
    $scope.getisuancelist = function () {
      
        $ionicLoading.show({
            noBackdrop: false,
            template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>',
            //duration: 200//Optional
        });
        $scope.ClientData = localStorageService.get('clientData');
        if ($scope.ClientData != null && $scope.showassignments) {
     
            var url = serviceBase + "api/DeliveryIssuance?id=" + $scope.ClientData.PeopleID;
            $http.get(url).then(function (results) {
          
                $scope.oldissuelist = false;
                $scope.DeliveryIssuance = results.data;
                localStorageService.set('Iddel', results.data[0].DeliveryIssuanceId );
                console.log(" $scope.DeliveryIssuance", $scope.DeliveryIssuance);
                $scope.hide();
            });
        
            $scope.DeliveryIssuance = localStorageService.get('Iddel');
            console.log(" $scope.DeliveryIssuance", $scope.DeliveryIssuance);
        }

    }

    //$scope.getisuancelist();

    $scope.showproducts = function (id) {
        document.getElementById(id).style.display = "block";
    }
    $scope.hideproducts = function (id) {
        document.getElementById(id).style.display = "none";
    }
    $scope.Accept = function (data) {
   
        var url = serviceBase + "api/DeliveryIssuance";

        data.Acceptance = true;
        
        $ionicLoading.show({
            noBackdrop: false,
            template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>',
        });
        
        $http.put(url, data)
        .success(function (data) {
            $scope.hide();
            $scope.$parent.showassignments = false;
            $scope.$parent.gettasks();
        })
         .error(function (data) {
             $scope.hide();
         })
    }
    $scope.Reject = function (data) {
        var rr = document.getElementById("rsn" + data.DeliveryIssuanceId).value;
        var url = serviceBase + "api/DeliveryIssuance";
        data.Acceptance = false;
        $ionicLoading.show({
            noBackdrop: false,
            template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>',
        });
        data.RejectReason = rr
        $http.put(url, data)
        .success(function (data) {
            $scope.hide();

        })
         .error(function (data) {
             $scope.hide();
         })
    }

    $scope.Cancel = function (id) {
        document.getElementById("Rej" + id).style.display = "none";
    }
    $scope.rejreason = function (id) {
        document.getElementById("Rej" + id).style.display = "block";
    }
    $scope.showdetails = function () {
        var hideSheet = $ionicActionSheet.show({
            buttons: [
                 { text: '<i class="ion-person space"></i>Profile' },
                 { text: '<i class="ion-ios-help-outline space"></i>Tasks' },
                 { text: '<i class="ion-information space"></i>Assignments' },
                 { text: '<i class="ion-archive icon_colour12 space"></i>History' },
                 { text: '<i class="ion-log-out icon_colour12 space"></i>Logout' }
            ],
            titleText: 'Info',
            cancelText: 'Cancel',
            cancel: function () {
            },
            buttonClicked: function (index) {
                switch (index) {
                    case 0:
                        $state.go('Profile');
                        $window.location.href = ('#/profile');
                        break;
                    case 1:
                        $state.go('task');
                        $window.location.href = ('#/task');
                        break;
                    case 2:
                        $state.go('AssignedProducts');
                        $window.location.href = ('#/AssignedProducts');
                        return true;

                    case 3:
                        $window.location.href = ('#/TaskHistory');
                        break;
                    case 4:
                        $rootScope.$broadcast('stop', 'Two');
                        $ionicHistory.clearHistory();
                        $ionicHistory.clearCache();
                        window.localStorage.clear();
                        //$window.location.reload(true);
                        $window.location.href = ('#/login');
                        return true;
                }
            }
        });
        // For example's sake, hide the sheet after two seconds
        $timeout(function () {
            hideSheet();
        }, 9000);
    };

})

.controller('taskCtrl', function ($http, $scope, $ionicActionSheet, $timeout, $state, $window, $rootScope, ngAuthSettings, $ionicHistory, TaskService, localStorageService, $ionicLoading, $ionicPopup) {
    /// calling delivery tasks

    $scope.ClientData = localStorageService.get('clientData');
    $scope.$on("$ionicView.enter", function () {
        $scope.ClientData = localStorageService.get('clientData');
        if ($scope.ClientData == null) {
            window.location = "#/login";
        } else { $scope.gettasks(); }

        $scope.stp = $scope.$parent.stopNcleartasks();

        $scope.currencystp = $scope.$parent.stopNcleartasks();
    });
    $scope.hide = function () {
        $ionicLoading.hide();
    };
    $scope.stopwatches = [{ interval: 1000, log: [] }];
    var serviceBase = ngAuthSettings.apiServiceBaseUri;
    $scope.Tasks = [];
    $scope.gettasks = function () {
        if ($scope.ClientData == null) {
            window.location = "#/login";
        } else {
            $ionicLoading.show({
                noBackdrop: false,
                template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>',
            });
            $scope.Tasks = localStorageService.get('Tasks');
            $scope.hide();
            try {
                if ($scope.Tasks.length == 0) {
                    $ionicPopup.alert({
                        title: 'Alert',
                        template: 'No Tasks Available !'
                    }).then(function () {
                    });
                }
            } catch (exc) {
                $ionicPopup.alert({
                    title: 'Alert',
                    template: 'No Tasks Available !'
                }).then(function () {
                });
            };
        }
    }
    $scope.showdetails = function () {
        var hideSheet = $ionicActionSheet.show({
            buttons: [
                 { text: '<i class="ion-person space"></i>Profile' },
                 { text: '<i class="ion-ios-help-outline space"></i>Tasks' },
                 { text: '<i class="ion-information space"></i>Assignments' },
                 { text: '<i class="ion-archive icon_colour12 space"></i>History' },
                  { text: '<i class="ion-archive icon_colour12 space"></i>OrderAssissment' },
                 { text: '<i class="ion-log-out icon_colour12 space"></i>Logout' }//               { text: '<i class="ios-compass-outline icon_colour12 space"></i>Route' }
            ],
            titleText: 'Info',
            cancelText: 'Cancel',
            cancel: function () {
            },
            buttonClicked: function (index) {
                switch (index) {
                    case 0:
                        $state.go('Profile');
                        $window.location.href = ('#/profile');
                        break;
                    case 1:
                        $state.go('task');
                        $window.location.href = ('#/task');
                        return true;
                    case 2:
                        $state.go('AssignedProducts');
                        $window.location.href = ('#/AssignedProducts');
                        break;
                    case 3:
                        $window.location.href = ('#/TaskHistory');
                        break;
                    case 4:
                        $window.location.href = ('#/OrderAssissment');
                        break;
                    case 5:
                        $rootScope.$broadcast('stop', 'Two');
                        $ionicHistory.clearHistory();
                        $ionicHistory.clearCache();
                        window.localStorage.clear();
                        //$window.location.reload(true);
                        $window.location.href = ('#/login');
                        return true;


                }
            }
        });
        // For example's sake, hide the sheet after two seconds
        $timeout(function () {
            hideSheet();
        }, 9000);
    };
    $scope.gettaskdetails = function (data) {
        // (data.Status != "Delivered" || data.Status != "Delivery Redispatch" || data.Status != "Delivery Canceled")
        if (data.Status == "Delivered") {
            //$ionicPopup.alert({
            //    title: 'Alert',
            //    template: 'Already Delivered!'
            //}).then(function () {
            //});
            //return;
            TaskService._setdata(data);
            $window.location.href = ('#/TaskHistoryDetails/' + data.OrderId);
        } else if ($scope.$parent.starttasks) {
            //if (data.Status == "Shipped") {
            TaskService._setdata(data);
            $window.location.href = ('#/taskDetails/' + data.OrderId);
            //}

        } else {
            $ionicPopup.alert({
                title: 'चेतावनी',
                template: 'कृपया start  बटन दबाये !'
            }).then(function () {
            });
        }
    }
    $scope.gettaskOL = function () {
        //second
        $http.get(serviceBase + "api/DeliveryTask?mob=" + $scope.ClientData.Mobile).then(function (results) {
            $scope.Tasks = results.data;
            localStorageService.set("Tasks", results.data);
            console.log($scope.Tasks);
        });
    }
    //$scope.gettaskOL();
    $scope.getcurrency = function () {
        window.location = "#/OrderCurrency";
    }

})

.controller('taskdetailsCtrl', function ($http, localStorageService, $ionicModal, $stateParams, $scope, $ionicActionSheet, $timeout, $state, $window, $rootScope, ngAuthSettings, TaskService, $ionicPopup, $ionicLoading) {
    var serviceBase = ngAuthSettings.apiServiceBaseUri;
 
    $scope.tgshow = true;
    $scope.id = $stateParams.type;
    $scope.details = TaskService._getDetail();
    $scope.hide = function () {
        $ionicLoading.hide();
    };
    $scope.delivered = function (data) {
        if (data.Status == "Products Dispatched" || data.Status == "" || data.Status == "Shipped") {
            // alert("Select Status");
            $ionicPopup.alert({
                title: 'चेतावनी',
                template: 'Status चयन करे !'
            }).then(function () {
            });
        }

        if (data.Status == "Delivery Redispatch" || data.Status == "Delivery Canceled") {
            if (data.comments != "") {
                var url = serviceBase + "api/DeliveryTask";
                if (data.ReDispatchCount >= 2 && data.Status == "Delivery Redispatch") {
                    $ionicPopup.alert({
                        title: 'Alert',
                        template: 'Redispactch cannot be more than twice !'
                    }).then(function () {
                    });
                    return;
                }
                var confirmPopup = $ionicPopup.confirm({
                    title: 'चेतावनी',
                    template: 'क्या आप वाकई ' + ' ' + data.Status + ' करना  चाहते हैं? '
                });

                confirmPopup.then(function (res) {
                    if (res) {
                        data["Signimg"] = $scope.Signimg;
                        $http.post(url, data)
                            .success(function (data, status) {
                                $scope.hide();
                                $ionicPopup.alert({
                                    title: 'Alert',
                                    template: data.Status + '!'
                                }).then(function () {
                                });
                                $rootScope.$broadcast('orderaction', 'Two');
                                $scope.Tasks = localStorageService.get('Tasks');
                                if ($scope.Tasks != null) {
                                    for (var i = 0; i < $scope.Tasks.length; i++) {
                                        if ($scope.Tasks[i].OrderDispatchedMasterId == data.OrderDispatchedMasterId) {
                                            $scope.Tasks[i].Status = data.Status;
                                            $scope.Tasks[i].CheckAmount = data.CheckAmount;
                                            $scope.Tasks[i].CheckNo = data.CheckNo;
                                            $scope.Tasks[i].ElectronicAmount = data.ElectronicAmount;
                                            $scope.Tasks[i].ElectronicPaymentNo = data.ElectronicPaymentNo;
                                            $scope.Tasks[i].CashAmount = data.CashAmount;
                                            $scope.Tasks[i].ReDispatchCount = data.ReDispatchCount;
                                            $scope.Tasks[i].comments = data.comments;
                                        }
                                    }
                                    localStorageService.set("Tasks", $scope.Tasks);
                                }
                                window.location = "#/task";
                            }).error(function () {
                                $scope.hide();
                                window.location = "#/task";
                                $ionicPopup.alert({
                                    title: 'Alert',
                                    template: 'Error Occured!'
                                }).then(function () {
                                });
                            });
                        console.log('You are sure');
                    }
                    else {
                        console.log('You are not sure');
                    }
                })

            } else {
                $ionicPopup.alert({
                    title: 'चेतावनी',
                    template: 'कृपया Comment करें !'
                }).then(function () {
                });
            }

        } else if (data.Status == "Delivered") {
            $scope.details.OrderId;
            data.RecivedAmount = document.getElementById("reciveamnt").value;
            var cashamt = document.getElementById("cashamt").value;
            var cheqamt = document.getElementById("cheqamt").value;
            var cheqno = document.getElementById("cheqno").value;
            var cheqamt = document.getElementById("cheqamt").value;
            var electroamt = document.getElementById("electroamt").value;
            var electrno = document.getElementById("electrno").value;

            if (cashamt != "") {
                data.CashAmount = parseInt(cashamt);
            } else { data.CashAmount = 0; }
            if (electroamt != "") {
                data.ElectronicAmount = parseInt(electroamt);
            } else { data.ElectronicAmount = 0; }
            if (cheqamt != "") {
                data.CheckAmount = parseInt(cheqamt);
            } else { data.CheckAmount = 0; }

            data.CheckNo = cheqno;
            data.ElectronicPaymentNo = electrno;
            data.RecivedAmount = data.CashAmount + data.ElectronicAmount + data.CheckAmount;

            if (data.ElectronicAmount > 0 && data.ElectronicPaymentNo == "") {
                $ionicPopup.alert({
                    title: 'Alert',
                    template: 'Enter Payment No. !'
                }).then(function () {
                });
                return;
            }
            if (data.CheckAmount > 0 && data.CheckNo == "") {
                $ionicPopup.alert({
                    title: 'Alert',
                    template: 'Enter Cheque No. !'
                }).then(function () {
                });
                return;
            }
            if (data.GrossAmount == data.RecivedAmount) {
                var url = serviceBase + "api/DeliveryTask";
                var confirmPopup = $ionicPopup.confirm({
                    title: 'चेतावनी',
                    template: 'क्या आप वाकई Submit करने के इच्छुक हैं?'
                });
                confirmPopup.then(function (res) {
                    if (res) {
                        data["Signimg"] = $scope.Signimg;
                        $http.post(url, data)
                  .success(function (data, status) {
                      $scope.hide();
                      $rootScope.$broadcast('orderaction', 'Two');
                      $scope.Tasks = localStorageService.get('Tasks');
                      if ($scope.Tasks != null) {
                          for (var i = 0; i < $scope.Tasks.length; i++) {
                              if ($scope.Tasks[i].OrderDispatchedMasterId == data.OrderDispatchedMasterId) {
                                  $scope.Tasks[i].Status = data.Status;
                                  $scope.Tasks[i].CheckAmount = data.CheckAmount;
                                  $scope.Tasks[i].CheckNo = data.CheckNo;
                                  $scope.Tasks[i].ElectronicAmount = data.ElectronicAmount;
                                  $scope.Tasks[i].ElectronicPaymentNo = data.ElectronicPaymentNo;
                                  $scope.Tasks[i].CashAmount = data.CashAmount;
                                  $scope.Tasks[i].ReDispatchCount = data.ReDispatchCount;
                                  $scope.Tasks[i].comments = data.comments;
                              }
                          }
                          localStorageService.set("Tasks", $scope.Tasks);
                      }
                      window.location = "#/task";
                      $ionicPopup.alert({
                          title: 'Alert',
                          template: 'Order Delivered !'
                      }).then(function () {
                      });
                  }).error(function () {
                      $scope.hide();
                      window.location = "#/task";
                      $ionicPopup.alert({
                          title: 'Alert',
                          template: 'Order Not Delivered!'
                      }).then(function () {
                      });
                  });
                        console.log('You are sure');
                    } else {
                        console.log('You are not sure');
                    }
                })

            } else {

                $ionicPopup.alert({
                    title: 'चेतावनी',
                    template: 'प्राप्त राशि के बिल के बराबर नहीं है !'
                }).then(function () {
                });
            }
        }


    }

    $scope.$on("$ionicView.enter", function () {
        $scope.ClientData = localStorageService.get('clientData');
        if ($scope.ClientData == null) {
            window.location = "#/login";
        }
        $scope.Signimg = "";
    });
    $scope.signpad = false;
    $scope.showsignpad = function () {
        $scope.signpad = !$scope.signpad;
    }

    var wrapper = document.getElementById("signature-pad"),
    clearButton = wrapper.querySelector("[data-action=clear]"),
    savePNGButton = wrapper.querySelector("[data-action=save-png]"),
    canvas = wrapper.querySelector("canvas"),
    signaturePad;
    function resizeCanvas() {
        var ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext("2d").scale(ratio, ratio);
    }
    window.onresize = resizeCanvas;
    resizeCanvas();
    signaturePad = new SignaturePad(canvas);
    clearButton.addEventListener("click", function (event) {
        signaturePad.clear();
    });
    savePNGButton.addEventListener("click", function (event) {
        if (signaturePad.isEmpty()) {
            alert("Please provide signature first.");
        } else {
            var Signimg = signaturePad.toDataURL("image/png");
            $scope.Signimg = Signimg
            console.log($scope.Signimg);
        }
    });

})

.controller('taskHistoryCtrl', function ($http, $scope, $ionicActionSheet, $timeout, $state, $window, $rootScope, ngAuthSettings, $ionicHistory, TaskService, localStorageService, $ionicLoading, $ionicPopup) {
    /// calling delivery tasks

    $scope.ClientData = localStorageService.get('clientData');
    $scope.$on("$ionicView.enter", function () {
        $scope.ClientData = localStorageService.get('clientData');
        if ($scope.ClientData == null) {
            window.location = "#/login";
        } else {
            $scope.end = new Date();
            $scope.start = new Date();
            $scope.start.setDate($scope.end.getDate() - 3);
        }
    });
    $scope.hide = function () {
        $ionicLoading.hide();
    };



    var serviceBase = ngAuthSettings.apiServiceBaseUri;
    $scope.Tasks = [];
    $scope.gettasks = function () {
        if ($scope.ClientData == null) {
            window.location = "#/login";
        } else {
            var start = document.getElementById('start').value;//"01/11/2017 12:00 AM";
            var end = document.getElementById('end').value; //"01/17/2017 12:00 AM";


            if (start == "" || end == "") {
                $ionicPopup.alert({
                    title: 'चेतावनी',
                    template: 'Status चयन करे!'
                }).then(function () {
                });
                return;
            }
            $ionicLoading.show({
                noBackdrop: false,
                template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>',
            });
            $http.get(serviceBase + "api/DeliveryTask?mob=" + $scope.ClientData.Mobile + "&start=" + start + "&end=" + end + "&dboyId=" + $scope.ClientData.PeopleID).then(function (results) {
                $scope.TasksHistory = results.data;
                if (results.data.length == 0) {
                    $ionicPopup.alert({
                        title: 'Alert',
                        template: 'No History data!'
                    }).then(function () {
                    });
                }
                $scope.hide();
            }, function (data) { $scope.hide(); });
        }
    }
    $scope.showdetails = function () {
        var hideSheet = $ionicActionSheet.show({
            buttons: [
                 { text: '<i class="ion-person space"></i>Profile' },
                 { text: '<i class="ion-ios-help-outline space"></i>Tasks' },
                 { text: '<i class="ion-information space"></i>Assignments' },
                 { text: '<i class="ion-archive icon_colour12 space"></i>History' },
                 { text: '<i class="ion-log-out icon_colour12 space"></i>Logout' }
            ],
            titleText: 'Info',
            cancelText: 'Cancel',
            cancel: function () {
            },
            buttonClicked: function (index) {
                switch (index) {
                    case 0:
                        $state.go('Profile');
                        $window.location.href = ('#/profile');
                        break;
                    case 1:
                        $state.go('task');
                        break;
                    case 2:
                        $state.go('AssignedProducts');
                        $window.location.href = ('#/AssignedProducts');
                        break;
                    case 3:
                        $state.go('AssignedProducts');
                        return true;
                    case 4:
                        $rootScope.$broadcast('stop', 'Two');
                        $ionicHistory.clearHistory();
                        $ionicHistory.clearCache();
                        window.localStorage.clear();
                        //$window.location.reload(true);
                        $window.location.href = ('#/login');
                        return true;
                }
            }
        });
        // For example's sake, hide the sheet after two seconds
        $timeout(function () {
            hideSheet();
        }, 9000);
    };
    $scope.gettaskdetails = function (data) {
        TaskService._setdata(data);
        $window.location.href = ('#/TaskHistoryDetails/' + data.OrderId);
    }

})

.controller('taskHistoryDetailsCtrl', function ($http, localStorageService, $stateParams, $scope, $ionicActionSheet, $timeout, $state, $window, $rootScope, ngAuthSettings, TaskService, $ionicPopup) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;
    $scope.id = $stateParams.type;
    $scope.details = TaskService._getDetail();

    $scope.$on("$ionicView.enter", function () {
        $scope.ClientData = localStorageService.get('clientData');
        if ($scope.ClientData == null) {
            window.location = "#/login";
        }
    });
})

.controller('profileCtrl', function ($scope, $ionicActionSheet, $http, ngAuthSettings, localStorageService, $state, $window, $ionicHistory, $ionicPopup) {
    $scope.showdetails = function () {
        var hideSheet = $ionicActionSheet.show({
            buttons: [
                 { text: '<i class="ion-person space"></i>Profile' },
                 { text: '<i class="ion-ios-help-outline space"></i>Tasks' },
                 { text: '<i class="ion-information space"></i>Assignments' },
                 { text: '<i class="ion-log-out icon_colour12 space"></i>Logout' }
            ],
            titleText: 'Info',
            cancelText: 'Cancel',
            cancel: function () {
            },
            buttonClicked: function (index) {
                switch (index) {
                    case 0:
                        $state.go('Profile');
                        $window.location.href = ('#/profile');
                        break;
                    case 1:
                        $state.go('task');
                        $window.location.href = ('#/task');
                        break;
                    case 2:
                        $state.go('AssignedProducts');
                        $window.location.href = ('#/AssignedProducts');
                        break;
                    case 3:
                        $ionicHistory.clearHistory();
                        $ionicHistory.clearCache();
                        window.localStorage.clear();
                        //$window.location.reload(true);
                        $window.location.href = ('#/login');
                        return true;
                }
            }
        });
        // For example's sake, hide the sheet after two seconds
        $timeout(function () {
            hideSheet();
        }, 9000);
    };
    $scope.stoptimer = function () {
        $scope.$parent.stoptimerapp();
    }
    $scope.Starttimer = function () {
        $scope.$parent.Starttimerapp();
    }
    $scope.ClientData = localStorageService.get('clientData');
    $scope.$on("$ionicView.enter", function () {
        $scope.ClientData = localStorageService.get('clientData');
        if ($scope.ClientData == null) {
            window.location = "#/login";
        }
    });
    $scope.showdetails = function () {
        var hideSheet = $ionicActionSheet.show({
            buttons: [
                 { text: '<i class="ion-person space"></i>Profile' },
                 { text: '<i class="ion-ios-help-outline space"></i>Tasks' },
                 { text: '<i class="ion-information space"></i>Assignments' },
                 { text: '<i class="ion-log-out icon_colour12 space"></i>Logout' }
            ],
            titleText: 'Info',
            cancelText: 'Cancel',
            cancel: function () {
            },
            buttonClicked: function (index) {
                switch (index) {
                    case 0:
                        $state.go('Profile');
                        $window.location.href = ('#/profile');
                        return true;
                    case 1:
                        $state.go('task');
                        $window.location.href = ('#/task');
                        break;
                    case 2:
                        $state.go('AssignedProducts');
                        $window.location.href = ('#/AssignedProducts');
                        break;

                    case 3:
                        $rootScope.$broadcast('stop', 'Two');
                        $ionicHistory.clearHistory();
                        $ionicHistory.clearCache();
                        window.localStorage.clear();
                        //$window.location.reload(true);
                        $window.location.href = ('#/login');
                        return true;
                }
            }
        });
        // For example's sake, hide the sheet after two seconds
        $timeout(function () {
            hideSheet();
        }, 9000);
    };

})

.controller('NotesCtrl', function ($http, $scope, $ionicActionSheet, $timeout, $state, $window, $rootScope, ngAuthSettings, TaskService, $ionicPopup) {
    $scope.showdetails = function () {
        var hideSheet = $ionicActionSheet.show({
            buttons: [
                 { text: '<i class="ion-person space"></i>Profile' },
                 { text: '<i class="ion-ios-help-outline space"></i>Support' },
                 { text: '<i class="ion-information space"></i>Tutorials' },
                 { text: '<i class="ion-wrench space"></i>Setting' },
                 { text: '<i class="ion-log-out icon_colour12 space"></i>Logout' }
            ],
            // destructiveText: 'Delete',
            titleText: 'Info',
            cancelText: 'Cancel',
            cancel: function () {
                // add cancel code..
            },
            buttonClicked: function (index) {
                switch (index) {
                    case 0:
                        $state.go('Profile');
                        $window.location.href = ('#/profile');
                        break;
                    case 1:
                        $state.go('Support');
                        $window.location.href = ('#/support');
                        break;
                    case 2:
                        $state.go('Tutorials');
                        $window.location.href = ('#/tut');
                        break;
                    case 3:
                        $state.go('Setting');
                        $window.location.href = ('#/setting');
                        break;
                    case 4:
                        $state.go('Logout');
                        $window.location.href = ('#/logout');
                        break;
                    case 5:

                        $scope.ClientData = null;
                        localStorageService.set('clientData', $scope.ClientData);
                        $window.location.reload(true);
                        $state.go('app.signup');
                        // $window.location.href = ('#/app/signup');
                        break;
                        return true;
                }
            }
        });
        // For example's sake, hide the sheet after two seconds
        $timeout(function () {
            hideSheet();
        }, 9000);
    };

    $scope.details = TaskService._getDetail();
})
.controller('routeCtrl', function ($http, $scope, $ionicActionSheet, $timeout, $state, $window, $rootScope, ngAuthSettings, TaskService, localStorageService, $ionicLoading, $ionicHistory, $interval) {
    $scope.showMap = true;
    $scope.showList = true;
    $scope.ClientData = localStorageService.get('clientData');
    var serviceBase = ngAuthSettings.apiServiceBaseUri;
    $scope.ClientData.PeopleID;
    var AddressCalculated = [];
    var AddressFinal = [];
    var Visited = [];
    var AddressCollection = [{ 'name': 'one', 'lat': 22.708468, 'long': 75.855092, 'origin': true, 'visited': true, 'live': false },
        { 'name': 'two', 'lat': 22.738468, 'long': 75.865092, 'origin': false, 'visited': false, 'live': false },
        { 'name': 'three', 'lat': 22.758468, 'long': 75.875092, 'origin': false, 'visited': false, 'live': false },
        { 'name': 'four', 'lat': 22.778468, 'long': 75.875092, 'origin': false, 'visited': false, 'live': false },
        { 'name': 'five', 'lat': 22.718468, 'long': 75.885092, 'origin': false, 'visited': false, 'live': false },
        { 'name': 'six', 'lat': 22.798468, 'long': 75.895092, 'origin': false, 'visited': false, 'live': false }]
    $scope.lat = 0;
    $scope.lan = 0;
    var map, currentPositionMarker, mapCenter = new google.maps.LatLng(22.708468, 75.855092), map;
    function getMax(arr) {
        var min;
        var obj;
        for (var i = 0 ; i < arr.length ; i++) {
            if (arr[i] != undefined) {
                if (!min || parseInt(arr[i].distance) < parseInt(min)) {
                    min = arr[i].distance;
                    obj = arr[i];
                }
            }
        }
        return obj;
    }
    //   httpGet('http://maps.googleapis.com/maps/api/directions/json?origin=Toronto&destination=Montreal&sensor=false');

    function httpGet(addr1, addr2) {
        var obj = { 'source': '', 'destination': '', 'distance': 0, 'minimum': false };
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", 'https://maps.googleapis.com/maps/api/directions/json?origin=' + addr1.lat + ',' + addr1.long + '&destination=' + addr2.lat + ',' + addr2.long + '&sensor=false', false); // false for synchronous request
        xmlHttp.send(null);
        var jsn = JSON.parse(xmlHttp.responseText);
        if (jsn.routes != undefined && jsn.routes.length != 0) {
            var leg = jsn.routes[0].legs;
            var val = leg[0].distance.value;
            obj.distance = val;
            obj.source = addr1;
            obj.destination = addr2;
            return obj;
            // draw(addr1, addr2, obj);
        }
    }
    $scope.withoutorigin = [];
    $scope.start = [];
    function draw() {
        $scope.withoutorigin = [];
        //  google.maps.event.addDomListener(window, 'load', initialize1);
        $scope.origin = { lat: originAddress.lat, lng: originAddress.long };
        $scope.origin.stopover = true;
        $scope.destination = { lat: originAddress.lat, lng: originAddress.long };
        $scope.destination.stopover = false;
        $rootScope.wayPoints = [];

        var k = 0;
        for (var i = 0; i < AddressFinal.length; i++) {
            if (AddressFinal[i].path.destination.origin != true) {
                var obj = { location: { lat: 0, lng: 0 }, stopover: false };
                obj.location.lat = AddressFinal[i].path.destination.lat;
                obj.location.lng = AddressFinal[i].path.destination.long;
                $rootScope.wayPoints.push(obj);
                var objt = { name: '', position: [0, 0], id: 0 };
                var num = k + 1;
                objt.name = num.toString();
                objt.id = AddressFinal[i].path.destination.name;
                objt.position[0] = AddressFinal[i].path.destination.lat;
                objt.position[1] = AddressFinal[i].path.destination.long;
                $scope.withoutorigin.push(objt);
                k = k + 1;
            }
        }
        initLocationProcedure();
    }
    $scope.Tasks = [];
    $scope.hide = function () {
        $ionicLoading.hide();
    };
    $scope.start = function () {
        if ($scope.ClientData == null) {
            window.location = "#/login";
        } else {
            $ionicLoading.show({
                noBackdrop: false,
                template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>',
                //duration: 200//Optional
            });
            $http.get(serviceBase + "api/DeliveryTask?mob=" + $scope.ClientData.Mobile).then(function (results) {
                AddressCollection = [];
                var org = { 'name': 'one', 'lat': 22.704765, 'long': 75.825104, 'origin': true, 'visited': true, 'live': false };
                AddressCollection.push(org);
                $scope.Tasks = results.data;
                for (var i = 0; i < $scope.Tasks.length; i++) {
                    if ($scope.Tasks[i].lat != 0) {
                        var obj = { 'name': '', 'lat': 0, 'long': 0, 'origin': false, 'visited': false, 'live': false };
                        obj.name = $scope.Tasks[i].OrderId;
                        obj.lat = $scope.Tasks[i].lat;
                        obj.long = $scope.Tasks[i].lg;
                        AddressCollection.push(obj);
                    }
                }
                $scope.hide();
                $timeout(function () {
                    startMap();
                }, 1000);
            })

            //By MK
            //AddressCollection = [];
            ////for origin
            //var org = { 'name': 'one', 'lat': 22.704765, 'long': 75.825104, 'origin': true, 'visited': true, 'live': false };
            //AddressCollection.push(org);
            //$scope.Tasks = localStorageService.get('Tasks');
            //if ($scope.Tasks != null) {
            //    for (var i = 0; i < $scope.Tasks.length; i++) {
            //        var obj = { 'name': '', 'lat': 0, 'long': 0, 'origin': false, 'visited': false, 'live': false };
            //        obj.name = $scope.Tasks[i].OrderId;
            //        obj.lat = $scope.Tasks[i].lat;
            //        obj.long = $scope.Tasks[i].lg;
            //        AddressCollection.push(obj);
            //    }
            //    $scope.hide();
            //    $timeout(function () {
            //        startMap();
            //    }, 1000);
            //} else {
            //    $timeout(function () {
            //        startMap();
            //    }, 1000);
            //}
        }
    }
    $scope.clickMarker = function (data) {
        
        console.log(data);
        var obj = GetSingleTask(data.id);
        TaskService._setdata(obj);
        $window.location.href = ('#/taskDetails/' + obj.OrderId);
    }
    function GetSingleTask(id) {
        for (var i = 0; i < $scope.Tasks.length; i++) {
            if ($scope.Tasks[i].OrderId = id) {
                return $scope.Tasks[i];
            }
        }
    }
    $scope.showdetails = function () {
        var hideSheet = $ionicActionSheet.show({
            buttons: [
                 { text: '<i class="ion-person space"></i>Profile' },
                 { text: '<i class="ion-ios-help-outline space"></i>Tasks' },
                 { text: '<i class="ion-information space"></i>Assignments' },
                 { text: '<i class="ion-log-out icon_colour12 space"></i>Logout' }
            ],
            titleText: 'Info',
            cancelText: 'Cancel',
            cancel: function () {
            },
            buttonClicked: function (index) {
                switch (index) {
                    case 0:
                        $state.go('Profile');
                        $window.location.href = ('#/profile');
                        break;
                    case 1:
                        $state.go('task');
                        $window.location.href = ('#/task');
                        break;
                    case 2:
                        $state.go('AssignedProducts');
                        $window.location.href = ('#/AssignedProducts');
                        break;
                    case 3:
                        $rootScope.$broadcast('stop', 'Two');
                        $ionicHistory.clearHistory();
                        $ionicHistory.clearCache();
                        window.localStorage.clear();
                        $window.location.reload(true);
                        $state.go('app.signup');
                        break;
                        return true;
                }
            }
        });
        // For example's sake, hide the sheet after two seconds
        $timeout(function () {
            hideSheet();
        }, 9000);
    };
    /*---map----*/
    $rootScope.logLatLng = function (e) {

    }
    $rootScope.wayPoints = [
      { location: { lat: 44.32384807250689, lng: -78.079833984375 }, stopover: true },
      { location: { lat: 44.55916341529184, lng: -76.17919921875 }, stopover: true },
      { location: { lat: 44.75916341529184, lng: -76.27919921875 }, stopover: true }
    ];
    /*---map----*/
    var originAddress;
    function startMap() {
        for (var i = 0; i < AddressCollection.length; i++) {
            if (AddressCollection[i].origin == true) {
                var temp;
                originAddress = AddressCollection[i];
                for (var j = 0; j < AddressCollection.length; j++) {
                    if (AddressCollection[i].name != AddressCollection[j].name && AddressCollection[j].visited == false) {
                        temp = AddressCollection[j];
                        AddressCollection[i].visited == true;
                        var obj = httpGet(AddressCollection[i], AddressCollection[j]);
                        AddressCalculated.push(obj);
                    }
                }
                var tempObj = { 'source': '' }
                var min = getMax(AddressCalculated);
                tempObj.source = AddressCollection[i];
                tempObj.name = AddressCollection[i].name;
                Visited.push(AddressCollection[i]);
                tempObj.path = min;
                AddressFinal.push(tempObj);
                next(min.destination);

            }
        }

    }
    $scope.myGoBack = function () {
        $ionicHistory.goBack();
    };
    function check() {
        var ret = true;
        var allength = AddressCollection.length;

        var visyedlength = Visited.length;
        if (visyedlength == allength) {
            return false;
        }
        return ret;
    }
    function last(val) {
        var ret = false;
        var allength = AddressCollection.length;
        allength = allength - 1;
        var visyedlength = Visited.length;
        if (visyedlength == allength) {
            return true;
        }
        return ret;
    }
    function exist(val) {
        var ret = false;

        for (var k = 0; k < Visited.length; k++) {

            if (val.name == Visited[k].name) {
                ret = true;

            }


        }
        return ret;
    }
    function next(val) {
        for (var i = 0; i < AddressCollection.length; i++) {
            if (AddressCollection[i].name == val.name) {
                AddressCalculated = [];
                var again = false;
                var calc = false;
                var temp;
                for (var j = 0; j < AddressCollection.length; j++) {

                    if (AddressCollection[i].name != AddressCollection[j].name && AddressCollection[j].visited == false) {
                        var ex = exist(AddressCollection[j]);
                        var lst = last(AddressCollection[i]);
                        if (ex == false && lst == false) {


                            temp = AddressCollection[j];
                            AddressCollection[i].visited == true;


                            var obj = httpGet(AddressCollection[i], AddressCollection[j]);
                            calc = true;

                            AddressCalculated.push(obj);
                        }
                        if (lst == true) {

                            temp = originAddress
                            AddressCollection[i].visited == true;


                            var obj = httpGet(AddressCollection[i], originAddress);
                            //calc = true;
                            draw();
                            //  AddressCalculated.push(obj);
                        }




                    }

                }

                if (calc == true) {


                    var tempObj = { 'source': '' }
                    var min = getMax(AddressCalculated);
                    tempObj.source = AddressCollection[i];
                    tempObj.path = min;
                    AddressFinal.push(tempObj);
                    Visited.push(AddressCollection[i]);
                    again = check();
                    if (again == true) {
                        next(min.destination);
                    }
                    else {
                        draw();
                    }
                }

            }
        }
    }
    function locError(error) {
        // the current position could not be located
        alert("The current position could not be found!");
    }
    function setCurrentPosition(pos) {
        currentPositionMarker = new google.maps.Marker({
            map: map,
            position: new google.maps.LatLng(
                pos.coords.latitude,
                pos.coords.longitude
            ),
            title: "Current Position"
        });
        map.panTo(new google.maps.LatLng(
                pos.coords.latitude,
                pos.coords.longitude
            ));
    }
    function displayAndWatch(position) {
        // set current position
        setCurrentPosition(position);
        // watch position
        watchCurrentPosition();
    }
    function watchCurrentPosition() {
        var positionTimer = navigator.geolocation.watchPosition(
            function (position) {
                setMarkerPosition(
                    currentPositionMarker,
                    position
                );
            });
    }
    function setMarkerPosition(marker, position) {
        marker.setPosition(
            new google.maps.LatLng(
                position.coords.latitude,
                position.coords.longitude)
        );
    }
    function initLocationProcedure() {

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(displayAndWatch, locError);
        } else {
            alert("Your browser does not support the Geolocation API");
        }
    }


})
.controller('homeCtrl', function ($scope, $ionicActionSheet, localStorageService, ngAuthSettings, $http, $timeout, $state, $window, $rootScope, $ionicPopup) {
    $scope.showMap = true;
    $scope.showList = true;

    $scope.showdetails = function () {
        var hideSheet = $ionicActionSheet.show({
            buttons: [
                 { text: '<i class="ion-person space"></i>Profile' },
                 { text: '<i class="ion-ios-help-outline space"></i>Support' },
                 { text: '<i class="ion-information space"></i>Tutorials' },
                 { text: '<i class="ion-wrench space"></i>Setting' },
                 { text: '<i class="ion-log-out icon_colour12 space"></i>Logout' }
            ],
            // destructiveText: 'Delete',
            titleText: 'Info',
            cancelText: 'Cancel',
            cancel: function () {
                // add cancel code..
            },
            buttonClicked: function (index) {
                switch (index) {
                    case 0:
                        $state.go('Profile');
                        $window.location.href = ('#/profile');
                        break;
                    case 1:
                        $state.go('Support');
                        $window.location.href = ('#/support');
                        break;
                    case 2:
                        $state.go('Tutorials');
                        $window.location.href = ('#/tut');
                        break;
                    case 3:
                        $state.go('Setting');
                        $window.location.href = ('#/setting');
                        break;
                    case 4:
                        $state.go('Logout');
                        $window.location.href = ('#/logout');
                        break;
                    case 5:

                        $scope.ClientData = null;
                        localStorageService.set('clientData', $scope.ClientData);
                        $scope.ProductData = null;
                        localStorageService.set('ProductData', $scope.ProductData);
                        Products.galleryProducts = null;
                        $window.location.reload(true);
                        // $window.location.href = ('#/app/signup');
                        return true;
                }
            }
        });
        // For example's sake, hide the sheet after two seconds
        $timeout(function () {
            hideSheet();
        }, 9000);
    };


    /*---map----*/
    $rootScope.logLatLng = function (e) {

    }
    $rootScope.wayPoints = [
      { location: { lat: 24.0005155, lng: 77.75093029999994 }, stopover: true }
      //,{ location: { lat: 44.55916341529184, lng: -76.17919921875 }, stopover: true },
      //{ location: { lat: 44.75916341529184, lng: -76.27919921875 }, stopover: true },

    ];
    /*---map----*/

    ///new by Harry
    $scope.ClientData = localStorageService.get('clientData');
    if ($scope.ClientData == null) {
        window.location = "#/login";
    } else {
        var serviceBase = ngAuthSettings.apiServiceBaseUri;
        $http.get(serviceBase + "api/OrderDispatchedMaster?mob=" + $scope.ClientData.Mobile + "id=" + 1).then(function (results) {
            $scope.Tasks = results.data;
        });

    }

    $scope.Tasks = [];

})
.controller('calanderCtrl', function ($scope, $ionicPopup) {

    $scope.showdetails = function () {
        var hideSheet = $ionicActionSheet.show({
            buttons: [
                 { text: '<i class="ion-person space"></i>Profile' },
                 { text: '<i class="ion-ios-help-outline space"></i>Tasks' },
                 { text: '<i class="ion-information space"></i>Assignments' },
                 { text: '<i class="ion-log-out icon_colour12 space"></i>Logout' }
            ],
            titleText: 'Info',
            cancelText: 'Cancel',
            cancel: function () {
            },
            buttonClicked: function (index) {
                switch (index) {
                    case 0:
                        $state.go('Profile');
                        $window.location.href = ('#/profile');
                        break;
                    case 1:
                        $state.go('task');
                        $window.location.href = ('#/task');
                        break;
                    case 2:
                        $state.go('AssignedProducts');
                        $window.location.href = ('#/AssignedProducts');
                        break;
                    case 3:
                        $ionicHistory.clearHistory();
                        $ionicHistory.clearCache();
                        window.localStorage.clear();
                        //$window.location.reload(true);
                        $window.location.href = ('#/login');
                        return true;
                }
            }
        });
        // For example's sake, hide the sheet after two seconds
        $timeout(function () {
            hideSheet();
        }, 9000);
    };

    /*---calander----*/
    !function () {

        var today = moment();

        function Calendar(selector, events) {
            this.el = document.querySelector(selector);
            this.events = events;
            this.current = moment().date(1);
            this.draw();
            var current = document.querySelector('.today');
            if (current) {
                var self = this;
                window.setTimeout(function () {
                    self.openDay(current);
                }, 500);
            }
        }

        Calendar.prototype.draw = function () {
            //Create Header
            this.drawHeader();

            //Draw Month
            this.drawMonth();

            this.drawLegend();
        }

        Calendar.prototype.drawHeader = function () {
            var self = this;
            if (!this.header) {
                //Create the header elements
                this.header = createElement('div', 'header');
                this.header.className = 'header';

                this.title = createElement('h1');

                var right = createElement('div', 'right');
                right.addEventListener('click', function () { self.nextMonth(); });

                var left = createElement('div', 'left');
                left.addEventListener('click', function () { self.prevMonth(); });

                //Append the Elements
                this.header.appendChild(this.title);
                this.header.appendChild(right);
                this.header.appendChild(left);
                this.el.appendChild(this.header);
            }

            this.title.innerHTML = this.current.format('MMMM YYYY');
        }

        Calendar.prototype.drawMonth = function () {
            var self = this;

            this.events.forEach(function (ev) {
                ev.date = self.current.clone().date(Math.random() * (29 - 1) + 1);
            });


            if (this.month) {
                this.oldMonth = this.month;
                this.oldMonth.className = 'month out ' + (self.next ? 'next' : 'prev');
                this.oldMonth.addEventListener('webkitAnimationEnd', function () {
                    self.oldMonth.parentNode.removeChild(self.oldMonth);
                    self.month = createElement('div', 'month');
                    self.backFill();
                    self.currentMonth();
                    self.fowardFill();
                    self.el.appendChild(self.month);
                    window.setTimeout(function () {
                        self.month.className = 'month in ' + (self.next ? 'next' : 'prev');
                    }, 16);
                });
            } else {
                this.month = createElement('div', 'month');
                this.el.appendChild(this.month);
                this.backFill();
                this.currentMonth();
                this.fowardFill();
                this.month.className = 'month new';
            }
        }

        Calendar.prototype.backFill = function () {
            var clone = this.current.clone();
            var dayOfWeek = clone.day();

            if (!dayOfWeek) { return; }

            clone.subtract('days', dayOfWeek + 1);

            for (var i = dayOfWeek; i > 0 ; i--) {
                this.drawDay(clone.add('days', 1));
            }
        }

        Calendar.prototype.fowardFill = function () {
            var clone = this.current.clone().add('months', 1).subtract('days', 1);
            var dayOfWeek = clone.day();

            if (dayOfWeek === 6) { return; }

            for (var i = dayOfWeek; i < 6 ; i++) {
                this.drawDay(clone.add('days', 1));
            }
        }

        Calendar.prototype.currentMonth = function () {
            var clone = this.current.clone();

            while (clone.month() === this.current.month()) {
                this.drawDay(clone);
                clone.add('days', 1);
            }
        }

        Calendar.prototype.getWeek = function (day) {
            if (!this.week || day.day() === 0) {
                this.week = createElement('div', 'week');
                this.month.appendChild(this.week);
            }
        }

        Calendar.prototype.drawDay = function (day) {
            var self = this;
            this.getWeek(day);

            //Outer Day
            var outer = createElement('div', this.getDayClass(day));
            outer.addEventListener('click', function () {
                self.openDay(this);
            });

            //Day Name
            var name = createElement('div', 'day-name', day.format('ddd'));

            //Day Number
            var number = createElement('div', 'day-number', day.format('DD'));


            //Events
            var events = createElement('div', 'day-events');
            this.drawEvents(day, events);

            outer.appendChild(name);
            outer.appendChild(number);
            outer.appendChild(events);
            this.week.appendChild(outer);
        }

        Calendar.prototype.drawEvents = function (day, element) {
            if (day.month() === this.current.month()) {
                var todaysEvents = this.events.reduce(function (memo, ev) {
                    if (ev.date.isSame(day, 'day')) {
                        memo.push(ev);
                    }
                    return memo;
                }, []);

                todaysEvents.forEach(function (ev) {
                    var evSpan = createElement('span', ev.color);
                    element.appendChild(evSpan);
                });
            }
        }

        Calendar.prototype.getDayClass = function (day) {
            classes = ['day'];
            if (day.month() !== this.current.month()) {
                classes.push('other');
            } else if (today.isSame(day, 'day')) {
                classes.push('today');
            }
            return classes.join(' ');
        }

        Calendar.prototype.openDay = function (el) {
            var details, arrow;
            var dayNumber = +el.querySelectorAll('.day-number')[0].innerText || +el.querySelectorAll('.day-number')[0].textContent;
            var day = this.current.clone().date(dayNumber);

            var currentOpened = document.querySelector('.details');

            //Check to see if there is an open detais box on the current row
            if (currentOpened && currentOpened.parentNode === el.parentNode) {
                details = currentOpened;
                arrow = document.querySelector('.arrow');
            } else {
                //Close the open events on differnt week row
                //currentOpened && currentOpened.parentNode.removeChild(currentOpened);
                if (currentOpened) {
                    currentOpened.addEventListener('webkitAnimationEnd', function () {
                        currentOpened.parentNode.removeChild(currentOpened);
                    });
                    currentOpened.addEventListener('oanimationend', function () {
                        currentOpened.parentNode.removeChild(currentOpened);
                    });
                    currentOpened.addEventListener('msAnimationEnd', function () {
                        currentOpened.parentNode.removeChild(currentOpened);
                    });
                    currentOpened.addEventListener('animationend', function () {
                        currentOpened.parentNode.removeChild(currentOpened);
                    });
                    currentOpened.className = 'details out';
                }

                //Create the Details Container
                details = createElement('div', 'details in');

                //Create the arrow
                var arrow = createElement('div', 'arrow');

                //Create the event wrapper

                details.appendChild(arrow);
                el.parentNode.appendChild(details);
            }

            var todaysEvents = this.events.reduce(function (memo, ev) {
                if (ev.date.isSame(day, 'day')) {
                    memo.push(ev);
                }
                return memo;
            }, []);

            this.renderEvents(todaysEvents, details);

            arrow.style.left = el.offsetLeft - el.parentNode.offsetLeft + 27 + 'px';
        }

        Calendar.prototype.renderEvents = function (events, ele) {
            //Remove any events in the current details element
            var currentWrapper = ele.querySelector('.events');
            var wrapper = createElement('div', 'events in' + (currentWrapper ? ' new' : ''));

            events.forEach(function (ev) {
                var div = createElement('div', 'event');
                var square = createElement('div', 'event-category ' + ev.color);
                var span = createElement('span', '', ev.eventName);

                div.appendChild(square);
                div.appendChild(span);
                wrapper.appendChild(div);
            });

            if (!events.length) {
                var div = createElement('div', 'event empty');
                var span = createElement('span', '', 'No Events');

                div.appendChild(span);
                wrapper.appendChild(div);
            }

            if (currentWrapper) {
                currentWrapper.className = 'events out';
                currentWrapper.addEventListener('webkitAnimationEnd', function () {
                    currentWrapper.parentNode.removeChild(currentWrapper);
                    ele.appendChild(wrapper);
                });
                currentWrapper.addEventListener('oanimationend', function () {
                    currentWrapper.parentNode.removeChild(currentWrapper);
                    ele.appendChild(wrapper);
                });
                currentWrapper.addEventListener('msAnimationEnd', function () {
                    currentWrapper.parentNode.removeChild(currentWrapper);
                    ele.appendChild(wrapper);
                });
                currentWrapper.addEventListener('animationend', function () {
                    currentWrapper.parentNode.removeChild(currentWrapper);
                    ele.appendChild(wrapper);
                });
            } else {
                ele.appendChild(wrapper);
            }
        }

        Calendar.prototype.drawLegend = function () {
            var legend = createElement('div', 'legend');
            var calendars = this.events.map(function (e) {
                return e.calendar + '|' + e.color;
            }).reduce(function (memo, e) {
                if (memo.indexOf(e) === -1) {
                    memo.push(e);
                }
                return memo;
            }, []).forEach(function (e) {
                var parts = e.split('|');
                var entry = createElement('span', 'entry ' + parts[1], parts[0]);
                legend.appendChild(entry);
            });
            this.el.appendChild(legend);
        }

        Calendar.prototype.nextMonth = function () {
            this.current.add('months', 1);
            this.next = true;
            this.draw();
        }

        Calendar.prototype.prevMonth = function () {
            this.current.subtract('months', 1);
            this.next = false;
            this.draw();
        }

        window.Calendar = Calendar;

        function createElement(tagName, className, innerText) {
            var ele = document.createElement(tagName);
            if (className) {
                ele.className = className;
            }
            if (innerText) {
                ele.innderText = ele.textContent = innerText;
            }
            return ele;
        }
    }();

    !function () {
        var data = [
          { eventName: '12 PM- 2 PM, client:Sumit, Location:Vijay Nagar Indore', calendar: 'Pending', color: 'orange' },
          { eventName: '2 PM- 4 PM, client:Mradul, Location:Subhash Nagar Indore', calendar: 'Pending', color: 'orange' },
          { eventName: '10 AM- 12 PM, client:Raja, Location:Sukhliya Nagar Indore', calendar: 'Pending', color: 'orange' },
          { eventName: '9 AM- 10 AM, client:Aakash, Location:Pardeshipura Nagar Indore', calendar: 'Pending', color: 'orange' },

          { eventName: '12 PM- 2 PM, client:Govind, Location:Pardeshipura Nagar Indore', calendar: 'Acknowledge', color: 'blue' },
          { eventName: '2 PM- 3 PM, client:Vikram, Location:Tulsi Nagar Indore', calendar: 'Acknowledge', color: 'blue' },
          { eventName: '3 PM- 4 PM, client:Vikash, Location:Sai Kripa colony vijay Nagar Indore', calendar: 'Acknowledge', color: 'blue' },
          { eventName: '4 PM- 5 PM, client:Hardik, Location:Mahalakshmi Nagar Indore', calendar: 'Acknowledge', color: 'blue' },

          { eventName: '9 AM- 10 AM, client:Ankit, Location:Nanda Nagar Indore', calendar: 'Assigned', color: 'yellow' },
          { eventName: '10 AM- 11 AM, client:Aman, Location:Tulsi Nagar Indore', calendar: 'Assigned', color: 'yellow' },
          { eventName: '11 AM- 12 PM, client:Sumit, Location:Tulsi Nagar Indore', calendar: 'Assigned', color: 'yellow' },
          { eventName: '12 PM- 1 PM, client:Rahul, Location:Bhagya Shree Colony behind petrol pump Indore', calendar: 'Assigned', color: 'yellow' },

          { eventName: '5 PM- 6 PM, client:Moin, Location:Tulsi Nagar behind saraswati temple Indore', calendar: 'Done', color: 'green' },
          { eventName: '6 PM- 7 PM, client:Imtiyaz, Location:Tulsi Nagar behind saraswati temple Indore', calendar: 'Done', color: 'green' },
          { eventName: '7 PM- 8 PM, client:Arpit, Location:Anand Nagar Indore', calendar: 'Done', color: 'green' },
          { eventName: '8 PM- 9 PM, client:Mayank, Location:Bhagya Shree Colony Indore', calendar: 'Done', color: 'green' }
        ];



        function addDate(ev) {

        }

        var calendar = new Calendar('#calendar', data);

    }();
    /*---calander----*/
})
.controller('menuctrl', function ($scope, $ionicPlatform, localStorageService, Products, $window, $ionicHistory, $location, $ionicSideMenuDelegate, $ionicSlideBoxDelegate, $window, $state, $ionicPopup) {

    $scope.signout = function () {
        localStorage.clear();
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
        //$state.go($state.current, {}, { reload: true });
        $state.go('app.task');
    };

    $scope.title = $ionicHistory.currentTitle();
    if ($scope.title != "HOME") {
    }
})
.controller('SignatureCtrl', function ($scope, $ionicPopup) {

    $scope.showdetails = function () {
        var hideSheet = $ionicActionSheet.show({
            buttons: [
                 { text: '<i class="ion-person space"></i>Profile' },
                 { text: '<i class="ion-ios-help-outline space"></i>Tasks' },
                 { text: '<i class="ion-information space"></i>Assignments' },
                 { text: '<i class="ion-log-out icon_colour12 space"></i>Logout' }
            ],
            titleText: 'Info',
            cancelText: 'Cancel',
            cancel: function () {
            },
            buttonClicked: function (index) {
                switch (index) {
                    case 0:
                        $state.go('Profile');
                        $window.location.href = ('#/profile');
                        break;
                    case 1:
                        $state.go('task');
                        $window.location.href = ('#/task');
                        break;
                    case 2:
                        $state.go('AssignedProducts');
                        $window.location.href = ('#/AssignedProducts');
                        break;
                    case 3:
                        $ionicHistory.clearHistory();
                        $ionicHistory.clearCache();
                        window.localStorage.clear();
                        //$window.location.reload(true);
                        $window.location.href = ('#/login');
                        return true;
                }
            }
        });
        // For example's sake, hide the sheet after two seconds
        $timeout(function () {
            hideSheet();
        }, 9000);
    };


    setTimeout(function () {
        $(function () {
            var canvas = document.getElementById('thecanvas');
            var signaturePad = new SignaturePad(canvas);
            drawSignatureLine();
            $('button.save').click(function () {
                if (!signaturePad.isEmpty()) {
                    var custsugn = signaturePad.toDataURL("image/png");
                    console.log(custsugn);
                } else {
                    alert("empty");
                }
                //window.open(signaturePad.toDataURL("image/png"));
            });
            $('button.clear').click(function () {
                signaturePad.clear();
                drawSignatureLine();
            });
            function drawSignatureLine() {
                var context = canvas.getContext('2d');
                context.lineWidth = .25;
                context.strokeStyle = '#333';
                context.beginPath();
                context.moveTo(0, 150);
                context.lineTo(500, 150);
                context.stroke();
            }
        });
    }, 3000);
})
.controller('signupCtrl', function ($scope, $ionicPopup) {

})
.controller('notificationCtrl', function ($scope, $ionicActionSheet, $ionicPopup) {

})
.controller('settingCtrl', function ($scope, $ionicPopup) {

})
.controller('AssismentCtrl', function ($http, $scope, $ionicActionSheet, $timeout, $state, $window, $rootScope, ngAuthSettings, $ionicHistory, TaskService, localStorageService, $ionicLoading, $ionicPopup) {
    /// calling delivery tasks
 
    $scope.ClientData = localStorageService.get('clientData');
    $scope.$on("$ionicView.enter", function () {
        $scope.ClientData = localStorageService.get('clientData');
        if ($scope.ClientData == null) {
            window.location = "#/login";
        } else {
            $scope.end = new Date();
            $scope.start = new Date();
            $scope.start.setDate($scope.end.getDate() - 3);
        }
    });
    $scope.hide = function () {
        $ionicLoading.hide();
    };

    var serviceBase = ngAuthSettings.apiServiceBaseUri;

    $scope.getoldorders = function () {

        if ($scope.ClientData == null) {
            window.location = "#/login";
        } else {
            var start = document.getElementById('start').value;
            var end = document.getElementById('end').value;
            if (start == "" || end == "") {
                $ionicPopup.alert({
                    title: 'चेतावनी',
                    template: 'Status चयन करे!'
                }).then(function () {
                });
                return;
            }
            $ionicLoading.show({
                noBackdrop: false,
                template: '<p>Loading...</p><ion-spinner icon="android"></ion-spinner>',
            });
            $http.get(serviceBase + "api/DeliveryIssuance?id=" + $scope.ClientData.PeopleID + "&start=" + start + "&end=" + end).then(function (results) {
               
                $scope.oldorders = results.data;

                if (results.data.length == 0) {
                    $ionicPopup.alert({
                        title: 'Alert',
                        template: 'No History data!'
                    }).then(function () {
                    });
                }
                $scope.hide();
            }, function (results) { $scope.hide(); });


        }
    }

    $scope.prodetails = function (items) {
        
        $scope.DBoyData = {};
        $scope.orderdetails = [];
        $scope.Orderids = [];
        if (items) {
            $scope.DBoyData = items;
            console.log("kkkkkk");
            console.log($scope.DBoyData);
            $scope.orderdetails = $scope.DBoyData.details;
            var ids = $scope.DBoyData.OrderIds;
            var str_array = ids.split(',');
            $scope.Orderids = str_array;
            console.log($scope.Orderids);
        }

        var alertPopup = $ionicPopup.alert({
            title: 'Don\'t eat that!',
            template: $scope.Orderids
        });

        alertPopup.then(function (res) {
            console.log('Thank you for not eating my delicious ice cream cone');
        });



    }


    $scope.showdetails = function () {
        var hideSheet = $ionicActionSheet.show({
            buttons: [
                 { text: '<i class="ion-person space"></i>Profile' },
                 { text: '<i class="ion-ios-help-outline space"></i>Tasks' },
                 { text: '<i class="ion-information space"></i>Assignments' },
                 { text: '<i class="ion-archive icon_colour12 space"></i>History' },
                   { text: '<i class="ion-archive icon_colour12 space"></i>OrderAssissment' },
                 { text: '<i class="ion-log-out icon_colour12 space"></i>Logout' }
            ],
            titleText: 'Info',
            cancelText: 'Cancel',
            cancel: function () {
            },
            buttonClicked: function (index) {
                switch (index) {
                    case 0:
                        $state.go('Profile');
                        $window.location.href = ('#/profile');
                        break;
                    case 1:
                        $state.go('task');
                        break;
                    case 2:
                        $state.go('AssignedProducts');
                        $window.location.href = ('#/AssignedProducts');
                        break;
                    case 3:
                        $state.go('AssignedProducts');
                        return true;
                    case 4:
                        $window.location.href = ('#/OrderAssissment');
                        break;
                    case 5:
                        $rootScope.$broadcast('stop', 'Two');
                        $ionicHistory.clearHistory();
                        $ionicHistory.clearCache();
                        window.localStorage.clear();
                        //$window.location.reload(true);
                        $window.location.href = ('#/login');
                        return true;
                }
            }
        });
        $timeout(function () {
            hideSheet();
        }, 9000);
    };
    $scope.prodetails = function (data) {
        TaskService._setdata(data);
        $window.location.href = ('#/Summary/' + data.DeliveryIssuanceId);
    }

})
.controller('SummaryCtrl', function ($http, localStorageService, $stateParams, $scope, $ionicActionSheet, $timeout, $state, $window, $rootScope, ngAuthSettings, TaskService, $ionicPopup) {
    $scope.delivereddata = [];
    $scope.cancelddata = [];
    $scope.redispatcheddata = [];
    var serviceBase = ngAuthSettings.apiServiceBaseUri;
    $scope.id = $stateParams.type;
    $scope.assignment = TaskService._getDetail();
    console.log($scope.assignment);

    if ($scope.assignment != null && $scope.id > 0) {
  
        var ids = $scope.assignment.OrderIds;
        var url = serviceBase + "api/vehicleassissment?ids=" + ids + "&testt=" + "testt";
        $http.get(url)
        .success(function (data) {
            
            $scope.TotalDeliveredOrder = 0;
            $scope.TotalDeliveredOrderAmount = 0;
            $scope.TotalDeliveredCashAmount = 0;
            $scope.TotalRedispatchOrderAmount = 0;
            $scope.TotalCanceledOrderAmount = 0;
            $scope.date = data[0].Deliverydate;
            $scope.dcanceldata = data;
            $scope.itemdetail = [];
            $scope.itemdetails = [];
            $scope.itemdetailsredispatched = [];
            $scope.TotalCancelOrder = 0;
            $scope.TotalCanceledOrderqty = 0;
            $scope.TotalRedispatchOrder = 0;
            $scope.TotalRedispatchOrderqty = 0;
            $scope.allproducts = [];
            $scope.allproductredispatched = [];
            for (var i = 0; i < data.length; i++) {
                if (data[i].Status == "Delivered") {
                    $scope.delivereddata.push(data[i]);
                }
                if (data[i].Status == "Delivery Redispatch") {
                    $scope.redispatcheddata.push(data[i]);
                }
                if (data[i].Status == "Delivery Canceled") {
                    $scope.cancelddata.push(data[i]);
                }
            }
            for (var d = 0; d < $scope.delivereddata.length; d++) {
                $scope.TotalDeliveredOrderAmount = $scope.TotalDeliveredOrderAmount + $scope.delivereddata[d].GrossAmount;
                $scope.TotalDeliveredOrder = $scope.TotalDeliveredOrder + 1;
                $scope.TotalDeliveredCashAmount = $scope.TotalDeliveredCashAmount + $scope.delivereddata[d].cashAmount;
                $scope.TotalDeliveredChequeAmount = $scope.TotalDeliveredChequeAmount + $scope.delivereddata[d].chequeAmount;
            }


            for (var i = 0; i < data.length; i++) {
                if (data[i].Status == "Delivery Canceled") {

                    for (var o = 0; o < data[i].orderDetails.length; o++) {
                        $scope.itemdetail.push(data[i].orderDetails[o]);


                        $scope.TotalCanceledOrderqty = $scope.TotalCanceledOrderqty + data[i].orderDetails[o].qty;

                    }
                    $scope.TotalCancelOrder = $scope.TotalCancelOrder + 1;
                    $scope.itemdetails.push(data[i]);
                }
            }
            if ($scope.itemdetails.length > 0) {
                $scope.selectedorders = angular.copy($scope.itemdetails);
                console.log($scope.itemdetails);
                var firstreq = true;
                for (var k = 0; k < $scope.selectedorders.length; k++) {
                    for (var j = 0; j < $scope.selectedorders[k].orderDetails.length; j++) {
                        if (firstreq) {
                            var OD = $scope.selectedorders[k].orderDetails[j];
                            OD["OrderQty"] = ($scope.selectedorders[k].orderDetails[j].OrderId + " - " + $scope.selectedorders[k].orderDetails[j].qty).toString();

                            $scope.allproducts.push(OD);
                            firstreq = false;
                        } else {
                            var checkprod = true;
                            _.map($scope.allproducts, function (prod) {
                                if ($scope.selectedorders[k].orderDetails[j].itemNumber == prod.itemNumber) {
                                    prod.OrderQty += ", " + $scope.selectedorders[k].orderDetails[j].OrderId + " - " + $scope.selectedorders[k].orderDetails[j].qty;
                                    prod.qty = $scope.selectedorders[k].orderDetails[j].qty + prod.qty;
                                    prod.TotalAmt = $scope.selectedorders[k].orderDetails[j].TotalAmt + prod.TotalAmt;
                                    checkprod = false;
                                }
                            })
                            if (checkprod) {
                                var OD = $scope.selectedorders[k].orderDetails[j];
                                OD["OrderQty"] = ($scope.selectedorders[k].orderDetails[j].OrderId + " - " + $scope.selectedorders[k].orderDetails[j].qty).toString();
                                $scope.allproducts.push(OD);
                            }
                        }
                    }
                }
                console.log("Assissment total products");
                console.log($scope.allproducts);
            }

            for (var i = 0; i < data.length; i++) {
                if (data[i].Status == "Delivery Redispatch") {

                    for (var o = 0; o < data[i].orderDetails.length; o++) {
                        $scope.itemdetail.push(data[i].orderDetails[o]);
                        $scope.TotalRedispatchOrderqty = $scope.TotalRedispatchOrderqty + data[i].orderDetails[o].qty;

                    }


                    $scope.TotalRedispatchOrder = $scope.TotalRedispatchOrder + 1;
                    $scope.itemdetailsredispatched.push(data[i]);
                }
            }
            if ($scope.itemdetailsredispatched.length > 0) {
                $scope.selectedorders = angular.copy($scope.itemdetailsredispatched);
                console.log($scope.itemdetailsredispatched);
                var firstreq = true;
                for (var k = 0; k < $scope.selectedorders.length; k++) {
                    for (var j = 0; j < $scope.selectedorders[k].orderDetails.length; j++) {
                        if (firstreq) {
                            var OD = $scope.selectedorders[k].orderDetails[j];
                            OD["OrderQty"] = ($scope.selectedorders[k].orderDetails[j].OrderId + " - " + $scope.selectedorders[k].orderDetails[j].qty).toString();

                            $scope.allproductredispatched.push(OD);
                            firstreq = false;
                        } else {
                            var checkprod = true;
                            _.map($scope.allproductredispatched, function (prod) {
                                if ($scope.selectedorders[k].orderDetails[j].itemNumber == prod.itemNumber) {
                                    prod.OrderQty += ", " + $scope.selectedorders[k].orderDetails[j].OrderId + " - " + $scope.selectedorders[k].orderDetails[j].qty;
                                    prod.qty = $scope.selectedorders[k].orderDetails[j].qty + prod.qty;
                                    prod.TotalAmt = $scope.selectedorders[k].orderDetails[j].TotalAmt + prod.TotalAmt;
                                    checkprod = false;
                                }
                            })
                            if (checkprod) {
                                var OD = $scope.selectedorders[k].orderDetails[j];
                                OD["OrderQty"] = ($scope.selectedorders[k].orderDetails[j].OrderId + " - " + $scope.selectedorders[k].orderDetails[j].qty).toString();
                                $scope.allproductredispatched.push(OD);
                            }
                        }
                    }
                }
                console.log("Assissment redispatched total products");
                console.log($scope.allproductredispatched);
            }



        })
         .error(function (data) {
             console.log(data);
         })
    }

    $scope.$on("$ionicView.enter", function () {
        $scope.ClientData = localStorageService.get('clientData');
        if ($scope.ClientData == null) {
            window.location = "#/login";
        }
    });
})
.filter('stopwatchTime', function () {
    return function (input) {
        if (input) {

            var elapsed = input.getTime();
            var hours = parseInt(elapsed / 3600000, 10);
            elapsed %= 3600000;
            var mins = parseInt(elapsed / 60000, 10);
            elapsed %= 60000;
            var secs = parseInt(elapsed / 1000, 10);
            var ms = elapsed % 1000;

            return hours + ':' + mins + ':' + secs + ':' + ms;
        }
    };
})
.directive('bbStopwatch', ['StopwatchFactory', function (StopwatchFactory) {
    return {
        restrict: 'EA',
        scope: true,
        link: function (scope, elem, attrs) {
            var stopwatchService = new StopwatchFactory(scope[attrs.options]);
            scope.startTimer = stopwatchService.startTimer;
            scope.stopTimer = stopwatchService.stopTimer;
            scope.resetTimer = stopwatchService.resetTimer;
        }
    };
}])
.factory('StopwatchFactory', function ($interval, localStorageService, ngAuthSettings, $rootScope) {
    var serviceBase = ngAuthSettings.apiServiceBaseUri;

    return function (options) {

        var startTime = 0, currentTime = null, offset = 0, interval = null, self = this;

        if (!options.interval) {
            options.interval = 100;
        }

        options.elapsedTime = new Date(0);
        self.running = false;
        function pushToLog(lap) {
            if (options.log !== undefined) {
                options.log.push(lap);
                var a = lap;

            }
        }
        self.updateTime = function () {
            currentTime = new Date().getTime();
            var timeElapsed = offset + (currentTime - startTime);
            options.elapsedTime.setTime(timeElapsed);
        };
        self.startTimer = function () {
            self.Tasks = localStorageService.get('Tasks');
            if (self.Tasks != null) {
                if (self.running === false && self.Tasks.length > 0) {
                    startTime = new Date().getTime();
                    interval = $interval(self.updateTime, options.interval);
                    self.running = true;
                    //self.myStartFunction();
                    self.callgps();
                } else { alert("No tasks") }
            } else { alert("Assign Task"); }
        };

        self.stopTimer = function () {
            self.Tasks1 = localStorageService.get('Tasks');
            if (self.Tasks1 != null) {
                if (self.Tasks1.length > 0) {
                    for (var i = 0; i < self.Tasks1.length; i++) {
                        if (self.Tasks1[i].Status == "Delivered" || self.Tasks1[i].Status == "Delivery Canceled" || self.Tasks1[i].Status == "Delivery Redispatch") {
                        } else {
                            return false;
                        }
                    }
                } else {
                    return false
                }
            } else {
                return false
            }
            if (self.running === false) {
                return;
            }
            self.updateTime();
            offset = offset + currentTime - startTime;
            pushToLog(currentTime - startTime);
            $interval.cancel(interval);
            self.running = false;
            self.stopgps();
        };

        self.resetTimer = function () {
            startTime = new Date().getTime();
            options.elapsedTime.setTime(0);
            timeElapsed = offset = 0;
        };

        self.cancelTimer = function () {
            $interval.cancel(interval);
        };

        self.callgps = function () {
            $rootScope.$broadcast('start', 'Two');
        }
        self.stopgps = function () {
            $rootScope.$broadcast('stop', 'Two');
        }
        return self;

    };
})
.controller('OrderCurrencyCtrl', function ($scope, $timeout, $stateParams, $http, $rootScope, ngAuthSettings, localStorageService, $ionicActionSheet, $state, $window, $ionicHistory, TaskService, $ionicLoading, $ionicPopup) {
     
    $scope.showdetails = function () {
        var hideSheet = $ionicActionSheet.show({
            buttons: [
                 { text: '<i class="ion-person space"></i>Profile' },
                 { text: '<i class="ion-ios-help-outline space"></i>Tasks' },
                 { text: '<i class="ion-information space"></i>Assignments' },
                 { text: '<i class="ion-archive icon_colour12 space"></i>History' },
                  { text: '<i class="ion-archive icon_colour12 space"></i>OrderAssissment' },
                 { text: '<i class="ion-log-out icon_colour12 space"></i>Logout' }
            ],
            titleText: 'Info',
            cancelText: 'Cancel',
            cancel: function () {
            },
            buttonClicked: function (index) {
                switch (index) {
                    case 0:
                        $state.go('Profile');
                        $window.location.href = ('#/profile');
                        break;
                    case 1:
                        $state.go('task');
                        $window.location.href = ('#/task');
                        return true;
                    case 2:
                        $state.go('AssignedProducts');
                        $window.location.href = ('#/AssignedProducts');
                        break;
                    case 3:
                        $window.location.href = ('#/TaskHistory');
                        break;
                    case 4:
                        $window.location.href = ('#/OrderAssissment');
                        break;
                    case 5:
                        $rootScope.$broadcast('stop', 'Two');
                        $ionicHistory.clearHistory();
                        $ionicHistory.clearCache();
                        window.localStorage.clear();
                        //$window.location.reload(true);
                        $window.location.href = ('#/login');
                        return true;


                }
            }
        });
      
        $timeout(function () {
            hideSheet();
        }, 9000);
    };
    var serviceBase = ngAuthSettings.apiServiceBaseUri;
    $scope.ClientData = localStorageService.get('clientData');
  
    $scope.DeliveryIssuance = localStorageService.get('Iddel');
  
    $scope.data = {};
   
    $scope.calculat1 = function (data) {
       // 
        $scope.OneRupeeTotal = 1;
        $scope.OneRupeeTotal = $scope.OneRupeeTotal * data;
    }
    $scope.calculat2 = function (data) {
        $scope.TwoRupeeTotal = 2;
        $scope.TwoRupeeTotal = $scope.TwoRupeeTotal * data;
    }
    $scope.calculat5 = function (data) {
        $scope.FiveRupeeTotal = 5;
        $scope.FiveRupeeTotal = $scope.FiveRupeeTotal * data;
    }
    $scope.calculat10 = function (data) {
        $scope.TenRupeeTotal = 10;
        $scope.TenRupeeTotal = $scope.TenRupeeTotal * data;
    }
    $scope.calculat20 = function (data) {
        $scope.TwentyRupeeTotal = 20;
        $scope.TwentyRupeeTotal = $scope.TwentyRupeeTotal * data;
    }
    $scope.calculat50 = function (data) {
        $scope.fiftyRupeeTotal = 50;
        $scope.fiftyRupeeTotal = $scope.fiftyRupeeTotal * data;
    }
    $scope.calculat100 = function (data) {
        $scope.HunRupeeTotal = 100;
        $scope.HunRupeeTotal = $scope.HunRupeeTotal * data;
    }
    $scope.calculat500 = function (data) {
        $scope.fivehunRupeeTotal = 500;
        $scope.fivehunRupeeTotal = $scope.fivehunRupeeTotal * data;
    }
    $scope.calculat2000 = function (data) {
        $scope.twohunRupeeTotal = 2000;
        $scope.twohunRupeeTotal = $scope.twohunRupeeTotal * data; 
    }

    
    
    if ($scope.ClientData != null) {

            $scope.totalsum = 0;
            $scope.Ttotalcount = 0;
            $scope.OneRupeeTotal = 0;
            $scope.TwoRupeeTotal = 0;
            $scope.FiveRupeeTotal = 0;
            $scope.TenRupeeTotal = 0;
            $scope.TwentyRupeeTotal = 0;
            $scope.fiftyRupeeTotal = 0;
            $scope.HunRupeeTotal = 0;
            $scope.fivehunRupeeTotal = 0;
            $scope.twohunRupeeTotal = 0;
 
            //
            $scope.data.onerscount = 0;
            $scope.data.tworscount = 0;
            $scope.data.fiverscount = 0;
            $scope.data.tenrscount = 0;
            $scope.data.Twentyrscount = 0;
       
            $scope.data.fiftyrscount = 0;
            $scope.data.hunrscount = 0;
            $scope.data.fivehrscount = 0;
            $scope.data.twoTHrscount = 0;

            $scope.total = function (data) {
                
                $scope.Ttotal=$scope.totalsum + $scope.OneRupeeTotal + $scope.TwoRupeeTotal + $scope.FiveRupeeTotal + $scope.TenRupeeTotal + $scope.TwentyRupeeTotal + $scope.fiftyRupeeTotal + $scope.HunRupeeTotal + $scope.fivehunRupeeTotal + $scope.twohunRupeeTotal;
                if ($scope.Ttotal > 0) {
            
                    console.log(data);
                    var url = serviceBase + "api/CurrencySettle?PeopleId=" + $scope.ClientData.PeopleID;
                    var datatopost = {
                        DeliveryIssuanceId: $scope.DeliveryIssuance,
                        onerscount: $scope.data.onerscount,
                        OneRupee: $scope.OneRupeeTotal,
                        tworscount: $scope.data.tworscount,
                        TwoRupee: $scope.TwoRupeeTotal,
                        fiverscount: $scope.data.fiverscount,
                        FiveRupee: $scope.FiveRupeeTotal,
                        tenrscount: $scope.data.tenrscount,
                        TenRupee: $scope.TenRupeeTotal,
                        Twentyrscount: $scope.data.Twentyrscount,
                        TwentyRupee: $scope.TwentyRupeeTotal,
                        fiftyrscount: $scope.data.fiftyrscount,
                        fiftyRupee: $scope.fiftyRupeeTotal,
                        hunrscount: $scope.data.hunrscount,
                        HunRupee: $scope.HunRupeeTotal,
                        fivehrscount: $scope.data.fivehrscount,
                        fiveHRupee: $scope.fivehunRupeeTotal,
                        twoTHrscount: $scope.data.twoTHrscount,
                        twoTHRupee: $scope.twohunRupeeTotal,
                        checknumber: $scope.data.checknumber,
                        checkamount: $scope.data.checkamount,
                        TotalAmount: $scope.Ttotal,
                    };
                    console.log("datatopost", datatopost);
                    $http.post(url, datatopost).then(function (results) {
                      
                        if (results.data.PeopleId != null) {
                           
                            $ionicPopup.alert({
                                title: 'Alert',
                                template: 'Assignment payment submitted'
                            }).then(function () {
                            });
                            setTimeout(function () {
                                $window.location.reload();
                                window.location = "#/task";
                            }, 300);

                        }
                        else {
                            $ionicPopup.alert({
                                title: 'Alert',
                                template: 'Assignment payment not submitted'
                            }).then(function () {
                            });
                        }
                    })
                  
                } else {

                    $ionicPopup.alert({
                        title: 'Alert',
                        template: 'Kindly enter Amount'
                    }).then(function () {
                    });
                }
            }
        }
    //})
});
