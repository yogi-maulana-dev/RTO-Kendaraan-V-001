<?php
// backend/api/auth.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// // Perbaiki path include
// include_once __DIR__ . '/db.php'; // pastikan file ini mendefinisikan $koneksi

include_once __DIR__ . '/../server/db.php';

// Cek apakah $koneksi sudah tersedia
if (!isset($koneksi) || !$koneksi) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit();
}

// Ambil dan validasi input
$data = json_decode(file_get_contents("php://input"));

if (empty($data->email) || empty($data->password)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Email dan password harus diisi"]);
    exit();
}

$email = $data->email;
$password = $data->password;

// Proses login
$stmt = $koneksi->prepare("SELECT user_id, password FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Email tidak ditemukan"]);
    exit();
}

$user = $result->fetch_assoc();

if (!password_verify($password, $user['password'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Password salah"]);
    exit();
}

$token = bin2hex(random_bytes(32));
$update_stmt = $koneksi->prepare("UPDATE users SET token = ? WHERE user_id = ?");
$update_stmt->bind_param("si", $token, $user['user_id']);

if (!$update_stmt->execute()) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Gagal menyimpan token"]);
    exit();
}

echo json_encode([
    "success" => true,
    "token" => $token,
    "message" => "Login berhasil"
]);
