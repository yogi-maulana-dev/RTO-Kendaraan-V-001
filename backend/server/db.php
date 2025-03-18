<?php
$namaserver="localhost";
$username="root";
$password="yrka1234";
$database="rtoap";

$koneksi =new mysqli($namaserver,$username,$password,$database);

if($koneksi->connect_error){
    die("Koneksi gagal:".$koneksi->connect_error);
}
?>