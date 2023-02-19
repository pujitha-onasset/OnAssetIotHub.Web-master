// (function() {
//     angular
//         .module('ui-sentinel.login')
//         .factory('LoginService', LoginService);
//
//     LoginService.$inject = ['SentinelAuthenticationService', '$rootScope', 'LOGIN_EVENTS'];
//     function LoginService(SentinelAuthenticationService, $rootScope, LOGIN_EVENTS) {
//         var service = {
//             login: login
//         };
//         return service;
//
//         function login(clientId, clientSecret) {
//             var promise = SentinelAuthenticationService.getTokenUsingClientCredentials(clientId, clientSecret).$promise;
//             promise.then(
//                 onLoginSuccess,
//                 onLoginError
//             );
//         }
//
//         function onLoginSuccess(result) {
//             $rootScope.$broadcast(LOGIN_EVENTS.LOGIN_SUCCESS, {
//                 tokenType: result.token_type,
//                 token: result.access_token,
//                 expiresIn: result.expires_in
//             });
//         }
//
//         function onLoginError(error) {
//             $rootScope.$broadcast(LOGIN_EVENTS.LOGIN_FAILURE, error);
//         }
//     }
//
// })();