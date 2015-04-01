
describe('angular-base64-upload', function(){

  var template = "<input type='file' ng-model='yourModel' base-sixty-four-input>";

  beforeEach(function(){
    module('naif.base64');
    inject(function($injector){

      this.compile = $injector.get('$compile');
      this.rootScope = $injector.get('$rootScope');
      this.scope = this.rootScope.$new();
      this.elem = angular.element(template);
      this.input = this.compile(this.elem)(this.scope);
      this.scope.$digest();
    });

  });

  afterEach(function() {
    this.scope.$destroy();
  });

  it('should be true', function(){
    expect(this.compile).toBeDefined();
  });

});
