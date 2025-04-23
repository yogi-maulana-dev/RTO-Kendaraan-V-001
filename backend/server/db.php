<?php
$servername = "localhost";
$username = "root"; // Ganti dengan username database Anda
$password = "yrka1234"; // Ganti dengan password database Anda
$dbname = "rtoap"; // Ganti dengan nama database Anda

// Buat koneksi
$koneksi = new mysqli($servername, $username, $password, $dbname);

// Cek koneksi
if ($koneksi->connect_error) {
    die("Connection failed: " . $koneksi->connect_error);
}
?>