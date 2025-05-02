<?php
// backend/api/sim-list.php


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


try {
    $sql = "SELECT 
            sim_id,
            nomor_sim,
            jenis_sim,
            DATE_FORMAT(tanggal_terbit, '%d-%m-%Y') as tanggal_terbit,
            DATE_FORMAT(tanggal_expired, '%d-%m-%Y') as tanggal_expired,
            status_sim
            FROM sim";

    $result = $koneksi->query($sql);
    
    if (!$result) {
        throw new Exception("Error dalam query: " . $koneksi->error);
    }

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode($data);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
} finally {
    if (isset($koneksi)) {
        $koneksi->close();
    }
}
?>