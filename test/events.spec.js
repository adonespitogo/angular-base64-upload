describe('Events', function() {

  var event;

  beforeEach(function() {

    module('naif.base64');

    module(function($provide) {
      $provide.value('$window', $windowMock);
    });

    inject(function($injector) {

      $INJECTOR = $injector;
      $COMPILE = $injector.get('$compile');
      $ROOTSCOPE = $injector.get('$rootScope');

      event = new Event();

    });

  });

  it('should trigger on-change handler', function() {

    event.target.files = new FileList(1);

    var onChangeHandler = {
      name: 'on-change',
      handler: function(e, fileList) {
        expect(e.target.files).toBe(fileList);
        expect(fileList).toBe(event.target.files);
      },
      bindTo: 'onChangeHandler'
    };

    var d = _compile({
      attrs: [
        { attr: 'ng-model', val: 'model' }
      ],
      events: [onChangeHandler]
    });

    var spy = spyOn(d.$scope, 'onChangeHandler').andCallThrough();

    d.$input.triggerHandler(event);
    $ROOTSCOPE.$apply();
    expect(spy).toHaveBeenCalled();
  });

  it('should trigger on-after-validate handler', function() {

    event.target.files = new FileList(1);

    var onAfterValidateHandler = {
      name: 'on-after-validate',
      handler: function(e, _, fileList) {
        expect(e.target.files).toBe(fileList);
        expect(fileList).toBe(event.target.files);
      },
      bindTo: 'onAfterValidateHandler'
    };

    var d = _compile({
      attrs: [
        { attr: 'ng-model', val: 'model' }
      ],
      events: [onAfterValidateHandler]
    });

    var spy = spyOn(d.$scope, 'onAfterValidateHandler').andCallThrough();

    d.$input.triggerHandler(event);
    $ROOTSCOPE.$apply();
    expect(spy).toHaveBeenCalled();
  });

  it('should validate for errors on-after-validate handler', function() {
    var allErrorTypes = ["maxsize", "minsize", "maxnum", "minnum"];

    var testForErrors = function(files, expectedErrorTypes) {
      var d;
      var onAfterValidateHandler = {
        name: 'on-after-validate',
        handler: function(e, _, fileList) {
          expect(e.target.files).toBe(fileList);
          expect(fileList).toBe(event.target.files);
          for (var i = 0; i < expectedErrorTypes.length; i++) {
            expect(d.$scope.form.myinput.$error[expectedErrorTypes[i]]).toBeTruthy();
            // console.log(expectedErrorTypes[i], d.$scope.form.myinput.$error[expectedErrorTypes[i]]);
          }
        },
        bindTo: 'onAfterValidateHandler'
      };

      // define element with attributes
      d = _compile({
        attrs: [
          { attr: 'ng-model', val: 'files' },
          { attr: 'multiple', val: true },
          { attr: 'maxsize', val: 600 },
          { attr: 'minsize', val: 300 },
          { attr: 'maxnum', val: 3 },
          { attr: 'minnum', val: 2 },
          { attr: 'name', val: 'myinput' }
        ],
        scope: $ROOTSCOPE.$new(),
        // bind event handler
        events: [onAfterValidateHandler]
      });

      event.target.files = files;

      var spy = spyOn(d.$scope, 'onAfterValidateHandler').andCallThrough();

      for (var i = 0; i < expectedErrorTypes.length; i++) {
        expect(d.$scope.form.myinput.$error[expectedErrorTypes[i]]).not.toBeDefined();
      }

      d.$input.triggerHandler(event);
      $ROOTSCOPE.$apply();
      expect(spy).toHaveBeenCalled();
      // console.log(d.$scope.form.myinput.$error);
    };


    // Tests
    // min 2 max 3, at least 300, at most 500
    var f1 = new File({ size: 200 * 1000 });
    var f2 = new File({ size: 700 * 1000 });

    var files = [new File()];
    testForErrors(files, ["minnum"]);

    files.push(new File());
    testForErrors(files, []); // 2 files, no error

    files.push(new File());
    files.push(new File());
    testForErrors(files, ["maxnum"]);

    files.push(f1);
    files.push(f2);
    testForErrors(files, ["maxnum", "minsize", "maxsize"]);

    files = [f1];
    testForErrors(files, ["minnum", "minsize"]);

    files = [f2];
    testForErrors(files, ["minnum", "maxsize"]);

    files = files.concat(files).concat(files);
    files = [f2, angular.copy(f2)];
    testForErrors(files, ["maxsize"]);
  });

  it('should validate for base64 on-after-validate handler', function() {
    var d;
    var onAfterValidateHandler = {
      name: 'on-after-validate',
      handler: function(e, fileObjects) {
        expect(fileObjects.length > 0).toBeTruthy();
        expect(fileObjects[0].base64).toBeTruthy();
      },
      bindTo: 'onAfterValidateHandler'
    };

    // define element with attributes
    d = _compile({
      attrs: [
        { attr: 'ng-model', val: 'files' }
      ],
      scope: $ROOTSCOPE.$new(),
      // bind event handler
      events: [onAfterValidateHandler]
    });

    event.target.files = new FileList(1);

    var spy = spyOn(d.$scope, 'onAfterValidateHandler').andCallThrough();

    d.$input.triggerHandler(event);
    $ROOTSCOPE.$apply();
    expect(spy).toHaveBeenCalled();
  });

  it('should trigger file reader event handlers', function() {

    event.target.files = new FileList(1);

    var makeHandler = function(type) {
      return function(e, reader, file, fileList, fileObjects, fileObject) {
        expect(e.type).toBe(type);
        expect(fileList).toEqual(event.target.files);
      };
    };

    var eventsOpt = [];

    for (var i = FILE_READER_EVENTS.length - 1; i >= 0; i--) {
      var evt = FILE_READER_EVENTS[i];
      eventsOpt.push({
        name: evt,
        handler: makeHandler(evt),
        bindTo: evt + "Handler"
      });
    }

    var dir = _compile({
      attrs: [
        { attr: 'ng-model', val: 'model' }
      ],
      events: eventsOpt
    });

    var handlerSpies = [];

    for (var c = FILE_READER_EVENTS.length - 1; c >= 0; c--) {
      var e = FILE_READER_EVENTS[c];
      var spy = spyOn(dir.$scope, e + 'Handler').andCallThrough();
      handlerSpies.push(spy);
    }

    FileReaderMock.autoTriggerEvents = true; // triggers all file reader event listeners on fileReder.readAsArrayBuffer(file)
    dir.$input.triggerHandler(event);
    FileReaderMock.autoTriggerEvents = false;
    $ROOTSCOPE.$apply();

    for (var a = handlerSpies.length - 1; a >= 0; a--) {
      expect(handlerSpies[a]).toHaveBeenCalled();
    }

  });

  it('should not trigger events when no file is selected', function() {

    event.target.files = [];

    var e = {
      name: 'on-change',
      handler: function() {},
      bindTo: 'onChangeHandler'
    };

    var d = _compile({
      attrs: [
        { attr: 'ng-model', val: 'model' }
      ],
      events: [e]
    });

    var spy = spyOn(d.$scope, 'onChangeHandler').andCallThrough();

    d.$input.triggerHandler(event);
    expect(spy).not.toHaveBeenCalled();
  });

});
