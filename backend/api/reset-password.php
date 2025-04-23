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

require 'db.php'; // Include database connection

// ============================== //
// MAIN LOGIC
// ============================== //
try {
    // Get and validate input
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON format");
    }

    // Validate token and password
    if (!isset($data['token']) || empty($data['token'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Token tidak valid']);
        exit();
    }

    if (!isset($data['password']) || strlen($data['password']) < 6) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Password harus minimal 6 karakter']);
        exit();
    }

    $token = $koneksi->real_escape_string($data['token']);
    $newPassword = $data['password'];

    // Check if token exists and is valid
    $stmt = $koneksi->prepare("SELECT email, expires_at FROM password_reset WHERE token = ? AND expires_at > NOW()");
    if (!$stmt) {
        throw new Exception("Database error: " . $koneksi->error);
    }
    
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'message' => 'Token tidak valid atau sudah kadaluarsa'
        ]);
        exit();
    }

    // Get email from query result
    $row = $result->fetch_assoc();
    $email = $row['email'];

    // Hash the new password
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

    // Update password in users table
    $updateStmt = $koneksi->prepare("UPDATE users SET password = ? WHERE email = ?");
    if (!$updateStmt) {
        throw new Exception("Database error: " . $koneksi->error);
    }
    
    $updateStmt->bind_param("ss", $hashedPassword, $email);
    $success = $updateStmt->execute();

    if (!$success) {
        throw new Exception("Gagal update password: " . $koneksi->error);
    }

    // Delete used token
    $deleteStmt = $koneksi->prepare("DELETE FROM password_reset WHERE token = ?");
    if (!$deleteStmt) {
        throw new Exception("Database error: " . $koneksi->error);
    }
    
    $deleteStmt->bind_param("s", $token);
    $deleteStmt->execute();

    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Password berhasil diubah. Silahkan login dengan password baru.'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()
    ]);
    
} finally {
    // Make sure to close database connection
    if (isset($koneksi)) {
        $koneksi->close();
    }
}