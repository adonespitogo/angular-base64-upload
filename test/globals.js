// global variables

var template;
var $compile;
var $rootScope;
var $scope;
var isolateScope;
var $window;
var elem; // result of angular.element(template);
var compiled; // result of $compile(scope)(elem);
var FileMock;
var FileListMock;
var eventMock;

var FILE_READER_EVENTS = ['onabort', 'onerror', 'onloadstart', 'onloadend', 'onprogress', 'onload'];

var fileObjectMock;