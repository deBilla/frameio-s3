variable "region" {
  default = "us-east-1"
}

variable "instance_type" {
  default = "t2.micro"
}

variable "key_name" {
  description = "SSH Key Name"
  type        = string
}

variable "repository_url" {
  default = "https://github.com/deBilla/frameio-s3.git"
}

variable "iam_role_name" {
  description = "IAM Role for EC2 S3 Name"
  type        = string
}