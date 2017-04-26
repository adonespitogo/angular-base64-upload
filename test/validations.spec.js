describe('Validations', function() {

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

  describe('required', function() {

    var attrs;
    var directive;
    var scope;

    beforeEach(function() {
      attrs = [
        { attr: 'ng-model', val: 'files' },
        { attr: 'required', val: 'required' },
        { attr: 'name', val: 'myinput' },
      ];
      scope = $ROOTSCOPE.$new();
    });

    it('should validate required on single file selection', function() {
      scope.file = {};
      directive = _compile({ attrs: attrs, scope: scope });
    });

    it('should validate required on multiple file selection', function() {
      scope.files = [];
      attrs.push({
        attr: 'multiple',
        val: true
      });
      directive = _compile({ attrs: attrs, scope: scope });
    });

    afterEach(function() {
      $ROOTSCOPE.$apply();
      expect(directive.$scope.form.myinput.$error.required).toBe(true);
      expect(directive.$scope.form.myinput.$dirty).toBeFalsy();
      expect(directive.$scope.form.myinput.$pristine).toBe(true);
      directive.$input.triggerHandler(event);
      $ROOTSCOPE.$apply();
      expect(directive.$scope.form.myinput.$error.required).toBeFalsy();
    });

  });

  describe('maxsize', function() {

    var maxsize;
    var attrs;

    beforeEach(function() {
      maxsize = 500;
      attrs = [
        { attr: 'ng-model', val: 'model' },
        { attr: 'name', val: 'myinput' },
        { attr: 'maxsize', val: maxsize },
      ];
    });


    it('should validate maxsize on single file selection', function() {

      var d = _compile({ attrs: attrs });
      expect(d.$scope.form.myinput.$error.maxsize).not.toBeDefined();

      var testSize = function(size, result) {

        var f1 = new File({ size: size * 1000 });

        event.target.files = [f1];
        d.$input.triggerHandler(event);
        $ROOTSCOPE.$apply();
        expect(d.$scope.form.myinput.$error.maxsize)[result ? 'toBe' : 'toBeFalsy'](result);
      };

      testSize(200, false);
      testSize(500, false);
      testSize(600, true);

    });

    it('should validate maxsize on multiple file selection', function() {

      attrs.push({ attr: 'multiple', val: true });

      var d = _compile({ attrs: attrs });

      expect(d.$scope.form.myinput.$error.maxsize).not.toBeDefined();

      var testSize = function(size, size2, result) {

        var f1 = new File({ size: size * 1000 });
        var f2 = new File({ size: size2 * 1000 });

        event.target.files = [f1, f2];
        d.$input.triggerHandler(event);
        $ROOTSCOPE.$apply();
        expect(d.$scope.form.myinput.$error.maxsize)[result ? 'toBe' : 'toBeFalsy'](result);
      };

      testSize(200, 100, false);
      testSize(500, 123, false);
      testSize(200, 600, true);
      testSize(600, 100, true);

    });
  });

  describe('minsize', function() {

    var minsize;
    var attrs;

    beforeEach(function() {
      minsize = 500; //kb

      attrs = [
        { attr: 'ng-model', val: 'model' },
        { attr: 'name', val: 'myinput' },
        { attr: 'minsize', val: minsize },
      ];
    });

    it('should validate minsize on single file selection', function() {


      var d = _compile({ attrs: attrs });

      expect(d.$scope.form.myinput.$error.minsize).not.toBeDefined();

      var testSize = function(size, result) {

        var f1 = new File({ size: size * 1000 });

        event.target.files = [f1];
        d.$input.triggerHandler(event);
        $ROOTSCOPE.$apply();
        expect(d.$scope.form.myinput.$error.minsize)[result ? 'toBe' : 'toBeFalsy'](result);
      };

      testSize(200, true);
      testSize(500, false);
      testSize(600, false);

    });

    it('should validate minsize on multiple file selection', function() {

      attrs.push({ attr: 'multiple', val: true });

      var d = _compile({ attrs: attrs });

      expect(d.$scope.form.myinput.$error.minsize).not.toBeDefined();

      var testSize = function(size, size2, result) {

        var f1 = new File({ size: size * 1000 });
        var f2 = new File({ size: size2 * 1000 });

        event.target.files = [f1, f2];
        d.$input.triggerHandler(event);
        $ROOTSCOPE.$apply();
        expect(d.$scope.form.myinput.$error.minsize)[result ? 'toBe' : 'toBeFalsy'](result);
      };

      testSize(200, 100, true);
      testSize(500, 100, true);
      testSize(500, 500, false);
      testSize(600, 500, false);
      testSize(600, 700, false);
    });

  });

  describe('maxnum and minnum', function() {

    it('should validate maxnum', function() {
      var maxnum = 2;

      var attrs = [
        { attr: 'ng-model', val: 'model' },
        { attr: 'multiple', val: true },
        { attr: 'name', val: 'myinput' },
        { attr: 'maxnum', val: maxnum },
      ];

      var d = _compile({ attrs: attrs });

      expect(d.$scope.form.myinput.$error.maxnum).not.toBeDefined();

      var testNumber = function(num, result) {
        event.target.files = new FileList(num);
        d.$input.triggerHandler(event);
        $ROOTSCOPE.$apply();
        expect(d.$scope.form.myinput.$error.maxnum)[result ? 'toBe' : 'toBeFalsy'](result);
      };

      testNumber(1, false);
      testNumber(2, false);
      testNumber(3, true);

    });

    it('should validate minnum', function() {
      var minnum = 2;

      var attrs = [
        { attr: 'ng-model', val: 'model' },
        { attr: 'multiple', val: true },
        { attr: 'name', val: 'myinput' },
        { attr: 'minnum', val: minnum },
      ];


      var dir = _compile({ attrs: attrs });

      expect(dir.$scope.form.myinput.$error.minnum).not.toBeDefined();

      var testNumber = function(num, result) {
        event.target.files = new FileList(num);
        dir.$input.triggerHandler(event);
        $ROOTSCOPE.$apply();
        expect(dir.$scope.form.myinput.$error.minnum)[result ? 'toBe' : 'toBeFalsy'](result);
      };

      testNumber(1, true);
      testNumber(2, false);
      testNumber(3, false);

    });

  });

  describe('accept', function() {
    /*
      All possible file types:
      - file_extension  A file extension starting with the STOP character.
          e.g: .gif, .jpg, .png, .doc
      - audio/* All sound files are accepted
      - video/* All video files are accepted
      - image/* All image files are accepted
      - media_type  A valid media type, with no parameters. Look at IANA
          Media Types for a complete list of standard media types
    */
    var accept;
    var attrs;

    beforeEach(function() {
      accept = "image/*, .amr"; // all images

      attrs = [
        { attr: 'ng-model', val: 'files' },
        { attr: 'name', val: 'myinput' },
        { attr: 'accept', val: accept },
      ];
      // default filename: "filename.txt"
    });

    it('should validate accept on single file selection', function() {


      var d = _compile({ attrs: attrs });

      expect(d.$scope.form.myinput.$error.accept).not.toBeDefined();

      var testType = function(isFileNameAMR, type, result) {
        var fileName = "Maid with the Flaxen Hair.amr";
        var f1 = new File({ name: isFileNameAMR ? fileName : "filename.txt", type: type });

        event.target.files = [f1];
        d.$input.triggerHandler(event);
        $ROOTSCOPE.$apply();
        expect(d.$scope.form.myinput.$error.accept)[result ? 'toBe' : 'toBeFalsy'](result);
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

    it('should validate accept on multiple file selection', function() {

      attrs.push({ attr: 'multiple', val: true });

      var d = _compile({ attrs: attrs });

      expect(d.$scope.form.myinput.$error.accept).not.toBeDefined();

      var testType = function(type, type2, result) {

        var f1 = new File({ type: type });
        var f2 = new File({ type: type2 });

        event.target.files = [f1, f2];
        d.$input.triggerHandler(event);
        $ROOTSCOPE.$apply();
        expect(d.$scope.form.myinput.$error.accept)[result ? 'toBe' : 'toBeFalsy'](result);
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

    it('should validate accept on multiple file selection with custom extentions', function() {

      var customAttrs = [
        { attr: 'ng-model', val: 'model' },
        { attr: 'multiple', val: true },
        { attr: 'name', val: 'myinput' },
        { attr: 'accept', val: "image/*, .zip" },
      ];
      var d = _compile({ attrs: customAttrs});

      expect(d.$scope.form.myinput.$error.accept).not.toBeDefined();

      var testType = function(type, type2, result) {

        //setting f1 to .zip to check custom accept values
        var f1 = new File({ name: "dont-download-git-repos-as.zip", type: type });
        var f2 = new File({ name: "clone-them:)", type: type2 });

        event.target.files = [f1, f2];
        d.$input.triggerHandler(event);
        $ROOTSCOPE.$apply();
        expect(d.$scope.form.myinput.$error.accept)[result ? 'toBe' : 'toBeFalsy'](result);
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

  describe('doNotParseIfOversize', function() {
    var maxsize;
    var attrs;

    beforeEach(function() {
      maxsize = 500; //kb

      attrs = [
        { attr: 'ng-model', val: 'model' },
        { attr: 'name', val: 'myinput' },
        { attr: 'maxsize', val: maxsize }
      ];
    });

    it('should not parse single oversized files when doNotParseIfOversize is set', function() {
      attrs.push({ attr: 'do-not-parse-if-oversize', val: '' });
      var d = _compile({ attrs: attrs });

      var testSize = function(size, shouldBeNull) {

        var f1 = new File({ size: size * 1000 });

        event.target.files = [f1];
        d.$input.triggerHandler(event);
        $ROOTSCOPE.$apply();
        if (shouldBeNull) {
          expect(d.$scope.model.base64).toBe(null);
        } else {
          expect(d.$scope.model.base64).not.toBe(null);
        }
        
      };

      testSize(200, false);
      testSize(500, false);
      testSize(600, true);

    });

    it('should not parse multiple oversized files when doNotParseIfOversize is set', function() {
      attrs.push({ attr: 'do-not-parse-if-oversize', val: '' });
      attrs.push({ attr: 'multiple', val: true });

      var d = _compile({ attrs: attrs });

      expect(d.$scope.form.myinput.$error.maxsize).not.toBeDefined();

      var testSize = function(size, size2, shouldBeNull, shouldBeNull2) {

        var f1 = new File({ size: size * 1000 });
        var f2 = new File({ size: size2 * 1000 });

        event.target.files = [f1, f2];
        d.$input.triggerHandler(event);
        $ROOTSCOPE.$apply();
        if (shouldBeNull) {
          expect(d.$scope.model[1].base64).toBe(null);
        } else {
          expect(d.$scope.model[1].base64).not.toBe(null);
        }
        if (shouldBeNull2) {
          expect(d.$scope.model[0].base64).toBe(null);
        } else {
          expect(d.$scope.model[0].base64).not.toBe(null);
        }
      };

      testSize(200, 100, false, false);
      testSize(500, 123, false, false);
      testSize(200, 600, false, true);
      testSize(600, 100, true, false);

    });

    it('should parse single oversized files when doNotParseIfOversize is not set', function() {
      var d = _compile({ attrs: attrs });

      var testSize = function(size) {

        var f1 = new File({ size: size * 1000 });

        event.target.files = [f1];
        d.$input.triggerHandler(event);
        $ROOTSCOPE.$apply();
        expect(d.$scope.model.base64).not.toBe(null);
        
      };

      testSize(200);
      testSize(500);
      testSize(600);

    });

    it('should parse multiple oversized files when doNotParseIfOversize is not set', function() {
      attrs.push({ attr: 'multiple', val: true });

      var d = _compile({ attrs: attrs });

      expect(d.$scope.form.myinput.$error.maxsize).not.toBeDefined();

      var testSize = function(size, size2) {

        var f1 = new File({ size: size * 1000 });
        var f2 = new File({ size: size2 * 1000 });

        event.target.files = [f1, f2];
        d.$input.triggerHandler(event);
        $ROOTSCOPE.$apply();
        expect(d.$scope.model[0].base64).not.toBe(null);
        expect(d.$scope.model[1].base64).not.toBe(null);
      };

      testSize(200, 100);
      testSize(500, 123);
      testSize(200, 600);
      testSize(600, 100);

    });
  });
});
