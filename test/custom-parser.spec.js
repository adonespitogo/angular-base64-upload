

describe('Custom Parser', function () {

  var event, file, expectedModel, parser, directive, $window;

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
      file = new File();
      event = new Event();
      $window = $INJECTOR.get('$window');

    });

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

    directive = _compile({
      attrs: [
        {attr: 'ng-model', val: 'model'}
      ],
      events: [
        {
          name: 'parser',
          handler: parser,
          bindTo: 'parserHandler'
        }
      ]
    });

    var spy = spyOn(directive.$scope, 'parserHandler').andCallThrough();

    directive.$input.triggerHandler(event);

    $ROOTSCOPE.$apply();
    expect(spy).toHaveBeenCalled();
    expect(directive.$scope.model).toEqual(expectedModel);
  });

});
