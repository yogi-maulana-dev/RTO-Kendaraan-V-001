<?php

// backend/api/verify-token.php

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

// Set timezone Jakarta
date_default_timezone_set('Asia/Jakarta');

// Load DB
include_once __DIR__ . '/../server/db.php';

$response = ['success' => false, 'message' => ''];

try {
    if (!isset($koneksi) || $koneksi->connect_error) {
        throw new Exception("Gagal terhubung ke database: " . $koneksi->connect_error);
    }

    // Ambil data dari request
    $data = json_decode(file_get_contents('php://input'), true);

    // if (empty($data['email'])) {
    //     throw new Exception("Email harus diisi");
    // }

    if (empty($data['token']) || !preg_match('/^\d{6}$/', $data['token'])) {
        throw new Exception("Token harus 6 digit angka");
    }

    $currentDateTime = date('Y-m-d H:i:s');

    // Step 1: Ambil token dari database tanpa cek expires_at dulu
    $stmt = $koneksi->prepare("
        SELECT email, token, expires_at 
        FROM email_verification 
        WHERE email = ? AND token = ?
    ");
    $stmt->bind_param("ss", $data['email'], $data['token']);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception("Email atau Token tidak ditemukan");
    }

    $row = $result->fetch_assoc();

    // Step 2: Cek kadaluarsa secara manual di PHP
    if ($row['expires_at'] <= $currentDateTime) {
        throw new Exception("Token sudah kadaluarsa");
    }

    $stmt->close();

    // Step 3: Mulai transaksi
    $koneksi->begin_transaction();

    try {
        // Update status user menjadi verified
        $updateUser = $koneksi->prepare("
            UPDATE admins 
            SET is_verified = 1 
            WHERE email = ?
        ");
        $updateUser->bind_param("s", $data['email']);

        if (!$updateUser->execute()) {
            throw new Exception("Gagal memverifikasi akun: " . $koneksi->error);
        }

        // Hapus token setelah digunakan
        $deleteToken = $koneksi->prepare("
            DELETE FROM email_verification 
            WHERE email = ?
        ");
        $deleteToken->bind_param("s", $data['email']);

        if (!$deleteToken->execute()) {
            throw new Exception("Gagal menghapus token: " . $koneksi->error);
        }

        $koneksi->commit();

        $response = [
            'success' => true,
            'message' => 'Verifikasi berhasil! Anda sekarang bisa login.',
            'redirect' => '/login'
        ];
    } catch (Exception $e) {
        $koneksi->rollback();
        throw $e;
    }
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
    http_response_code(400);
} finally {
    echo json_encode($response);
    if (isset($koneksi) && $koneksi) {
        $koneksi->close();
    }
}
?>
