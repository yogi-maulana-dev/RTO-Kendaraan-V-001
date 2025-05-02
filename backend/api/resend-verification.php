<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Max-Age: 86400");
    exit(0);
}

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require_once 'db.php';

// Verifikasi koneksi database
if (!isset($conn) || $conn->connect_error) {
    http_response_code(500);
    die(json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . ($conn->connect_error ?? 'Unknown error')
    ]));
}

$response = ['success' => false, 'message' => ''];

try {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON format");
    }

    // Validasi input
    if (empty($data['email'])) {
        throw new Exception("Email harus diisi");
    }

    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Format email tidak valid");
    }

    // Periksa apakah pengguna ada dan belum diverifikasi
    $checkUser = $conn->prepare("SELECT * FROM users WHERE email = ?");
    
    if (!$checkUser) {
        throw new Exception("Database error: " . $conn->error);
    }
    
    $checkUser->bind_param("s", $data['email']);
    $checkUser->execute();
    $result = $checkUser->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception("Email tidak terdaftar");
    }
    
    $userData = $result->fetch_assoc();
    
    if ($userData['is_verified'] == 1) {
        throw new Exception("Akun sudah diverifikasi sebelumnya");
    }
    
    $checkUser->close();

    // Buat token verifikasi baru
    $token = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));
    
    // Transaction start
    $conn->begin_transaction();

    try {
        // Update atau tambahkan token verifikasi
        $insertToken = $conn->prepare("
            INSERT INTO email_verification (
                email, 
                token, 
                expires_at
            ) VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE
                token = VALUES(token),
                expires_at = VALUES(expires_at)
        ");
        
        if (!$insertToken) {
            throw new Exception("Database error: " . $conn->error);
        }
        
        $insertToken->bind_param("sss", $data['email'], $token, $expiresAt);
        
        if (!$insertToken->execute()) {
            throw new Exception("Gagal menyimpan token: " . $insertToken->error);
        }
        
        $insertToken->close();

        $conn->commit();

        // Email sending logic
        $to = $data['email'];
        $subject = 'Kode Verifikasi Baru';
        $message = "Kode verifikasi baru Anda: $token\nKode kadaluarsa dalam 1 jam";
        $headers = 'From: no-reply@example.com' . "\r\n" .
                   'X-Mailer: PHP/' . phpversion();

        // Kirim email kalau fungsi mail bisa digunakan
        if (function_exists('mail') && mail($to, $subject, $message, $headers)) {
            $mailStatus = "Email verifikasi baru telah dikirim";
        } else {
            error_log("Gagal mengirim email ke: $to");
            $mailStatus = "Email verifikasi tidak dapat dikirim, silakan hubungi admin";
        }

        $response = [
            'success' => true,
            'message' => 'Kode verifikasi baru telah dikirim ke email Anda'
        ];

    } catch (Exception $e) {
        $conn->rollback();
        throw $e;
    }
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
    http_response_code(400);
} finally {
    echo json_encode($response);
    if (isset($conn) && !$conn->connect_error) {
        $conn->close();
    }
}
?>