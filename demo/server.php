<?php

class Base64File
{

  private $base64 = '';
  private $fileName = '';

  function __construct($attrs)
  {
    $this->base64 = $attrs['base64'];
    $this->setFileName($attrs['filename']);
    $this->decodeBase64File();
    return $this;
  }

  function setFileName($fileName){
    $this->fileName = $fileName;
    return $this->fileName;
  }

  function decodeBase64File() {
      $ifp = fopen($this->fileName, 'w');
      fwrite( $ifp, base64_decode( $this->base64) );
      fclose($ifp);
      return $ifp;
  }

  function getFileName(){
    return $this->fileName;
  }

}

//parse request payload
$postdata = file_get_contents("php://input");
$request = json_decode($postdata, true);
//end parse

$file = new Base64File($request);
echo $file->getFileName();

?>