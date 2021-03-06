var pActivityInfo = function(o, selected){
    var self = $.extend(this, new Documents());
    if(!o) o = {};
    if(!selected) selected = false;
    self.projectActivityId = ko.observable(o.projectActivityId);
    self.name = ko.observable(o.name ? o.name : "Survey name");
    self.description = ko.observable(o.description);
    self.status = ko.observable(o.status ? o.status : "active");
    self.startDate = ko.observable(o.startDate).extend({simpleDate:false});
    self.endDate = ko.observable(o.endDate).extend({simpleDate:false});
    self.commentsAllowed = ko.observable(o.commentsAllowed ? o.commentsAllowed : false);
    self.published = ko.observable(o.published ? o.published : false);

    self.current = ko.observable(selected);

    self.addActivity = function(){
        window.location.href = fcConfig.bioActiviyCreateUrl + "/" + self.projectActivityId();
    };

    self.transients = self.transients || {};
    self.transients.imageUploadUrl  = ko.observable(fcConfig.imageUploadUrl);
    self.transients.logoUrl = ko.pureComputed(function(){
        var url = self.logoUrl() ? self.logoUrl() : fcConfig.imageLocation + "/no-image-2.png"
        return url;
    });

    var isBeforeToday = function(date) {
        return moment(date) < moment().startOf('day');
    };
    var calculateDurationInDays = function(startDate, endDate) {
        var start = moment(startDate);
        var end = moment(endDate);
        var days = end.diff(start, 'days');
        return days < 0? 0: days;
    };

    self.transients.daysSince = ko.pureComputed(function() {
        var startDate = self.startDate();
        if (!startDate) return -1;
        var start = moment(startDate);
        var today = moment();
        return today.diff(start, 'days');
    });

    self.transients.daysRemaining = ko.pureComputed(function() {
        var end = self.endDate();
        return end? isBeforeToday(end)? 0: calculateDurationInDays(undefined, end) + 1: -1;
    });
    self.transients.daysTotal = ko.pureComputed(function() {
        return self.startDate()? calculateDurationInDays(self.startDate(), self.endDate()): -1;
    });
    self.transients.status = ko.pureComputed(function(){
        var status = "";
        if(self.transients.daysSince() < 0 || (self.transients.daysSince() >= 0 && self.transients.daysRemaining() > 0)){
            status = "Active, Not yet started"
        }
        else if(self.transients.daysSince() >= 0 && self.transients.daysRemaining() < 0){
            status = "Active, In progress"
        }
        else if(self.transients.daysSince() >= 0 && self.transients.daysRemaining() == 0){
            status = "Inactive, Completed"
        }
        return status;
    });

    if (o.documents !== undefined && o.documents.length > 0) {
        $.each(['logo'], function(i, role){
            var document = self.findDocumentByRole(o.documents, role);
            if (document) {
                self.documents.push(document);
            }
        });
    }
};