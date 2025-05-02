<?php

date_default_timezone_set('Asia/Jakarta');


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

// Load DB
include_once __DIR__ . '/../server/db.php';

// Load PHPMailer
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
require 'vendor/autoload.php';



$response = ['success' => false, 'message' => ''];

// Cek koneksi DB
if (!isset($koneksi) || $koneksi->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $koneksi->connect_error]);
    exit();
}

try {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON format");
    }

    // Hapus 'action' kalau ada
    if (isset($data['action'])) {
        unset($data['action']);
    }

    // Validasi
    $requiredFields = ['nama_lengkap', 'alamat', 'no_telepon', 'email', 'password'];
    foreach ($requiredFields as $field) {
        if (empty($data[$field])) {
            throw new Exception("Field $field harus diisi");
        }
    }

    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Format email tidak valid");
    }

    if (strlen($data['email']) > 255) {
        throw new Exception("Email maksimal 255 karakter");
    }

    if (!preg_match('/^[0-9]{10,20}$/', $data['no_telepon'])) {
        throw new Exception("Nomor telepon 10-20 digit angka");
    }

    // Cek apakah email/no_telepon sudah terdaftar
    $checkQuery = $koneksi->prepare("SELECT email, no_telepon FROM admins WHERE email = ? OR no_telepon = ?");
    if (!$checkQuery) {
        throw new Exception("Database error: " . $koneksi->error);
    }
    $checkQuery->bind_param("ss", $data['email'], $data['no_telepon']);
    $checkQuery->execute();
    $result = $checkQuery->get_result();

    if ($result->num_rows > 0) {
        $existing = $result->fetch_assoc();
        $conflict = [];
        if ($existing['email'] === $data['email']) $conflict[] = 'email';
        if ($existing['no_telepon'] === $data['no_telepon']) $conflict[] = 'nomor telepon';
        throw new Exception("Data sudah terdaftar: " . implode(', ', $conflict));
    }

    $koneksi->begin_transaction();

    try {
        // Hash password
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);

        // Insert user
        $insertUser = $koneksi->prepare("
            INSERT INTO admins (
                nama_lengkap, alamat, no_telepon, email, password, tanggal_daftar, is_verified
            ) VALUES (?, ?, ?, ?, ?, CURDATE(), 0)
        ");
        if (!$insertUser) {
            throw new Exception("Database error: " . $koneksi->error);
        }
        $insertUser->bind_param(
            "sssss",
            $data['nama_lengkap'],
            $data['alamat'],
            $data['no_telepon'],
            $data['email'],
            $hashedPassword
        );
        if (!$insertUser->execute()) {
            throw new Exception("Gagal menyimpan user: " . $insertUser->error);
        }
        $userId = $insertUser->insert_id;
        $insertUser->close();

        // Buat token verifikasi
        $token = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));

        $insertToken = $koneksi->prepare("
            INSERT INTO email_verification (email, token, expires_at)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at)
        ");
        if (!$insertToken) {
            throw new Exception("Database error: " . $koneksi->error);
        }
        $insertToken->bind_param("sss", $data['email'], $token, $expiresAt);
        if (!$insertToken->execute()) {
            throw new Exception("Gagal menyimpan token: " . $insertToken->error);
        }
        $insertToken->close();

        $koneksi->commit();

        // Kirim email verifikasi
        try {
            $mail = new PHPMailer(true);
            $mail->isSMTP();
            $mail->Host       = 'mail.uml.ac.id';
            $mail->SMTPAuth   = true;
            $mail->Username   = 'admin@uml.ac.id';
            $mail->Password   = '@IT2U0m2l31234';
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = 587;

            $mail->setFrom('admin@uml.ac.id', 'Admin UML');
            $mail->addAddress($data['email']);
            $mail->Subject = 'Verifikasi Email Anda';
            $mail->Body    = "Kode verifikasi Anda: $token\nKode kadaluarsa dalam 1 jam.";

            $mail->send();
            $mailStatus = "Email verifikasi telah dikirim";
        } catch (Exception $e) {
            error_log("Mailer Error: {$mail->ErrorInfo}");
            $mailStatus = "Email verifikasi gagal dikirim: {$mail->ErrorInfo}";
        }

        $response = [
            'success' => true,
            'message' => 'Registrasi berhasil! ' . $mailStatus,
            'user_id' => $userId
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
    if (isset($koneksi) && !$koneksi->connect_error) {
        $koneksi->close();
    }
}
?>
