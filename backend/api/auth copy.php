<?php
// backend/api/auth.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle OPTIONS request for preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Di masalah di deroktory
include_once __DIR__ . '/../server/db.php';

// Ambil data dari request
$data = json_decode(file_get_contents("php://input"));

// Validasi input
if(empty($data->email) || empty($data->password)) {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "email dan password harus diisi"
    ));
    exit();
}

$email = $data->email;
$password = $data->password;

// Cari user di database
$stmt = $koneksi->prepare("SELECT user_id, password FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if($result->num_rows === 0) {
    http_response_code(401);
    echo json_encode(array(
        "success" => false,
        "message" => "email tidak ditemukan"
    ));
    exit();
}

$user = $result->fetch_assoc();

// Verifikasi password
if(!password_verify($password, $user['password'])) {
    http_response_code(401);
    echo json_encode(array(
        "success" => false,
        "message" => "Password salah"
    ));
    exit();
}

// Generate token
$token = bin2hex(random_bytes(32));

// Update token ke database
$update_stmt = $conn->prepare("UPDATE users SET token = ? WHERE user_id = ?");
$update_stmt->bind_param("si", $token, $user['user_id']);

if(!$update_stmt->execute()) {
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "Gagal membuat token"
    ));
    exit();
}

// Response sukses
http_response_code(200);
echo json_encode(array(
    "success" => true,
    "token" => $token,
    "message" => "Login berhasil"
));