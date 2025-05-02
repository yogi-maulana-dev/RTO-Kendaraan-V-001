<?php

// backend/api/resend-token.php

// Menambahkan autoload PHPMailer jika menggunakan Composer
require 'vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

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

    if (empty($data['email'])) {
        throw new Exception("Email harus diisi");
    }

    // Validasi format email
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Format email tidak valid");
    }

    // Cek apakah email ada di database
    $stmt = $koneksi->prepare("SELECT email FROM admins WHERE email = ?");
    $stmt->bind_param("s", $data['email']);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception("Email tidak terdaftar");
    }

    // Buat token baru
    $newToken = rand(100000, 999999); // 6 digit token
    $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour')); // Token berlaku 1 jam

    // Update token dan waktu kadaluarsa yang baru ke database
    $stmt = $koneksi->prepare("UPDATE email_verification SET token = ?, expires_at = ? WHERE email = ?");
    $stmt->bind_param("sss", $newToken, $expiresAt, $data['email']);

    if (!$stmt->execute()) {
        throw new Exception("Gagal memperbarui token: " . $koneksi->error);
    }

    // Kirim email dengan token baru menggunakan PHPMailer
    try {
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host       = 'mail.uml.ac.id';  // Sesuaikan dengan host SMTP server Anda
        $mail->SMTPAuth   = true;
        $mail->Username   = 'admin@uml.ac.id';  // Ganti dengan username SMTP Anda
        $mail->Password   = '@IT2U0m2l31234';  // Ganti dengan password SMTP Anda
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        // Pengaturan pengirim dan penerima email
        $mail->setFrom('admin@uml.ac.id', 'Admin UML');
        $mail->addAddress($data['email']);
        $mail->Subject = 'Verifikasi Email Anda';
        $mail->Body    = "Kode verifikasi Anda: $newToken\nKode kadaluarsa dalam 1 jam.";

        // Kirim email
        $mail->send();
        $mailStatus = "Email verifikasi telah dikirim";
    } catch (Exception $e) {
        error_log("Mailer Error: {$mail->ErrorInfo}");
        $mailStatus = "Email verifikasi gagal dikirim: {$mail->ErrorInfo}";
    }

    // Response sukses
    $response = [
        'success' => true,
        'message' => 'Token baru telah dikirim ke email Anda'
    ];

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
