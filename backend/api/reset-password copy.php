<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

require 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

// Validasi input
if (!isset($data['email']) || !isset($data['token']) || !isset($data['newPassword'])) {
    echo json_encode(['success' => false, 'message' => 'Data tidak lengkap']);
    exit();
}

$email = $koneksi->real_escape_string($data['email']);
$token = $koneksi->real_escape_string($data['token']);
$newPassword = password_hash($data['newPassword'], PASSWORD_DEFAULT);

// Verifikasi token
$stmt = $koneksi->prepare("
    SELECT * FROM password_reset 
    WHERE email = ? 
    AND token = ? 
    AND expires_at > NOW()
");
$stmt->bind_param("ss", $email, $token);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Token tidak valid']);
    exit();
}

// Update password
$stmt = $koneksi->prepare("UPDATE users SET password = ? WHERE email = ?");
$stmt->bind_param("ss", $newPassword, $email);
$stmt->execute();

// Hapus token
$koneksi->query("DELETE FROM password_reset WHERE email = '$email'");

echo json_encode(['success' => true]);
?>