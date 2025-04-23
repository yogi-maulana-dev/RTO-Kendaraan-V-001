<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

require 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

// Validasi input
if (!isset($data['email']) || !isset($data['token'])) {
    echo json_encode(['success' => false, 'message' => 'Data tidak lengkap']);
    exit();
}

$email = $koneksi->real_escape_string($data['email']);
$token = $koneksi->real_escape_string($data['token']);

// Cek token di database
$stmt = $koneksi->prepare("
    SELECT * FROM password_reset 
    WHERE email = ? 
    AND token = ? 
    AND expires_at > NOW()
");
$stmt->bind_param("ss", $email, $token);
$stmt->execute();
$result = $stmt->get_result();

echo json_encode(['success' => $result->num_rows > 0]);
?>