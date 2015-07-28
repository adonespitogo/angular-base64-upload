describe('AngularBase64Upload', function(){

  describe('BaseSixtyFourInput Directive', function () {

    var event;

    beforeEach(function(){

      module('naif.base64');

      module(function ($provide) {
        $provide.value('$window', $windowMock);
      });

      inject(function($injector){

        $INJECTOR = $injector;
        $COMPILE = $injector.get('$compile');
        $ROOTSCOPE = $injector.get('$rootScope');

        event = new Event();

      });

    });

    it('should support single file selection', function () {

      var file = new File();
      var fileObj = new FileObject();
      var event = new Event({files: [file]});

      var directive = _compile({ngModel: 'file'});

      directive.$input.triggerHandler(event);
      $ROOTSCOPE.$apply();
      expect(directive.$scope.file).toEqual(fileObj);

    });

    it('should support multi-select input', function () {

      var directive = _compile({ngModel: 'files', multiple: true});

      var expectedFileList = event.target.files;
      var expectedFileObjects = new FileObjects(expectedFileList.length);

      directive.$input.triggerHandler(event);

      $ROOTSCOPE.$apply();
      expect(directive.$scope.files).toEqual(expectedFileObjects);
      expect(directive.$scope.files.length).toBe(expectedFileObjects.length);

    });


    describe('Custom Parser', function () {

      var file, expectedModel, parser, directive, $window;

      beforeEach(function () {

        file = new File();
        event = new Event();
        $window = $INJECTOR.get('$window');

      });

      it('should append returned object to model', function () {

        expectedModel = {
          filename: 'expected-name',
          filetype: 'text/stylesheet',
          filesize: 0
        };

        parser = function (file, base64_object) {
          expect(base64_object).toEqual({
            filename: file.name,
            filesize: file.size,
            filetype: file.type,
            base64: $window._arrayBufferToBase64()
          });
          return expectedModel;
        };

      });

      it('should update model when return value is a promise', function () {

        expectedModel = {
          filename: 'expected-name',
          filetype: 'text/stylesheet',
          filesize: 0
        };

        parser = function (file, base64_object) {
          expect(base64_object).toEqual({
            filename: file.name,
            filesize: file.size,
            filetype: file.type,
            base64: $window._arrayBufferToBase64()
          });

          var $q = $INJECTOR.get('$q');
          var d = $q.defer();
          d.resolve(expectedModel);
          return d.promise;
        };


      });

      it('should append null to model', function () {

        expectedModel = undefined;

        parser = function (file, base64_object) {

          expect(base64_object).toEqual({
            filename: file.name,
            filesize: file.size,
            filetype: file.type,
            base64: $window._arrayBufferToBase64()
          });

        };

      });

      afterEach(function () {

        directive = _compile({events: [{
          name: 'parser',
          handler: parser,
          bindTo: 'parserHandler'
        }]});

        var spy = spyOn(directive.$scope, 'parserHandler').andCallThrough();

        directive.$input.triggerHandler(event);

        $ROOTSCOPE.$apply();
        expect(spy).toHaveBeenCalled();
        expect(directive.$scope.model).toEqual(expectedModel);
      });

    });

    describe('Events', function () {


      it('should trigger on-change handler', function () {

        event.target.files = new FileList(1);

        var onChangeHandler = {
          name: 'on-change',
          handler: function (e, fileList) {
            expect(e.target.files).toBe(fileList);
            expect(fileList).toBe(event.target.files);
          },
          bindTo: 'onChangeHandler'
        };

        var d = _compile({events: [onChangeHandler]});

        var spy = spyOn(d.$scope, 'onChangeHandler').andCallThrough();

        d.$input.triggerHandler(event);
        $ROOTSCOPE.$apply();
        expect(spy).toHaveBeenCalled();
      });

      it('should trigger file reader event handlers', function () {

        event.target.files = new FileList(1);

        var makeHandler = function (type) {
          return function (e, reader, file, fileList, fileObjects, fileObject) {
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

        var dir = _compile({events: eventsOpt});

        var handlerSpies = [];

        for (var c = FILE_READER_EVENTS.length - 1; c >= 0; c--) {
          var e = FILE_READER_EVENTS[c];
          var spy = spyOn(dir.$scope, e+'Handler').andCallThrough();
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

      it('should not trigger events when no file is selected', function () {

        event.target.files = [];

        var e = {
          name: 'on-change',
          handler: function () {},
          bindTo: 'onChangeHandler'
        };

        var d = _compile({events: [e]});

        var spy = spyOn(d.$scope, 'onChangeHandler').andCallThrough();

        d.$input.triggerHandler(event);
        expect(spy).not.toHaveBeenCalled();
      });

    });

    describe('Validations', function () {

      describe('required', function () {

        var attrs;
        var directive;

        beforeEach(function () {
          attrs = [
            {attr: 'required', val: 'required'},
            {attr: 'name', val: 'myinput'},
          ];
        });

        it('should validate required on single file selection', function () {
          directive = _compile({ngModel: 'files', attrs: attrs});
        });

        it('should validate required on multiple file selection', function () {
          directive = _compile({ngModel: 'files', multiple:true, attrs: attrs});
        });

        afterEach(function () {
          $ROOTSCOPE.$apply();
          expect(directive.$scope.form.myinput.$error.required).toBe(true);
          directive.$input.triggerHandler(event);
          $ROOTSCOPE.$apply();
          expect(directive.$scope.form.myinput.$error.required).toBeFalsy();
        });

      });

      describe('maxsize', function () {

        var maxsize;
        var attrs;

        beforeEach(function () {
          maxsize = 500;
          attrs = [
            {attr: 'name', val: 'myinput'},
            {attr: 'maxsize', val: maxsize},
          ];
        });


        it('should validate maxsize on single file selection', function () {

          var d = _compile({ngModel: 'files', attrs: attrs});

          expect(d.$scope.form.myinput.$error.maxsize).not.toBeDefined();

          var testSize = function (size, result) {

            var f1 = new File({size: size * 1000});

            event.target.files = [f1];
            d.$input.triggerHandler(event);
            $ROOTSCOPE.$apply();
            expect(d.$scope.form.myinput.$error.maxsize)[ result? 'toBe' : 'toBeFalsy'](result);
          };

          testSize(200, false);
          testSize(500, false);
          testSize(600, true);

        });

        it('should validate maxsize on multiple file selection', function () {

          var d = _compile({ngModel: 'files', attrs: attrs, multiple: true});

          expect(d.$scope.form.myinput.$error.maxsize).not.toBeDefined();

          var testSize = function (size, size2, result) {

            var f1 = new File({size: size * 1000});
            var f2 = new File({size: size2 * 1000});

            event.target.files = [f1, f2];
            d.$input.triggerHandler(event);
            $ROOTSCOPE.$apply();
            expect(d.$scope.form.myinput.$error.maxsize)[ result? 'toBe' : 'toBeFalsy'](result);
          };

          testSize(200, 100, false);
          testSize(500, 123, false);
          testSize(200, 600, true);
          testSize(600, 100, true);

        });
      });

      describe('minsize', function () {

        var minsize;
        var attrs;

        beforeEach(function () {
          minsize = 500; //kb

          attrs = [
            {attr: 'name', val: 'myinput'},
            {attr: 'minsize', val: minsize},
          ];
        });

        it('should validate minsize on single file selection', function () {


          var d = _compile({ngModel: 'files', attrs: attrs});

          expect(d.$scope.form.myinput.$error.minsize).not.toBeDefined();

          var testSize = function (size, result) {

            var f1 = new File({size: size * 1000});

            event.target.files = [f1];
            d.$input.triggerHandler(event);
            $ROOTSCOPE.$apply();
            expect(d.$scope.form.myinput.$error.minsize)[ result? 'toBe' : 'toBeFalsy'](result);
          };

          testSize(200, true);
          testSize(500, false);
          testSize(600, false);

        });

        it('should validate minsize on multiple file selection', function () {

          var d = _compile({ngModel: 'files', attrs: attrs, multiple: true});

          expect(d.$scope.form.myinput.$error.minsize).not.toBeDefined();

          var testSize = function (size, size2, result) {

            var f1 = new File({size: size * 1000});
            var f2 = new File({size: size2 * 1000});

            event.target.files = [f1, f2];
            d.$input.triggerHandler(event);
            $ROOTSCOPE.$apply();
            expect(d.$scope.form.myinput.$error.minsize)[ result? 'toBe' : 'toBeFalsy'](result);
          };

          testSize(200, 100, true);
          testSize(500, 100, true);
          testSize(500, 500, false);
          testSize(600, 500, false);
          testSize(600, 700, false);

        });

      });

      describe('maxnum and minnum', function () {

        it('should validate maxnum', function () {
          var maxnum = 2;

          var attrs = [
            {attr: 'name', val: 'myinput'},
            {attr: 'maxnum', val: maxnum},
          ];


          var d = _compile({ngModel: 'files', multiple: true, attrs: attrs});

          expect(d.$scope.form.myinput.$error.maxnum).not.toBeDefined();

          var testNumber = function (num, result) {
            event.target.files = new FileList(num);
            d.$input.triggerHandler(event);
            $ROOTSCOPE.$apply();
            expect(d.$scope.form.myinput.$error.maxnum)[ result? 'toBe' : 'toBeFalsy'](result);
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


          var dir = _compile({ngModel: 'files', multiple: true, attrs: attrs});

          expect(dir.$scope.form.myinput.$error.minnum).not.toBeDefined();

          var testNumber = function (num, result) {
            event.target.files = new FileList(num);
            dir.$input.triggerHandler(event);
            $ROOTSCOPE.$apply();
            expect(dir.$scope.form.myinput.$error.minnum)[ result? 'toBe' : 'toBeFalsy'](result);
          };

          testNumber(1, true);
          testNumber(2, false);
          testNumber(3, false);

        });

      });
      describe('Input ngModel controller', function () {

          it('should is not dirty and is pristine when init with required', function () {
              var attrs =  [
                  {attr: 'name', val: 'myinput'},
                  {attr: 'required'}
              ];

              var d = _compile({ngModel: 'files', multiple: true, attrs: attrs});

              expect(d.$scope.form.myinput.$dirty).toBe(false);
              expect(d.$scope.form.myinput.$pristine).toBe(true);
          });
      });

    });

  });

});
