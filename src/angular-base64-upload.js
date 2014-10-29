angular.module('naif.base64', [])
.directive('baseSixtyFourInput', function () {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, elem, attrs, ngModel) {
      var fileObject = {};
      scope.readerOnload = function(e){
        var base64 = btoa(e.target.result);
        fileObject.base64 = base64;
        scope.$apply(function(){
          ngModel.$setViewValue(fileObject);
        });
      };

      var reader = new FileReader();
      reader.onload = scope.readerOnload;

      elem.on('change', function() {
        var file = elem[0].files[0];
        fileObject.filetype = file.type;
        fileObject.filename = file.name;
        fileObject.filesize = file.size;
        // converts file to binary string
        reader.readAsBinaryString(file);
      });
    }
  };
});
