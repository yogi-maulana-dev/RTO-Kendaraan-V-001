<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'db.php';

// Ambil input data
$input = file_get_contents("php://input");
$data = json_decode($input, true);

// Validasi JSON
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "JSON tidak valid: " . json_last_error_msg()
    ]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

// Handle metode PUT yang disimulasikan
if ($method === "POST" && isset($_POST["_method"]) && $_POST["_method"] === "PUT") {
    $method = "PUT";
}

if ($method !== 'PUT') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Method tidak diizinkan."
    ]);
    exit();
}

// Validasi field wajib


// idnya salah samakan dnegan nama field di database
$id = intval($data['user_id']);
$nama_lengkap = htmlspecialchars($data['nama_lengkap']);
$alamat = htmlspecialchars($data['alamat']);
$no_telepon = htmlspecialchars($data['no_telepon']);
$email = htmlspecialchars($data['email']);
$password = isset($data['password']) ? $data['password'] : null;

// Update data dengan atau tanpa password
if (!empty($password)) {
    $hashed_password = password_hash($password, PASSWORD_BCRYPT);
    $sql = "UPDATE users SET nama_lengkap=?, alamat=?, no_telepon=?, email=?, password=? WHERE user_id=?";
    $stmt = $koneksi->prepare($sql);
    if (!$stmt) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Gagal menyiapkan statement: " . $koneksi->error
        ]);
        exit();
    }
    $stmt->bind_param("sssssi", $nama_lengkap, $alamat, $no_telepon, $email, $hashed_password, $id);
} else {
    $sql = "UPDATE users SET nama_lengkap=?, alamat=?, no_telepon=?, email=? WHERE user_id=?";
    $stmt = $koneksi->prepare($sql);
    if (!$stmt) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Gagal menyiapkan statement: " . $koneksi->error
        ]);
        exit();
    }
    $stmt->bind_param("ssssi", $nama_lengkap, $alamat, $no_telepon, $email, $id);
}

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode([
            "success" => true,
            "message" => "Data berhasil diperbarui."
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Tidak ada perubahan data atau ID tidak ditemukan."
        ]);
    }
} else {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Gagal memperbarui data: " . $stmt->error
    ]);
}

$stmt->close();
$koneksi->close();