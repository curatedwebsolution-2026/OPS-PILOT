# Terraform AWS Infrastructure Manifest for OPS PILOT

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  default = "us-east-1"
}

# VPC & Networking
resource "aws_vpc" "opspilot_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags = {
    Name = "opspilot-vpc"
  }
}

# RDS PostgreSQL Instance (pgvector enabled)
resource "aws_db_instance" "opspilot_db" {
  allocated_storage    = 20
  engine               = "postgres"
  engine_version       = "16.1"
  instance_class       = "db.t4g.micro"
  db_name              = "opspilot"
  username             = "opspilot_admin"
  password             = "SuperSecretDBPassword123!"
  skip_final_snapshot  = true
}

# ElastiCache Redis Cluster
resource "aws_elasticache_cluster" "opspilot_redis" {
  cluster_id           = "opspilot-redis"
  engine               = "redis"
  node_type            = "cache.t4g.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
}
