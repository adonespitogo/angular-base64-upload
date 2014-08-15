<?php

class Base64File
{

  private $base_64 = '';
  private $file_name = '';

  function __construct($base64_string)
  {
    $this->base_64 = $base64_string;
    return $this;
  }

  function setFileName($file_name){
    $this->file_name = $file_name;
    return $this;
  }

  function decode_base_64_file( $base64_string ) {
      $ifp = fopen( $this->file_name, "wb" );
      fwrite( $ifp, base64_decode( $base64_string) );
      fclose( $ifp );
      return $this;
  }

  function getFileName(){
    return $this->file_name;
  }

}
echo json_encode($_POST);
if ($_POST['user']['image']) {
  echo "asfdsaf";
  // $file = new Base64File($_POST['image']['base64']).setFileName($_POST['image']['fileName'])
}

?>