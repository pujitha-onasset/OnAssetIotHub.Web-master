(function() {
    'use strict';

    angular
        .module('tracking.ui.feedback')
        .directive('feedback', FeedbackDirective);

    function FeedbackDirective() {
        var directive = {
            restrict: 'A',
            controller: ThisDirectiveController,
            controllerAs: 'feedback',
            templateUrl: 'tracking-ui-feedback/feedback-directive.html'
        };
        return directive;
    }

    ThisDirectiveController.$inject = ['TrackingFeedbackService'];
    function ThisDirectiveController(TrackingFeedbackService) {
        var service = TrackingFeedbackService;
        return service;
    }
})();
