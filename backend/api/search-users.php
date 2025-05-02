<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Sesuaikan path ke db.php sesuai struktur folder
require_once "../server/db.php";

// Handle OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Validasi parameter search
    if (!isset($_GET['search'])) {
        http_response_code(400);
        echo json_encode(["error" => "Parameter pencarian diperlukan"]);
        exit;
    }

    // Validasi koneksi database
    if (!isset($koneksi) || $koneksi->connect_error) {
        throw new Exception("Koneksi database gagal: " . ($koneksi->connect_error ?? "Variabel koneksi tidak terdefinisi"));
    }

    $search = trim($_GET['search']);
    
    // Prepare statement dengan parameter terpisah
    $sql = "SELECT 
            user_id, 
            nama_lengkap, 
            no_telepon, 
            email 
        FROM users 
        WHERE 
            user_id = ? OR 
            nama_lengkap LIKE CONCAT('%', ?, '%') OR 
            no_telepon LIKE CONCAT('%', ?, '%')
        LIMIT 10";

    $stmt = $koneksi->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Error dalam menyiapkan statement: " . $koneksi->error);
    }

    $stmt->bind_param("sss", $search, $search, $search);
    
    if (!$stmt->execute()) {
        throw new Exception("Error dalam eksekusi query: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    $users = [];

    while ($row = $result->fetch_assoc()) {
        // Validasi dan format data
        $users[] = [
            'user_id' => (int)$row['user_id'],
            'nama_lengkap' => $row['nama_lengkap'],
            'no_telepon' => $row['no_telepon'] ?? '',
            'email' => $row['email'] ?? ''
        ];
    }

    http_response_code(200);
    echo json_encode($users);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Terjadi kesalahan server",
        "message" => $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
    if (isset($koneksi) && $koneksi instanceof mysqli) {
        $koneksi->close();
    }
}
?>