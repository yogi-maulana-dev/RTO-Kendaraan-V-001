<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Methods: POST, GET, DELETE, PUT, OPTIONS");
    header("HTTP/1.1 200 OK");
    exit();
} else {
    header("Access-Control-Allow-Methods: POST, GET, DELETE, PUT");
    header("Content-Type: application/json");
}

require 'db.php'; // Sesuaikan dengan koneksi database

// Get raw input data
$input = file_get_contents("php://input");

require 'vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// ============================== //
// 3. MAIN LOGIC
// ============================== //
try {
    // Ambil dan validasi input
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON format");
    }

    if (!isset($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email tidak valid']);
        exit();
    }

    $email = $koneksi->real_escape_string($data['email']);

    // Cek keberadaan email
    $stmt = $koneksi->prepare("SELECT user_id FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        // Generate token
        $token = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $expires_at = date('Y-m-d H:i:s', strtotime('+15 minutes'));
        
        // Simpan token ke database (gunakan prepared statement)
        $stmt = $koneksi->prepare("
            INSERT INTO password_reset (email, token, expires_at)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE
                token = VALUES(token),
                expires_at = VALUES(expires_at)
        ");
        $stmt->bind_param("sss", $email, $token, $expires_at);
        $stmt->execute();

        // Kirim email
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host       = 'mail.uml.ac.id';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'admin@uml.ac.id';
        $mail->Password   = '@IT2U0m2l31234';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;  // Port umum untuk STARTTLS
        
        $mail->setFrom('yogimaulana@yourdomain.com', 'Password Reset');
        $mail->addAddress($email);
        $mail->Subject = 'Reset Password Token';
        $mail->Body    = "Kode reset password Anda: $token\nBerlaku hingga: $expires_at";
        
        $mail->send();
    }

    // Respons aman untuk prevent email enumeration
    echo json_encode([
        'success' => true,
        'message' => 'Jika email terdaftar, instruksi reset akan dikirim'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()
    ]);
    
} finally {
    // Pastikan koneksi database ditutup
    if (isset($koneksi)) {
        $koneksi->close();
    }
    ob_end_flush();  // Kirim semua output
}