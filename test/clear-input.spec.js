describe('Clear input', function () {

  var event, scope, directive, spy;

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
      scope = $ROOTSCOPE.$new();
      directive = _compile({
        attrs: [
          {attr: 'ng-model', val: 'file'}
        ]
      });
      directive.$input.triggerHandler(event);
      $ROOTSCOPE.$apply();
      spy = spyOn(directive.$input.isolateScope(), '_clearInput').andCallThrough();
      expect(directive.$scope.file).toBeTruthy();

    });

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