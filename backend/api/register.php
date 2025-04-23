<?php
// backend/api/register.php

// Header untuk CORS dan JSON response
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once 'db.php';

// Ambil data dari input
$data = json_decode(file_get_contents("php://input"));

// Validasi input JSON
if (!$data || !isset($data->email) || !isset($data->password)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Data input tidak valid"
    ]);
    exit();
}

$email = trim($data->email);
$password = trim($data->password);

// Validasi input
$errors = [];

// Validasi email
if (empty($email)) {
    $errors[] = "Email harus diisi";
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = "Format email tidak valid";
}

// Validasi password
if (empty($password)) {
    $errors[] = "Password harus diisi";
} elseif (strlen($password) < 8) {
    $errors[] = "Password minimal 8 karakter";
} elseif (!preg_match('/[A-Z]/', $password)) {
    $errors[] = "Password harus mengandung minimal 1 huruf kapital";
} elseif (!preg_match('/[0-9]/', $password)) {
    $errors[] = "Password harus mengandung minimal 1 angka";
}

// Jika ada error, tampilkan response
if (!empty($errors)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Validasi gagal",
        "errors" => $errors
    ]);
    exit();
}

// Cek apakah email sudah terdaftar
$check_stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$check_stmt->bind_param("s", $email);
$check_stmt->execute();
$check_stmt->store_result();

if ($check_stmt->num_rows > 0) {
    http_response_code(409);
    echo json_encode([
        "success" => false,
        "message" => "Email sudah digunakan"
    ]);
    exit();
}

// Generate password hash
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// Insert ke database dengan prepared statement
$insert_stmt = $conn->prepare("INSERT INTO users (email, password) VALUES (?, ?)");
$insert_stmt->bind_param("ss", $email, $hashed_password);

if ($insert_stmt->execute()) {
    // Dapatkan data user yang baru dibuat
    $new_user_id = $insert_stmt->insert_id;
    $get_user_stmt = $conn->prepare("SELECT id, email FROM users WHERE id = ?");
    $get_user_stmt->bind_param("i", $new_user_id);
    $get_user_stmt->execute();
    $result = $get_user_stmt->get_result();
    $user = $result->fetch_assoc();
    
    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "Registrasi berhasil",
        "data" => $user
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Terjadi kesalahan sistem",
        "error" => $conn->error
    ]);
}

// Tutup koneksi
$check_stmt->close();
$insert_stmt->close();
$get_user_stmt->close();
$conn->close();
?>