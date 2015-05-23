describe('angular-base64-upload', function(){

  var fileMock;
  var fileListMock;
  var eventmock;
  var fileObjectmock;

  beforeEach(function(){

    module(function ($provide) {
      $provide.value('$window', $windowMock);
    });

    module('naif.base64');

    inject(function($injector){
      $compile = $injector.get('$compile');
      $rootScope = $injector.get('$rootScope');

      fileMock = angular.copy(FileMock);
      fileListMock = angular.copy(FileListMock);
      eventmock = angular.copy(eventMock);
      fileObjectmock = angular.copy(fileObjectMock);
    });

  });

  afterEach(function() {
    $scope.$destroy();
  });

  it('should trigger on-change handler', function () {

    eventmock.target.files = [fileMock];

    var event = {
      name: 'on-change',
      handler: function (e, fileList) {
        expect(e.target.files).toBe(fileList);
        expect(fileList).toBe(eventmock.target.files);
      },
      bindTo: 'onChangeHandler'
    };

    compileTemplate({events: [event]});

    var spy = spyOn($scope, 'onChangeHandler').andCallThrough();

    elem.triggerHandler(eventmock);
    expect(spy).toHaveBeenCalled();
  });

  it('should support multi-select input', function () {

    compileTemplate({ngModel: 'files', multiple: true});

    var expectedFileList = eventmock.target.files;
    var expectedFileObjects = _.map(expectedFileList, function () {
      return fileObjectmock;
    });

    elem.triggerHandler(eventmock);

    expect($scope.files).toEqual(expectedFileObjects);
    expect($scope.files.length).toBe(expectedFileObjects.length);

  });

  it('should trigger file reader event handlers', function () {

    eventmock.target.files = [fileMock];

    var makeHandler = function (type) {
      return function (e, reader, file, fileList, fileObjects, fileObject) {
        expect(e.type).toBe(type);
        expect(fileList).toEqual(eventmock.target.files);
      };
    };

    var eventsOpt = [];

    var handlerSpies = [];

    for (var i = FILE_READER_EVENTS.length - 1; i >= 0; i--) {
      var evt = FILE_READER_EVENTS[i];
      eventsOpt[i] = {
        name: evt,
        handler: makeHandler(evt),
        bindTo: evt + "Handler"
      };
    }

    compileTemplate({events: eventsOpt});

    for (var c = FILE_READER_EVENTS.length - 1; c >= 0; c--) {
      var e = FILE_READER_EVENTS[c];
      var spy = spyOn($scope, e+'Handler').andCallThrough();
      handlerSpies.push(spy);
    }

    FileReaderMock.autoTriggerEvents = true; // triggers all event listeners on fileReder.readAsArrayBuffer(file)
    elem.triggerHandler(eventmock);
    FileReaderMock.autoTriggerEvents = false;

    for (var a = handlerSpies.length - 1; a >= 0; a--) {
      expect(handlerSpies[a]).toHaveBeenCalled();
    }


  });

});
