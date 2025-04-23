<?php
// Allow CORS
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

if (ob_get_length() === false) ob_start();

require 'db.php';
require 'vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

try {
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

    // Cek apakah email ada
    $stmt = $koneksi->prepare("SELECT user_id FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // Token aman
        $token = bin2hex(random_bytes(16));
        $expires_at = date('Y-m-d H:i:s', strtotime('+15 minutes'));

        // Simpan token ke DB
        $stmt = $koneksi->prepare("
            INSERT INTO password_reset (email, token, expires_at)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE
                token = VALUES(token),
                expires_at = VALUES(expires_at)
        ");
        $stmt->bind_param("sss", $email, $token, $expires_at);
        $stmt->execute();

        // Kirim Email
        $appUrl = rtrim(getenv('APP_URL'), '/');
        $mail = new PHPMailer(true);

        try {
            $mail->isSMTP();
            $mail->Host       = 'mail.uml.ac.id';
            $mail->SMTPAuth   = true;
            $mail->Username   = getenv('SMTP_USER'); // Ganti di .env atau server env
            $mail->Password   = getenv('SMTP_PASS');
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = 587;

            $mail->setFrom('yogimaulana@yourdomain.com', 'Password Reset');
            $mail->addAddress($email);
            $mail->isHTML(true);
            $mail->Subject = 'Reset Password Token';

           $resetLink = "$appUrl/api/reset-password?email=" . urlencode($email) . "&token=" . urlencode($token);

            $mail->Body = "
                <p>Klik link berikut untuk reset password:</p>
                <a href='" . htmlspecialchars($resetLink, ENT_QUOTES) . "'>$resetLink</a>
                <p>Atau masukkan kode ini: <strong>$token</strong></p>
                <p>Berlaku hingga: $expires_at</p>
            ";

            $mail->send();
        } catch (Exception $e) {
            throw new Exception("Gagal mengirim email: " . $mail->ErrorInfo);
        }
    }

    // Jangan bocorkan apakah email valid atau tidak
    echo json_encode([
        'success' => true,
        'message' => 'Jika email terdaftar, instruksi reset akan dikirim'
    ]);
    exit();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()
    ]);
    exit();
} finally {
    if (isset($koneksi)) {
        $koneksi->close();
    }
    ob_end_flush();
}
