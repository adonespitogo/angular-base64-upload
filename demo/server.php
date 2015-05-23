<?php

class Base64File
{

  public $base64 = '';
  public $filename = '';

  private $folder = 'uploads';

  function __construct($attrs)
  {
    $this->base64 = $attrs['base64'];
    $this->filename = $this->folder.'/'.$attrs['filename'];
    $this->decodeBase64File();
    return $this;
  }

  function decodeBase64File() {
      $ifp = fopen($this->filename, 'w');
      fwrite( $ifp, base64_decode( $this->base64) );
      fclose($ifp);
      return $ifp;
  }

}

//parse request payload
$postdata = file_get_contents("php://input");
$request = json_decode($postdata, true);
//end parse

$file = new Base64File($request);
echo $file->filename;

?>