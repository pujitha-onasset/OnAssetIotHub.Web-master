(function () {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('FeedbackService', FeedbackService);

    FeedbackService.$inject = [];
    function FeedbackService() {
        var service = {
            message: null,
            class: null,
            icon: null,
            addError: addError,
            addSuccess: addSuccess,
            addNotice: addNotice,
            clear: clear
        };
        return service;

        function addError(message) {
            service.message = message;
            service.class = 'alert-danger';
            service.icon = 'fa-exclamation-triangle';
        }

        function addNotice(message) {
            service.message = message;
            service.class = 'alert-info';
            service.icon = 'fa-info-circle';
        }

        function addSuccess(message) {
            service.message = message;
            service.class = 'alert-success';
            service.icon = 'fa-check-square';
        }

        function clear() {
            service.message = null;
            service.class = null;
            service.icon = null;
        }
    }
})();