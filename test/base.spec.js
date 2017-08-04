describe('BaseSixtyFourInput Directive', function () {

  var event, spy;

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

    var directive = _compile({attrs: [{attr: 'ng-model', val: 'file'}]});

    directive.$input.triggerHandler(event);
    $ROOTSCOPE.$apply();
    spy = spyOn(directive.$input.isolateScope(), '_clearInput').andCallThrough();
    expect(directive.$scope.file).toEqual(fileObj);

  });

  it('should support multi-select input', function () {

    var directive = _compile({
      attrs: [
        {attr: 'ng-model', val: 'files'}, 
        {attr: 'multiple', val: true}
      ]
    });

    var expectedFileList = event.target.files;
    var expectedFileObjects = new FileObjects(expectedFileList.length);

    directive.$input.triggerHandler(event);

    $ROOTSCOPE.$apply();
    expect(directive.$scope.files).toEqual(expectedFileObjects);
    expect(directive.$scope.files.length).toBe(expectedFileObjects.length);

  });

  it('should not tamper with dirty or pristine flags of his parent form', function () {
    var d = _compile({
      attrs: [
        {attr: 'ng-model', val: 'files'}
      ]
    });

    expect(d.$scope.form.$dirty).toBe(false);
    expect(d.$scope.form.$pristine).toBe(true);
  });

  it('should clear input after each selection', function () {

    var event = new Event();

    var directive = _compile({attrs: [{attr: 'ng-model', val: 'file'}, {attr: 'allow-same-file', val: true}]});

    spy = spyOn(directive.$input.isolateScope(), '_clearInput').andCallThrough();
    directive.$input.triggerHandler(event);
    $ROOTSCOPE.$apply();
    expect(spy).toHaveBeenCalled();
  });

});

