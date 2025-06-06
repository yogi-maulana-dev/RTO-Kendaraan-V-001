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

// Include koneksi database
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
$stmt = $koneksi->prepare("SELECT admin_id, password, is_verified FROM admins WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Email tidak ditemukan"]);
    exit();
}

$user = $result->fetch_assoc();

// Verifikasi password dengan password yang di-hash
if (!password_verify($password, $user['password'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Password salah"]);
    exit();
}

// Cek apakah pengguna sudah terverifikasi
if ($user['is_verified'] == 0) {
    // Cek token verifikasi di tabel email_verification
    $verification_stmt = $koneksi->prepare("SELECT token, expires_at FROM email_verification WHERE email = ?");
    $verification_stmt->bind_param("s", $email);
    $verification_stmt->execute();
    $verification_result = $verification_stmt->get_result();

    if ($verification_result->num_rows === 0) {
        // Token verifikasi tidak ditemukan
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Email belum terverifikasi. Silakan periksa email Anda untuk token verifikasi."]);
        exit();
    }

    $verification_data = $verification_result->fetch_assoc();

    // Periksa apakah token sudah kedaluwarsa
    $current_time = new DateTime();
    $expires_at = new DateTime($verification_data['expires_at']);

    if ($current_time > $expires_at) {
        // Token sudah kedaluwarsa
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Token verifikasi sudah kedaluwarsa. Silakan minta token baru."]);
        exit();
    }

    // Token masih valid, kirimkan respons yang memerlukan verifikasi
    echo json_encode([
        "success" => false,
        "message" => "Email perlu diverifikasi.",
        "need_verification" => true, // Indikasi bahwa verifikasi diperlukan
        "admin_id" => $user['admin_id'] // Kirimkan admin_id untuk proses verifikasi lebih lanjut
    ]);
    exit();
}

// Jika email terverifikasi, lanjutkan ke proses login
$token = bin2hex(random_bytes(32));
$update_stmt = $koneksi->prepare("UPDATE admins SET token = ? WHERE admin_id = ?");
$update_stmt->bind_param("si", $token, $user['admin_id']);

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

?>
