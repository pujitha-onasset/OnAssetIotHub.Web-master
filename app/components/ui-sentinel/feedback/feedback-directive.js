(function() {
    'use strict';

    angular
        .module('ui-sentinel.feedback')
        .directive('feedback', FeedbackDirective);

    function FeedbackDirective() {
        var directive = {
            restrict: 'A',
            controller: ThisDirectiveController,
            controllerAs: 'feedback',
            templateUrl: 'ui-sentinel-feedback/feedback-directive.html'
        };
        return directive;
    }

    ThisDirectiveController.$inject = ['FeedbackService'];
    function ThisDirectiveController(FeedbackService) {
        var service = FeedbackService;
        return service;
    }
})();
