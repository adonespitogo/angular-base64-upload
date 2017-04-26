// contains mock objects/properties/functions used in testing

function File(opts) {
  opts = opts || {};
  this.name = opts.name || 'filename.txt';
  this.type = opts.type || 'image/jpeg';
  this.size = opts.size || (500 * 1000); //500kb
}

function FileList(num_files) {
  num_files = num_files || 5;
  var list = [];
  for (var i = 0; i < num_files; i++) {
    list.push(new File());
  }
  return list;
}

function FileObject(file) {
  file = file || new File();
  this.filename = file.name;
  this.filetype = file.type;
  this.filesize = file.size;
  this.base64 = $windowMock._arrayBufferToBase64();
}

function FileObjects(num) {
  num = num || 5;
  var objs = [];
  for (var i = num - 1; i >= 0; i--) {
    objs.push(new FileObject());
  }
  return objs;
}

function Event(opts) {
  opts = opts || {};
  this.type = opts.type || 'change';
  this.target = opts.target || {};
  this.target.files = opts.files || new FileList();
}

function FileReaderMock() {
  var self = this;


  self.triggerEvent = function(eventName) {
    var event = new Event();
    if (typeof self[eventName] === 'function') {
      event.target = self;
      event.type = eventName;
      self[eventName](event);
    }
  };

  self.readAsArrayBuffer = function(file) {

    self.file = file;

    if (FileReaderMock.autoTriggerEvents) {
      for (var i = FILE_READER_EVENTS.length - 1; i >= 0; i--) {
        var e = FILE_READER_EVENTS[i];
        self.triggerEvent(e);
      }
    } else {
      self.result = 'reader-result-buffer';
      self.triggerEvent('onload');
    }

  };

  self.abort = function() {
    self.triggerEvent('onabort');
  };
  return self;
}

FileReaderMock.autoTriggerEvents = false;

$windowMock = {
  document: window.document,
  _arrayBufferToBase64: function() {
    return 'base64-mock-string';
  },
  FileReader: FileReaderMock
};
