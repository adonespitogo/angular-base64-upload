<?php

$dir = dirname(__FILE__);

$files = scandir($dir);

foreach ($files as $file) {
  if($file{0} != '.' && $file != 'index.php') {
    echo "<a href='uploads/$file'>$file</a><br>";
  }
}

