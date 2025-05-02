<?php
// D:\gituhub\backend-rto\rto-1-0-0\backend\api\create-sim.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Perbaikan path absolut
include_once __DIR__ . '/../server/db.php'; // Sesuaikan dengan struktur folder sebenarnya

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Validasi koneksi database
if ($koneksi->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Koneksi database gagal"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

// Validasi input
$required_fields = ['nomor_sim', 'jenis_sim', 'tanggal_terbit', 'tanggal_expired', 'user_id'];

foreach ($required_fields as $field) {
    if (!isset($data->$field)) {
        http_response_code(400);
        echo json_encode(["error" => "Field $field harus diisi"]);
        exit;
    }
}

try {
$stmt = $koneksi->prepare("INSERT INTO sim 
    (nomor_sim, user_id,jenis_sim, tanggal_terbit, tanggal_expired, status_sim)
    VALUES (?,?, ?, ?, ?, 'Aktif')");

$stmt->bind_param("sisss",
    $data->nomor_sim,
    $data->user_id,
    $data->jenis_sim,
    $data->tanggal_terbit,
    $data->tanggal_expired
);

    if (!$stmt->execute()) {
        throw new Exception("Gagal menambahkan data: " . $stmt->error);
    }

    echo json_encode(["message" => "Data SIM berhasil ditambahkan"]);
    
} catch (Exception $e) {
        $errorMessage = $e->getMessage();
    $statusCode = 500;

    // Handle duplicate entry error
    if (strpos($errorMessage, 'Duplicate entry') !== false) {
        preg_match("/Duplicate entry '(.+)' for key/", $errorMessage, $matches);
        $duplicateValue = $matches[1] ?? '';
        $errorMessage = "Nomor SIM $duplicateValue sudah terdaftar";
        $statusCode = 400;
    }

    http_response_code($statusCode);
    echo json_encode(["error" => $errorMessage]); // Pastikan key-nya "error"
    exit;
} finally {
    if ($koneksi) {
        $koneksi->close();
    }
}
?>