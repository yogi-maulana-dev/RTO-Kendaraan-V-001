<?php
error_reporting(0); // ❌ Matikan error reporting ke output
ini_set('log_errors', 1); // ✅ Catat error di log file
ini_set('error_log', __DIR__ . '/php_errors.log'); // Lokasi log

// Hapus semua output buffer sebelum memulai
if (ob_get_length()) ob_clean();

// Tangani OPTIONS request untuk CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    http_response_code(200);
    exit();
}

// Header untuk response
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once(__DIR__ . "/db.php");

// Ambil data JSON
$rawData = file_get_contents("php://input");
$data = json_decode($rawData, true);

if ($data === null) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Data JSON tidak valid."
    ]);
    exit();
}

// Validasi field
$requiredFields = ['nama_lengkap', 'alamat', 'no_telepon', 'email', 'password'];
$errors = [];

foreach ($requiredFields as $field) {
    if (!isset($data[$field]) || empty(trim($data[$field]))) {
        $errors[$field] = ucfirst(str_replace('_', ' ', $field)) . " harus diisi.";
    }
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode([
        "success" => false,
        "message" => "Validasi gagal.",
        "errors" => $errors
    ]);
    exit();
}

// Cek koneksi database
if (!$koneksi || $koneksi->connect_error) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Koneksi database gagal: " . ($koneksi ? $koneksi->connect_error : "Tidak ada koneksi")
    ]);
    exit();
}

// Query INSERT
$query = "INSERT INTO users 
    (nama_lengkap, alamat, no_telepon, email, password, tanggal_daftar) 
    VALUES (?, ?, ?, ?, ?, NOW())";

$proses = $koneksi->prepare($query);

if (!$proses) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error prepare statement: " . $koneksi->error
    ]);
    exit();
}

// Binding parameter
$proses->bind_param(
    "sssss",
    $data['nama_lengkap'],
    $data['alamat'],
    $data['no_telepon'],
    $data['email'],
    password_hash($data['password'], PASSWORD_BCRYPT)
);

if ($proses->execute()) {
    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "Data berhasil ditambahkan."
    ]);
} else {    
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Gagal menambahkan data: " . $proses->error
    ]);
}

$koneksi->close();
?>