describe('angular-base64-upload', function(){

  beforeEach(function () {



    fileMock = {
      type: 'image/jpeg',
      name: 'this-is-an-image-name.jpg',
      size: 343434,
    };

    filesMock = [];

    for (var i = 10; i >= 0; i--) {
      filesMock[i] = fileMock;
    }

    eventMock = {
      type: 'change',
      target: {
        files: filesMock
      }
    };

  });

  beforeEach(function(){
    module('naif.base64');

    module(function ($provide) {
      $provide.value('$window', $window);
    });

    inject(function($injector){
      $compile = $injector.get('$compile');
      $rootScope = $injector.get('$rootScope');
    });

  });

  afterEach(function() {
    $scope.$destroy();
  });

  it('should trigger on-change handler', function () {

    compileTemplate();

    eventMock.target.files = [fileMock];
    $scope.onChangeHandler = function (e, fileList) {
      expect(e.target.files).toBe(fileList);
      expect(fileList).toBe(eventMock.target.files);
    };

    elem.triggerHandler(eventMock);
  });

  it('should trigger onload handler on single file selection', function () {

    compileTemplate({event: 'onload', handler: 'onloadHandler'});
    eventMock.target.files = [fileMock];

    var expectedFileObject = {
      filename: fileMock.name,
      filetype: fileMock.type,
      filesize: fileMock.size,
      base64: $window._arrayBufferToBase64()
    };
    var expectedFileObjects = [expectedFileObject];
    var expectedFileList = eventMock.target.files;

    $scope.onloadHandler = function (e, reader, file, fileList, fileObjects, fileObject) {
      expect(e.target.result).toBe(new FileReaderMock().result);
      expect(typeof reader.onload).toBe('function');
      expect(file).toEqual(fileMock);
      expect(fileList).toEqual(expectedFileList);
      expect(fileObjects).toEqual(expectedFileObjects);
      expect(fileObject).toEqual(expectedFileObject);
    };

    elem.triggerHandler(eventMock);

  });

  it('should support multi-select input', function () {

    compileTemplate({ngModel: 'files', multiple: true});

    var expectedFileObject = {
      filename: fileMock.name,
      filetype: fileMock.type,
      filesize: fileMock.size,
      base64: $window._arrayBufferToBase64()
    };
    var expectedFileList = eventMock.target.files;
    var expectedFileObjects = _.map(expectedFileList, function () {
      return expectedFileObject;
    });

    elem.triggerHandler(eventMock);

    console.log('$scope.files');
    expect($scope.files).toEqual(expectedFileObjects);
    // expect(typeof $scope.files).toBe('array');

  });

});
