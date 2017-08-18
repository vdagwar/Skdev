angular.module('app.routes', [])

    .constant('ngAuthSettings', {
      //  apiServiceBaseUri: 'http://ec2-34-208-118-110.us-west-2.compute.amazonaws.com/',
     apiServiceBaseUri: 'http://ec2-34-208-118-110.us-west-2.compute.amazonaws.com/',
       // apiServiceBaseUri: 'http://localhost:26265/',
        clientId: 'ngAuthApp'
    })

.config(function ($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js 
    $stateProvider
    .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'loginCtrl'
    }).state('map', {
       url: '/map',
       templateUrl: 'templates/map.html',
       controller: 'routeCtrl'
      }).state('AssignedProducts', {
          url: '/AssignedProducts',
          templateUrl: 'templates/AssignedProducts.html',
          controller: 'AssignedProductsCtrl'
      }).state('task', {
        url: '/task',
        templateUrl: 'templates/task.html',
        controller: 'taskCtrl'
      }).state('TaskHistory', {
          url: '/TaskHistory',
          templateUrl: 'templates/TaskHistory.html',
          controller: 'taskHistoryCtrl'
      })
        .state('TaskHistoryDetails', {
            url: '/TaskHistoryDetails/:type',
            templateUrl: 'templates/TaskHistoryDetails.html',
            controller: 'taskHistoryDetailsCtrl'
        })
          .state('Summary', {
              url: '/Summary/:type',
              templateUrl: 'templates/Summary.html',
              controller: 'SummaryCtrl'
          })
        .state('taskDetails', {
        url: '/taskDetails/:type',
        templateUrl: 'templates/taskDetails.html',
        controller: 'taskdetailsCtrl'
    }).state('signature', {
        url: '/signature',
        templateUrl: 'templates/signature.html',
        controller: 'SignatureCtrl'
    })
        //MK
        .state('Notes', {
            url: '/Notes',
            templateUrl: 'templates/Notes.html',
            controller: 'NotesCtrl'
        })

    .state('Logout', {
        url: '/logout',
        templateUrl: 'templates/login.html',
        controller: 'loginCtrl'
    })

    .state('ForgetPassword', {
        url: '/forgetpassword',
        templateUrl: 'templates/forgetPassword.html',
        controller: 'loginCtrl'
    })


    .state('signup', {
        url: '/signup',
        templateUrl: 'templates/signup.html',
        controller: 'signupCtrl'
    })

    .state('home', {
        url: '/home',
        templateUrl: 'templates/home.html',
        controller: 'homeCtrl'
    })

    .state('calander', {
        url: '/calander',
        templateUrl: 'templates/calander.html',
        controller: 'calanderCtrl'
    })

    .state('notification', {
        url: '/notification',
        templateUrl: 'templates/notification.html',
        controller: 'notificationCtrl'
    })

    .state('Profile', {
        url: '/profile',
        templateUrl: 'templates/profile.html',
        controller: 'profileCtrl'
    })

    .state('Changepass', {
        url: '/changepass',
        templateUrl: 'templates/changePassword.html',
        controller: 'profileCtrl'
    })

    .state('Tutorials', {
        url: '/tut',
        templateUrl: 'templates/tutorials.html',
        controller: 'homeCtrl'
    })

    .state('Setting', {
        url: '/setting',
        templateUrl: 'templates/setting.html',
        controller: 'settingCtrl'
    })

    .state('route', {
        url: '/route',
        templateUrl: 'templates/route.html',
        controller: 'routeCtrl'
    })
    .state('OrderAssissment', {
        url: '/OrderAssissment',
        templateUrl: 'templates/OrderAssisHistory.html',
        controller: 'AssismentCtrl'
    })
     .state('OrderCurrency', {
         url: '/OrderCurrency',
         templateUrl: 'templates/OrderCurrency.html',
         controller: 'OrderCurrencyCtrl'
     })
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');

});