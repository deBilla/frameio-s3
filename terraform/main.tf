provider "aws" {
  region = var.region
}

# Define the EC2 Instance
resource "aws_instance" "example" {
  ami           = "ami-0427090fd1714168b" # Amazon Linux 2 AMI (adjust based on your region)
  instance_type = var.instance_type
  key_name      = var.key_name
  iam_instance_profile = aws_iam_instance_profile.ec2_s3_instance_profile.name
  security_groups = ["launch-wizard-6"]

  user_data = <<-EOF
              #!/bin/bash
              sudo yum update -y
              sudo yum install git -y
              curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash

              echo 'export NVM_DIR="$HOME/.nvm"' >> /home/ec2-user/.bashrc
              echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> /home/ec2-user/.bashrc
              source /home/ec2-user/.bashrc

              su - ec2-user -c 'nvm install node'
              su - ec2-user -c 'git clone ${var.repository_url}'
              EOF

  tags = {
    Name = "Terraform-EC2-1"
  }
}

# Define the IAM Instance Profile
resource "aws_iam_instance_profile" "ec2_s3_instance_profile" {
  name = "ec2-s3-instance-profile"
  role = var.iam_role_name
}

# Define Outputs
output "instance_id" {
  value = aws_instance.example.id
}

output "public_ip" {
  value = aws_instance.example.public_ip
}

# Define the EC2 2nd Instance
resource "aws_instance" "example2" {
  ami           = "ami-0427090fd1714168b" # Amazon Linux 2 AMI (adjust based on your region)
  instance_type = var.instance_type
  key_name      = var.key_name
  iam_instance_profile = aws_iam_instance_profile.ec2_s3_instance_profile.name
  security_groups = ["launch-wizard-6"]

  user_data = <<-EOF
              #!/bin/bash
              sudo yum update -y
              sudo yum install git -y
              curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash

              echo 'export NVM_DIR="$HOME/.nvm"' >> /home/ec2-user/.bashrc
              echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> /home/ec2-user/.bashrc
              source /home/ec2-user/.bashrc

              su - ec2-user -c 'nvm install node'
              su - ec2-user -c 'git clone ${var.repository_url}'
              EOF

  tags = {
    Name = "Terraform-EC2-2"
  }
}

# Define Outputs
output "instance_id_2" {
  value = aws_instance.example2.id
}

output "public_ip_2" {
  value = aws_instance.example2.public_ip
}

# Define the EC2 3rd Instance
resource "aws_instance" "example3" {
  ami           = "ami-0427090fd1714168b" # Amazon Linux 2 AMI (adjust based on your region)
  instance_type = var.instance_type
  key_name      = var.key_name
  iam_instance_profile = aws_iam_instance_profile.ec2_s3_instance_profile.name
  security_groups = ["launch-wizard-6"]

  user_data = <<-EOF
              #!/bin/bash
              sudo yum update -y
              sudo yum install git -y
              curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash

              echo 'export NVM_DIR="$HOME/.nvm"' >> /home/ec2-user/.bashrc
              echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> /home/ec2-user/.bashrc
              source /home/ec2-user/.bashrc

              su - ec2-user -c 'nvm install node'
              su - ec2-user -c 'git clone ${var.repository_url}'
              EOF

  tags = {
    Name = "Terraform-EC2-3"
  }
}

# Define Outputs
output "instance_id_3" {
  value = aws_instance.example3.id
}

output "public_ip_3" {
  value = aws_instance.example3.public_ip
}

# Define the EC2 4th Instance
resource "aws_instance" "example4" {
  ami           = "ami-0427090fd1714168b" # Amazon Linux 2 AMI (adjust based on your region)
  instance_type = var.instance_type
  key_name      = var.key_name
  iam_instance_profile = aws_iam_instance_profile.ec2_s3_instance_profile.name
  security_groups = ["launch-wizard-6"]

  user_data = <<-EOF
              #!/bin/bash
              sudo yum update -y
              sudo yum install git -y
              curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash

              echo 'export NVM_DIR="$HOME/.nvm"' >> /home/ec2-user/.bashrc
              echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> /home/ec2-user/.bashrc
              source /home/ec2-user/.bashrc

              su - ec2-user -c 'nvm install node'
              su - ec2-user -c 'git clone ${var.repository_url}'
              EOF

  tags = {
    Name = "Terraform-EC2-4"
  }
}

# Define Outputs
output "instance_id_4" {
  value = aws_instance.example4.id
}

output "public_ip_4" {
  value = aws_instance.example4.public_ip
}