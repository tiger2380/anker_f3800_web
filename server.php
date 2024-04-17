<?php

$input = file_get_contents('php://input');
$decoded = json_decode($input, true);

// connect to pdo database
$pdo = new PDO('mysql:host=localhost;dbname=bluetti', 'bluetti', 'bluetti123');

// insert into database
$statement = $pdo->prepare("INSERT INTO `log` (`ac_input_power`, `ac_output_power`, `dc_input_power`, `battery`, `created_at`) VALUES (:ac_input_power, :ac_output_power, :dc_input_power, :battery, :time)");
$statement->execute(array(
    "ac_input_power" => $decoded['ac_input'],
    "ac_output_power" => $decoded['ac_output'],
    "dc_input_power" => $decoded['dc_input'],
    "battery" => $decoded['battery'],
    "time" => (new DateTime())->format('Y-m-d H:i:s')
));

// close pdo connection
$pdo = null;

// return success
echo json_encode(array(
    "success" => true
));