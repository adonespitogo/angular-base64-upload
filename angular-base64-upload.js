angular.module('naif.base64', [])
.directive('baseSixtyFourInput', function () {
  return {
    restrict: 'A',
    scope: {
      model: '=ngFile'
    },
    link: function (scope, elem, attrs) {

      scope.model = scope.model || {}

      scope.readerOnload = function(e){
        var base64 = btoa(e.target.result);
        scope.model.base64 = base64;
        scope.$apply()
      }

      var reader = new FileReader();
      reader.onload = scope.readerOnload

      elem.on('change', function() {
        var file = elem[0].files[0];
        scope.model.fileType = file.type;
        scope.model.fileName = file.name;
        // converts file to binary string
        reader.readAsBinaryString(file);
      });
    }
  }
});