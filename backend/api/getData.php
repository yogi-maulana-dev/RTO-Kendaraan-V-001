<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once "../server/db.php";

if($koneksi->connect_error){
    echo json_encode([
        "status"=>"error",
        "message"=>"Database koneksi gagal".$koneksi->connect_error
        ]);
        exit();
}

$sql = "SELECT user_id,nama_lengkap,alamat, no_telepon,email,password, tanggal_daftar FROM users";
$hasil =$koneksi->query($sql); //masalah vaiabel

if(!$hasil){
    echo json_encode([
        "status" => "error",
        "message"=>"Queri Gagal: ". $koneksi->error
    ]);

    $koneksi->close();
    exit();
}

$data =[];
while($baris=$hasil->fetch_assoc()){
    $data[]=$baris;
}

$koneksi->close();

echo json_encode([
    "status"=> "success",
    "data"=>$data
]);

?>