describe('angular-base64-upload', function(){

  var template = "<input type='file' ng-model='yourModel' base-sixty-four-input on-change='onChangeHandler'>";
  var $compile;
  var $rootScope;
  var $scope;
  var provide;
  var $window;
  var elem;
  var input;
  var compiled;

  var onChangeHandler;

  function FileReaderMock() {
    var self = this;
    self.readAsArrayBuffer = function (file) {
      self.onload({
        target: {
          result: null
        }
      });
    };
    return self;
  };

  var fileMock = {
    type: 'image/jpeg',
    name: 'this-is-an-image-name.jpg',
    size: 343434,
  };

  var filesMock = [];

  for (var i = 10; i >= 0; i--) {
    filesMock[i] = fileMock;
  };

  var eventMock = {
    type: 'change',
    target: {
      files: filesMock
    }
  };

  beforeEach(function(){
    module('naif.base64');

    $window = {
      _arrayBufferToBase64: function (file) {
        return 'base64-mock-string';
      },
      FileReader: FileReaderMock
    };

    module(function ($provide) {
      $provide.value('$window', $window);
    });

    inject(function($injector){

      $compile = $injector.get('$compile');
      $rootScope = $injector.get('$rootScope');
      $scope = $rootScope.$new();
      elem = angular.element(template);
      compiled = $compile(elem)($scope);
      $scope.$digest();
    });

  });

  afterEach(function() {
    $scope.$destroy();
  });

  it('should should trigger on-change handler', function(){

    eventMock.target.files = [fileMock];
    $scope.onChangeHandler = function (e, fileList) {
      expect(e.target.files).toBe(fileList);
      expect(fileList).toBe(eventMock.target.files);
    };

    elem.triggerHandler(eventMock);
  });

});
