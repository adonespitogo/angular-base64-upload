describe('Clear input', function() {

  var event, scope, directive, spy;

  beforeEach(function() {

    module('naif.base64');

    module(function($provide) {
      $provide.value('$window', $windowMock);
    });

    inject(function($injector) {

      $INJECTOR = $injector;
      $COMPILE = $injector.get('$compile');
      $ROOTSCOPE = $injector.get('$rootScope');

    });

  });

  beforeEach(function() {
    event = new Event();
    scope = $ROOTSCOPE.$new();
    directive = _compile({
      attrs: [{
        attr: 'ng-model',
        val: 'file'
      }, {
        attr: 'name',
        val: 'myinput'
      }, {
        attr: 'maxsize',
        val: 1
      }, {
        attr: 'required',
        val: 'required'
      }, ]
    });
    directive.$input.triggerHandler(event);
    $ROOTSCOPE.$apply();
    spy = spyOn(directive.$input.isolateScope(), '_clearInput').andCallThrough();
  });

  beforeEach(function() {
    expect(directive.$scope.file).toBeTruthy();
    expect(directive.$scope.form.myinput.$error.maxsize).toBeTruthy()
    expect(directive.$scope.form.myinput.$error.required).toBeFalsy()
  })

  describe('Dont select any file', function() {

    beforeEach(function() {
      event = new Event({
        files: [] //no file selected files
      });
      directive.$input.triggerHandler(event);
      $ROOTSCOPE.$apply();
    })

    it('should clear the model', function() {
      expect(directive.$scope.file).toBeFalsy();
    })

    it('should clear validation errors', function() {
      expect(directive.$scope.form.myinput.$error.maxsize).toBeFalsy()
      expect(directive.$scope.form.myinput.$error.required).toBeTruthy()
      expect(directive.$scope.form.myinput.$dirty).toBeTruthy()
    })

  })


  describe('Assign empty value', function() {

    it('should clear input when $viewValue is null', function() {
      directive.$scope.file = null;
      $ROOTSCOPE.$apply();
      expect(spy).toHaveBeenCalled();
    });

    it('should clear input when $viewValue is empty object', function() {
      directive.$scope.file = {};
      $ROOTSCOPE.$apply();
      expect(spy).toHaveBeenCalled();
    });

    it('should clear input when $viewValue is empty array', function() {
      directive.$scope.file = [];
      $ROOTSCOPE.$apply();
      expect(spy).toHaveBeenCalled();
    });

    it('should clear validation errors', function() {
      directive.$scope.file = null
      $ROOTSCOPE.$apply();
      expect(directive.$scope.form.myinput.$error.maxsize).toBeFalsy()
      expect(directive.$scope.form.myinput.$error.required).toBeTruthy()
      expect(directive.$scope.form.myinput.$dirty).toBeTruthy()
    })
  })

});
