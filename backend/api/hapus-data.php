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

// Log received data for debugging
error_log("Received data: " . $input);

// For DELETE requests, parse the data
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode($input, true);
    
    // If parsing fails, check if data was sent in other formats
    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log("JSON parsing error: " . json_last_error_msg());
        
        // Try to get data from $_REQUEST as fallback
        if (isset($_REQUEST['user_id'])) {
            $data = ['user_id' => $_REQUEST['user_id']];
        }
    }
    
    // Validate ID
    if (!isset($data['user_id'])) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "ID tidak ditemukan"
        ]);
        exit();
    }
    
    $id = intval($data['user_id']);
    error_log("Attempting to delete user with ID: " . $id);
    
    $query = "DELETE FROM users WHERE user_id = ?";
    $stmt = $koneksi->prepare($query);
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        // Check if any rows were affected
        if ($stmt->affected_rows > 0) {
            echo json_encode([
                "success" => true,
                "message" => "Data berhasil dihapus"
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Data tidak ditemukan atau sudah dihapus"
            ]);
        }
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Gagal menghapus data: " . $stmt->error
        ]);
    }
    
    $stmt->close();
} else {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Method not allowed"
    ]);
}

$koneksi->close();

?>