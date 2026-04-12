-- SQL Server Schemas

-- Users Table
CREATE TABLE Users (
  id INT PRIMARY KEY IDENTITY(1,1),
  name NVARCHAR(100) NOT NULL,
  email NVARCHAR(100) UNIQUE NOT NULL,
  role NVARCHAR(20) NOT NULL -- 'admin', 'architect', 'client'
);

-- Materials Table
CREATE TABLE Materials (
  id INT PRIMARY KEY IDENTITY(1,1),
  name NVARCHAR(100) NOT NULL,
  cost_per_unit DECIMAL(10,2) NOT NULL,
  unit NVARCHAR(20) NOT NULL
);

-- Projects Table
CREATE TABLE Projects (
  id INT PRIMARY KEY IDENTITY(1,1),
  name NVARCHAR(100) NOT NULL,
  status NVARCHAR(20) NOT NULL, -- 'pending', 'in_process', 'completed'
  architect_id INT,
  client_id INT,
  FOREIGN KEY (architect_id) REFERENCES Users(id),
  FOREIGN KEY (client_id) REFERENCES Users(id)
);

-- Budgets Table
CREATE TABLE Budgets (
  id INT PRIMARY KEY IDENTITY(1,1),
  project_id INT NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (project_id) REFERENCES Projects(id)
);

-- Plan Versions Table (for managing versions)
CREATE TABLE PlanVersions (
  id INT PRIMARY KEY IDENTITY(1,1),
  project_id INT NOT NULL,
  version_number INT NOT NULL,
  file_path NVARCHAR(255),
  uploaded_at DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (project_id) REFERENCES Projects(id)
);