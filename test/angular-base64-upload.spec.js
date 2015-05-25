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

  it('should support single file selection', function () {

    compileTemplate({ngModel: 'file'});

    elem.triggerHandler(eventmock);

    expect($scope.file).toEqual(fileObjectmock);

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

  it('should do nothing when no ng-model', function () {

    eventmock.target.files = [fileMock];

    var event = {
      name: 'on-change',
      handler: function (e, fileList) {
        expect(false).toBe(true); // should not be called when no ng-model
      },
      bindTo: 'onChangeHandler'
    };

    compileTemplate({events: [event], ngModel: false});

    var spy = spyOn($scope, 'onChangeHandler').andCallThrough();

    elem.triggerHandler(eventmock);
    expect(spy).not.toHaveBeenCalled();
  });

  describe('Events', function () {

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

      FileReaderMock.autoTriggerEvents = true; // triggers all file reader event listeners on fileReder.readAsArrayBuffer(file)
      elem.triggerHandler(eventmock);
      FileReaderMock.autoTriggerEvents = false;

      for (var a = handlerSpies.length - 1; a >= 0; a--) {
        expect(handlerSpies[a]).toHaveBeenCalled();
      }

    });

    it('should not trigger events when no file is selected', function () {

      eventmock.target.files = [];

      var event = {
        name: 'on-change',
        handler: function () {},
        bindTo: 'onChangeHandler'
      };

      compileTemplate({events: [event]});

      var spy = spyOn($scope, 'onChangeHandler').andCallThrough();

      elem.triggerHandler(eventmock);
      expect(spy).not.toHaveBeenCalled();
    });

  });

  describe('Validations', function () {

    describe('required', function () {

      var attrs;

      beforeEach(function () {
        attrs = [
          {attr: 'required', val: 'required'},
          {attr: 'name', val: 'myinput'},
        ];
      });

      it('should validate required on single file selection', function () {
        compileTemplate({ngModel: 'files', attrs: attrs});
      });

      it('should validate required on multiple file selection', function () {
        compileTemplate({ngModel: 'files', multiple:true, attrs: attrs});
      });

      afterEach(function () {
        expect($scope.form.myinput.$error.required).toBe(true);
        elem.triggerHandler(eventmock);
        expect($scope.form.myinput.$error.required).toBeFalsy();
      });

    });

    it('should validate maxnum', function () {
      var maxnum = 2;

      var attrs = [
        {attr: 'name', val: 'myinput'},
        {attr: 'maxnum', val: maxnum},
      ];


      compileTemplate({ngModel: 'files', multiple: true, attrs: attrs});

      expect($scope.form.myinput.$error.maxnum).not.toBeDefined();

      var testNumber = function (num, result) {
        eventmock.target.files = [];
        for (var i = num; i > 0; i--) {
          eventmock.target.files.push(fileMock);
        }
        elem.triggerHandler(eventmock);
        expect($scope.form.myinput.$error.maxnum)[ result? 'toBe' : 'toBeFalsy'](result);
      };

      testNumber(1, false);
      testNumber(2, false);
      testNumber(3, true);

    });

    it('should validate minnum', function () {
      var minnum = 2;

      var attrs = [
        {attr: 'name', val: 'myinput'},
        {attr: 'minnum', val: minnum},
      ];


      compileTemplate({ngModel: 'files', multiple: true, attrs: attrs});

      expect($scope.form.myinput.$error.minnum).not.toBeDefined();

      var testNumber = function (num, result) {
        eventmock.target.files = [];
        for (var i = num; i > 0; i--) {
          eventmock.target.files.push(fileMock);
        }
        elem.triggerHandler(eventmock);
        expect($scope.form.myinput.$error.minnum)[ result? 'toBe' : 'toBeFalsy'](result);
      };

      testNumber(1, true);
      testNumber(2, false);
      testNumber(3, false);

    });

    describe('maxsize', function () {

      var attrs;
      var maxsize;

      beforeEach(function () {
        maxsize = 500; //kb

        attrs = [
          {attr: 'name', val: 'myinput'},
          {attr: 'maxsize', val: maxsize},
        ];
      });

      it('should validate maxsize on single file selection', function () {

        compileTemplate({ngModel: 'files', attrs: attrs});

      });

      it('should validate maxsize on multiple file selection', function () {

        compileTemplate({ngModel: 'files', attrs: attrs, multiple: true});

      });

      afterEach(function () {

        expect($scope.form.myinput.$error.maxsize).not.toBeDefined();

        var testSize = function (size, size2, result) {

          var f1 = angular.copy(fileMock);
          f1.size = size * 1000;
          var f2 = angular.copy(fileMock);
          f2.size = size2 * 1000;

          eventmock.target.files = [f1, f2];
          elem.triggerHandler(eventmock);
          expect($scope.form.myinput.$error.maxsize)[ result? 'toBe' : 'toBeFalsy'](result);
        };

        testSize(200, 100, false);
        testSize(500, 123, false);
        testSize(200, 600, true);
        testSize(600, 100, true);

      });

    });


    it('should validate minsize', function () {
      var minsize = 500; //kb

      var attrs = [
        {attr: 'name', val: 'myinput'},
        {attr: 'minsize', val: minsize},
      ];

      compileTemplate({ngModel: 'files', multiple: true, attrs: attrs});

      expect($scope.form.myinput.$error.minsize).not.toBeDefined();

      var testSize = function (size, size2, result) {

        var f1 = angular.copy(fileMock);
        f1.size = size * 1000;
        var f2 = angular.copy(fileMock);
        f2.size = size2 * 1000;

        eventmock.target.files = [f1, f2];
        elem.triggerHandler(eventmock);
        expect($scope.form.myinput.$error.minsize)[ result? 'toBe' : 'toBeFalsy'](result);
      };

      testSize(200, 100, true);
      testSize(500, 123, true);
      testSize(500, 600, false);
      testSize(600, 700, false);

    });

  });

});
