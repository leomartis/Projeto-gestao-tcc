CREATE DATABASE IF NOT EXISTS gestao_jeans CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gestao_jeans;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agenda (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  data DATE NOT NULL,
  hora TIME NOT NULL,
  local VARCHAR(255) NOT NULL,
  responsavel VARCHAR(255) NOT NULL,
  tipo ENUM('Reunião','Entrega','Ligação','Tarefa','Outro') NOT NULL,
  status ENUM('Agendado','Concluído','Cancelado','Atrasado') NOT NULL
);

CREATE TABLE IF NOT EXISTS financeiro (
  id INT AUTO_INCREMENT PRIMARY KEY,
  descricao VARCHAR(255) NOT NULL,
  tipo ENUM('Receita','Despesa','Investimento') NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  vencimento DATE NOT NULL,
  valor DECIMAL(12,2) NOT NULL,
  status ENUM('Pago','Pendente','Vencido') NOT NULL
);

CREATE TABLE IF NOT EXISTS pessoas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  tipo ENUM('Cliente','Fornecedor','Colaborador') NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefone VARCHAR(50) NOT NULL,
  cidade VARCHAR(255) NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS estoque (
  id INT AUTO_INCREMENT PRIMARY KEY,
  referencia VARCHAR(100) NOT NULL,
  cor VARCHAR(50) NOT NULL,
  quantidade INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS producao (
  id INT AUTO_INCREMENT PRIMARY KEY,
  data DATE NOT NULL,
  firma VARCHAR(255) NOT NULL,
  discriminacao VARCHAR(255) NOT NULL,
  nCorte VARCHAR(100) NOT NULL,
  qtdEnviada INT NOT NULL DEFAULT 0,
  qtdRecebida INT NOT NULL DEFAULT 0,
  precoPeca DECIMAL(10,2) NOT NULL DEFAULT 0
);
