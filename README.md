# ClamAV serverless virus scanner

## Introduction

An AWS lambda based virus scanner, got triggered when an object created in AWS S3, scan using the ClamAV.

![diagram](https://user-images.githubusercontent.com/40386980/200553651-17eef2eb-af71-47e0-80d9-2e2f003ae97d.jpg)

[ClamAV](https://www.clamav.net/), an open -source anti-virus engine. 

The current Docker build is based on ClamAV version 0.103.x (LTS), for version details check [version support Matrix](https://docs.clamav.net/faq/faq-eol.html#version-support-matrix)

## Prerequisite

- Serverless framework [https://www.serverless.com/framework/docs/getting-started]
- Docker Desktop 


### 1 Run from the local machine

1. Run `docker build -t clamav-lambda .` to build the clamav-lambda Docker image

2. Run the command after replacing the profile name and region name `serverless deploy --aws-profile <profile name> --region <region name>`.



### 2 Remove the deployment

1. Make sure the S3 bucket (ds-xx-myc-files) and the ECR (serverless-clamav-virus-scan-xx) are empty.
2. Run the command after replacing the profile name and region name `serverless remove --aws-profile <profile name> --region <region name>`.


