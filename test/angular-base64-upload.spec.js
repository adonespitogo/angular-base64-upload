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

      it('should trigger on-after-validate handler', function () {

        event.target.files = new FileList(1);

        var onAfterValidateHandler = {
          name: 'on-after-validate',
          handler: function (e, _, fileList) {
            expect(e.target.files).toBe(fileList);
            expect(fileList).toBe(event.target.files);
          },
          bindTo: 'onAfterValidateHandler'
        };

        var d = _compile({events: [onAfterValidateHandler]});

        var spy = spyOn(d.$scope, 'onAfterValidateHandler').andCallThrough();

        d.$input.triggerHandler(event);
        $ROOTSCOPE.$apply();
        expect(spy).toHaveBeenCalled();
      });

      it('should validate for errors on-after-validate handler', function () {
        var allErrorTypes = ["maxsize", "minsize", "maxnum", "minnum"];

        var testForErrors = function(files, expectedErrorTypes){
          var d;
          var onAfterValidateHandler = {
            name: 'on-after-validate',
            handler: function (e, _, fileList) {
              expect(e.target.files).toBe(fileList);
              expect(fileList).toBe(event.target.files);
              for (var i = 0; i < 4; i++) {
                var expectation = allErrorTypes.indexOf(expectedErrorTypes[i]) > -1 ? "toBeTruthy" : "toBeFalsy";
                expect(d.$scope.form.myinput.$error[expectedErrorTypes[i]])[expectation]();
              }
            },
            bindTo: 'onAfterValidateHandler'
          };

          // define element with attributes
          d = _compile({
            ngModel: 'files',
            attrs: [
              { attr: 'maxsize', val: 600 },
              { attr: 'multiple', val: true },
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
        };


        // Tests
        // min 2 max 3, at least 300, at most 500
        var f1 = new File({size: 200 * 1000});
        var f2 = new File({size: 700 * 1000});

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
        testForErrors(files, ["maxsize"]);
      });

      it('should validate for base64 on-after-validate handler', function () {
        var d;
        var onAfterValidateHandler = {
          name: 'on-after-validate',
          handler: function (e, fileObjects) {
            expect(fileObjects.length > 0).toBeTruthy();
            expect(fileObjects[0].base64).toBeTruthy();
          },
          bindTo: 'onAfterValidateHandler'
        };

        // define element with attributes
        d = _compile({
          ngModel: 'files',
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
        var scope;

        beforeEach(function () {
          attrs = [
            {attr: 'required', val: 'required'},
            {attr: 'name', val: 'myinput'},
          ];
          scope = $ROOTSCOPE.$new();
        });

        it('should validate required on single file selection', function () {
          scope.file = {};
          directive = _compile({ngModel: 'files', attrs: attrs, scope: scope});
        });

        it('should validate required on multiple file selection', function () {
          scope.files = [];
          directive = _compile({ngModel: 'files', multiple:true, attrs: attrs, scope: scope});
        });

        afterEach(function () {
          $ROOTSCOPE.$apply();
          expect(directive.$scope.form.myinput.$error.required).toBe(true);
          expect(directive.$scope.form.myinput.$dirty).toBeFalsy();
          expect(directive.$scope.form.myinput.$pristine).toBe(true);
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

      describe('accept', function () {
        /*
          All possible file types:
          - file_extension	A file extension starting with the STOP character.
              e.g: .gif, .jpg, .png, .doc
          - audio/*	All sound files are accepted
          - video/*	All video files are accepted
          - image/*	All image files are accepted
          - media_type	A valid media type, with no parameters. Look at IANA
              Media Types for a complete list of standard media types
        */
        var accept;
        var attrs;

        beforeEach(function () {
          accept = "image/*, .amr"; // all images

          attrs = [
            {attr: 'name', val: 'myinput'},
            {attr: 'accept', val: accept},
          ];
          // default filename: "filename.txt"
        });

        it('should validate accept on single file selection', function () {


          var d = _compile({ngModel: 'files', attrs: attrs});

          expect(d.$scope.form.myinput.$error.accept).not.toBeDefined();

          var testType = function (isFileNameAMR, type, result) {
            var fileName = "Maid with the Flaxen Hair.amr";
            var f1 = new File({name: isFileNameAMR ? fileName : "filename.txt", type: type});

            event.target.files = [f1];
            d.$input.triggerHandler(event);
            $ROOTSCOPE.$apply();
            expect(d.$scope.form.myinput.$error.accept)[ result? 'toBe' : 'toBeFalsy'](result);
          };

          testType(false, "image/jpg", false);
          testType(true, "audio/mp3", false);
          testType(false, "image/png", false);
          // when type is set to empty, it defaults to image/jpeg...
          // But in production, it is set to "" (empty string)
          // for files of unknown type eg. zip files, amr/mp2 sound files, etc.
          // i set this type to test an empty/unknown type
          testType(true, "", false);
        });

        it('should validate accept on multiple file selection', function () {

          var d = _compile({ngModel: 'files', attrs: attrs, multiple: true});

          expect(d.$scope.form.myinput.$error.accept).not.toBeDefined();

          var testType = function (type, type2, result) {

            var f1 = new File({type: type});
            var f2 = new File({type: type2});

            event.target.files = [f1, f2];
            d.$input.triggerHandler(event);
            $ROOTSCOPE.$apply();
            expect(d.$scope.form.myinput.$error.accept)[ result? 'toBe' : 'toBeFalsy'](result);
          };

          testType("image/jpeg", "image/png", false);
          testType("image/gif", "image/tiff", false);
          testType("audio/mpeg4", "image/jpg", true);
          testType("video/mov", "image/jpg", true);
          // when type is set to empty, it defaults to image/jpeg...
          // But in production, it is set to "" (empty string)
          // for files of unknown type eg. zip files, amr/mp2 sound files, etc.
          // i set this type to test an empty/unknown type
          testType("n/a", "image/jpg", true);

        });

        it('should validate accept on multiple file selection with custom extentions', function () {

          var customAttrs = [
            {attr: 'name', val: 'myinput'},
            {attr: 'accept', val: "image/*, .zip"},
          ];
          var d = _compile({ngModel: 'files', attrs: customAttrs, multiple: true});

          expect(d.$scope.form.myinput.$error.accept).not.toBeDefined();

          var testType = function (type, type2, result) {

            //setting f1 to .zip to check custom accept values
            var f1 = new File({name: "dont-download-git-repos-as.zip", type: type});
            var f2 = new File({name: "clone-them:)", type: type2});

            event.target.files = [f1, f2];
            d.$input.triggerHandler(event);
            $ROOTSCOPE.$apply();
            expect(d.$scope.form.myinput.$error.accept)[ result? 'toBe' : 'toBeFalsy'](result);
          };

          testType("image/jpeg1", "image/png2", false);
          testType("image/gif3", "image/tiff4", false);
          testType("audio/mpeg44", "image/jpg5", false);
          testType("video/mov6", "image/jpg7", false);
          // type is set to empty for files of unknown type
          // eg. zip files, amr/mp2 sound files, bat files, etc.
          testType("", "image/jpg", false);

        });
      });
    });

    describe('Clear input', function () {
      var scope, directive, spy;
      beforeEach(function () {
        scope = $ROOTSCOPE.$new();
        directive = _compile({ngModel: 'file'});
        directive.$input.triggerHandler(event);
        $ROOTSCOPE.$apply();
        spy = spyOn(directive.$input.isolateScope(), '_clearInput').andCallThrough();
        expect(directive.$scope.file).toBeTruthy();
      });

      it('should clear input when $viewValue is null', function () {
        directive.$scope.file = null;
      });

      it('should clear input when $viewValue is empty object', function () {
        directive.$scope.file = {};
      });

      it('should clear input when $viewValue is empty array', function () {
        directive.$scope.file = [];
      });

      afterEach(function () {
        $ROOTSCOPE.$apply();
        expect(spy).toHaveBeenCalled();
      });
    });

  });

});
