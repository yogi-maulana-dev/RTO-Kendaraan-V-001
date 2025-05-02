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

    if (empty($data['token'])) {
        throw new Exception("Token verifikasi harus diisi");
    }

    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Format email tidak valid");
    }

    // Periksa token verifikasi
    $checkToken = $conn->prepare("
        SELECT * FROM email_verification 
        WHERE email = ? AND token = ? AND expires_at > NOW()
    ");
    
    if (!$checkToken) {
        throw new Exception("Database error: " . $conn->error);
    }
    
    $checkToken->bind_param("ss", $data['email'], $data['token']);
    $checkToken->execute();
    $result = $checkToken->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception("Token verifikasi tidak valid atau sudah kadaluarsa");
    }
    
    $checkToken->close();

    // Transaction start
    $conn->begin_transaction();

    try {
        // Update status verifikasi pengguna
        $updateUser = $conn->prepare("
            UPDATE users 
            SET is_verified = 1 
            WHERE email = ? AND is_verified = 0
        ");
        
        if (!$updateUser) {
            throw new Exception("Database error: " . $conn->error);
        }
        
        $updateUser->bind_param("s", $data['email']);
        $updateUser->execute();
        
        if ($updateUser->affected_rows === 0) {
            // Pengguna sudah diverifikasi atau tidak ditemukan
            $checkUser = $conn->prepare("SELECT is_verified FROM users WHERE email = ?");
            $checkUser->bind_param("s", $data['email']);
            $checkUser->execute();
            $userResult = $checkUser->get_result();
            
            if ($userResult->num_rows === 0) {
                throw new Exception("Pengguna dengan email tersebut tidak ditemukan");
            }
            
            $userData = $userResult->fetch_assoc();
            if ($userData['is_verified'] == 1) {
                $response = [
                    'success' => true,
                    'message' => 'Akun sudah diverifikasi sebelumnya'
                ];
                $conn->commit();
                echo json_encode($response);
                exit;
            } else {
                throw new Exception("Gagal memverifikasi akun");
            }
        }
        
        $updateUser->close();

        // Hapus token verifikasi yang sudah digunakan
        $deleteToken = $conn->prepare("DELETE FROM email_verification WHERE email = ?");
        
        if (!$deleteToken) {
            throw new Exception("Database error: " . $conn->error);
        }
        
        $deleteToken->bind_param("s", $data['email']);
        $deleteToken->execute();
        $deleteToken->close();

        $conn->commit();

        $response = [
            'success' => true,
            'message' => 'Akun berhasil diverifikasi! Silakan login dengan email dan password Anda'
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